import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from '../services/firebase';
import { Transaction, UserProfile } from '../types';

type AppContextValue = {
  ready: boolean;
  currentUser: UserProfile | null;
  transactions: Transaction[];
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  saveTransaction: (transaction: Omit<Transaction, 'id'>, id?: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

function getAuthError(error: unknown) {
  const code = error instanceof FirebaseError
    ? error.code
    : error instanceof Error
      ? error.message
      : String(error);
  console.error('Firebase authentication error:', error);
  switch (code) {
    case 'auth/email-already-in-use': return 'อีเมลนี้ถูกสมัครใช้งานแล้ว';
    case 'auth/invalid-email': return 'รูปแบบอีเมลไม่ถูกต้อง';
    case 'auth/invalid-credential': return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    case 'auth/weak-password': return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    case 'auth/network-request-failed': return 'เชื่อมต่ออินเทอร์เน็ตไม่ได้';
    case 'auth/too-many-requests': return 'ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่';
    default: return 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง';
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    let stopTransactions = () => {};

    const stopAuth = onAuthStateChanged(auth, async (user) => {
      stopTransactions();

      if (!user) {
        setCurrentUser(null);
        setTransactions([]);
        setReady(true);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        const fallbackProfile: UserProfile = {
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
        };
        const profile = snapshot.exists()
          ? snapshot.data() as UserProfile
          : fallbackProfile;

        if (!snapshot.exists()) await setDoc(userRef, profile);
        setCurrentUser(profile);

        const transactionQuery = query(
          collection(db, 'users', user.uid, 'transactions'),
          orderBy('date', 'desc'),
        );

        stopTransactions = onSnapshot(transactionQuery, (result) => {
          const next = result.docs
            .map((item) => ({ id: item.id, ...item.data() } as Transaction))
            .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
          setTransactions(next);
        }, (error) => console.error('Unable to load transactions', error));
      } catch (error) {
        console.error('Unable to load account', error);
      } finally {
        setReady(true);
      }
    });

    return () => {
      stopTransactions();
      stopAuth();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!email.includes('@')) return 'กรุณากรอกอีเมลให้ถูกต้อง';
    if (password.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      return null;
    } catch (error) {
      return getAuthError(error);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    if (!name.trim()) return 'กรุณากรอกชื่อผู้ใช้';
    if (!email.includes('@')) return 'กรุณากรอกอีเมลให้ถูกต้อง';
    if (password.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const profile = { name: name.trim(), email: result.user.email || email.trim().toLowerCase() };
      await Promise.all([
        updateFirebaseProfile(result.user, { displayName: profile.name }),
        setDoc(doc(db, 'users', result.user.uid), profile),
      ]);
      setCurrentUser(profile);
      return null;
    } catch (error) {
      return getAuthError(error);
    }
  };

  const signOut = async () => firebaseSignOut(auth);

  const updateProfile = async (profile: UserProfile) => {
    const user = auth.currentUser;
    if (!user) return;
    await Promise.all([
      updateFirebaseProfile(user, { displayName: profile.name }),
      setDoc(doc(db, 'users', user.uid), profile, { merge: true }),
    ]);
    setCurrentUser(profile);
  };

  const saveTransaction = async (transaction: Omit<Transaction, 'id'>, id?: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const transactionsRef = collection(db, 'users', user.uid, 'transactions');
    const transactionRef = id ? doc(transactionsRef, id) : doc(transactionsRef);
    await setDoc(transactionRef, { ...transaction, updatedAt: serverTimestamp() }, { merge: true });
  };

  const deleteTransaction = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
  };

  const value = useMemo(() => ({
    ready,
    currentUser,
    transactions,
    signIn,
    signUp,
    signOut,
    updateProfile,
    saveTransaction,
    deleteTransaction,
  }), [ready, currentUser, transactions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
