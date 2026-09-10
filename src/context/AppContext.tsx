import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Transaction, UserProfile } from '../types';

const TRANSACTIONS_KEY = 'expense-tracker-transactions';
const USER_KEY = 'expense-tracker-user';
const SESSION_KEY = 'expense-tracker-session';
const today = new Date().toISOString().slice(0, 10);
const initialTransactions: Transaction[] = [
  { id: '1', title: 'เงินเดือน', amount: 10000, type: 'income', category: 'เงินเดือน', note: 'รายรับประจำเดือน', date: today, time: '09:00' },
  { id: '2', title: 'ค่าอาหาร', amount: 5000, type: 'expense', category: 'อาหาร', note: 'ค่าอาหารประจำเดือน', date: today, time: '12:30' },
];

type AppContextValue = {
  ready: boolean; currentUser: UserProfile | null; transactions: Transaction[];
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>; updateProfile: (profile: UserProfile) => Promise<void>;
  saveTransaction: (transaction: Omit<Transaction, 'id'>, id?: string) => void; deleteTransaction: (id: string) => void;
};
const AppContext = createContext<AppContextValue | undefined>(undefined);

const normalizeTransaction = (item: Partial<Transaction>, index: number): Transaction => ({
  id: item.id ?? `${Date.now()}-${index}`, title: item.title ?? 'ไม่ระบุรายการ', amount: Number(item.amount) || 0,
  type: item.type === 'income' ? 'income' : 'expense', category: item.category ?? (item.type === 'income' ? 'อื่น ๆ' : 'อาหาร'),
  note: item.note ?? '', date: item.date ?? today, time: item.time ?? '09:00',
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  useEffect(() => {
    const load = async () => {
      try {
        const [savedTransactions, savedUser, savedSession] = await Promise.all([
          AsyncStorage.getItem(TRANSACTIONS_KEY), AsyncStorage.getItem(USER_KEY), AsyncStorage.getItem(SESSION_KEY),
        ]);
        if (savedTransactions) setTransactions((JSON.parse(savedTransactions) as Partial<Transaction>[]).map(normalizeTransaction));
        if (savedUser && savedSession === 'active') setCurrentUser(JSON.parse(savedUser) as UserProfile);
      } catch (error) { console.error('Unable to load app data', error); }
      finally { setReady(true); }
    };
    load();
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions)).catch(console.error);
  }, [transactions, ready]);

  const signIn = async (email: string, password: string) => {
    if (!email.includes('@')) return 'กรุณากรอกอีเมลให้ถูกต้อง';
    if (password.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    const saved = await AsyncStorage.getItem(USER_KEY);
    const profile = saved ? JSON.parse(saved) as UserProfile : { name: 'Group 8', email };
    await AsyncStorage.multiSet([[USER_KEY, JSON.stringify(profile)], [SESSION_KEY, 'active']]); setCurrentUser(profile); return null;
  };
  const signUp = async (name: string, email: string, password: string) => {
    if (!name.trim()) return 'กรุณากรอกชื่อผู้ใช้';
    if (!email.includes('@')) return 'กรุณากรอกอีเมลให้ถูกต้อง';
    if (password.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    const profile = { name: name.trim(), email: email.trim().toLowerCase() };
    await AsyncStorage.multiSet([[USER_KEY, JSON.stringify(profile)], [SESSION_KEY, 'active']]); setCurrentUser(profile); return null;
  };
  const signOut = async () => { await AsyncStorage.removeItem(SESSION_KEY); setCurrentUser(null); };
  const updateProfile = async (profile: UserProfile) => { await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile)); setCurrentUser(profile); };
  const saveTransaction = (transaction: Omit<Transaction, 'id'>, id?: string) => setTransactions((current) => id ? current.map((item) => item.id === id ? { ...transaction, id } : item) : [{ ...transaction, id: Date.now().toString() }, ...current]);
  const deleteTransaction = (id: string) => setTransactions((current) => current.filter((item) => item.id !== id));
  const value = useMemo(() => ({ ready, currentUser, transactions, signIn, signUp, signOut, updateProfile, saveTransaction, deleteTransaction }), [ready, currentUser, transactions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() { const context = useContext(AppContext); if (!context) throw new Error('useApp must be used inside AppProvider'); return context; }
