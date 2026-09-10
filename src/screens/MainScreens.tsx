import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteName } from '../../App';
import { BottomNav, CategoryBar, Field, formatMoney, Page, PrimaryButton, thaiMonthYear, TopTabs, TransactionRow } from '../components/UI';
import { useApp } from '../context/AppContext';
import { colors, shadow } from '../theme';
import { Transaction, TransactionType } from '../types';

type NavProps = { navigate: (route: RouteName) => void; onAdd: () => void };
const categoryColors = [colors.expense, colors.orange, colors.purple, colors.blue, '#00A896'];

export function DashboardScreen({ navigate, onAdd, onEdit }: NavProps & { onEdit: (id: string) => void }) {
  const { currentUser, transactions, deleteTransaction } = useApp();
  const income = sum(transactions.filter((item) => item.type === 'income'));
  const expense = sum(transactions.filter((item) => item.type === 'expense'));
  const categories = aggregateCategories(transactions.filter((item) => item.type === 'expense'));
  const maxCategory = Math.max(...categories.map((item) => item.value), 1);
  const ratio = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0;

  return <>
    <Page title="Expense Tracker" subtitle={`สวัสดี ${currentUser?.name ?? ''} 👋`} onProfile={() => navigate('profile')}>
      <TopTabs active="dashboard" navigate={navigate} />
      <View style={styles.monthCard}><Text style={styles.monthLabel}>สรุปรายรับ–รายจ่าย</Text><Text style={styles.monthText}>{thaiMonthYear()}</Text></View>
      <View style={styles.balanceCard}><Text style={styles.balanceLabel}>ยอดเงินคงเหลือ</Text><Text style={styles.balance}>฿ {formatMoney(income - expense)}</Text><View style={styles.balanceLine}><Text style={styles.balanceHint}>ใช้รายรับไปแล้ว {ratio}%</Text><Text style={styles.balanceHint}>{transactions.length} รายการ</Text></View><View style={styles.ratioTrack}><View style={[styles.ratioFill, { width: `${ratio}%` as `${number}%` }]} /></View></View>
      <View style={styles.summaryRow}><Stat label="รายรับ" value={income} color={colors.income} icon="↗" /><Stat label="รายจ่าย" value={expense} color={colors.expense} icon="↘" /><Stat label="คงเหลือ" value={income - expense} color={colors.navy} icon="฿" /></View>
      <View style={styles.card}><View style={styles.cardHeader}><Text style={styles.sectionTitle}>รายจ่ายตามหมวดหมู่</Text><Text style={styles.cardMeta}>{categories.length} หมวดหมู่</Text></View>{categories.length ? categories.slice(0, 4).map((item, index) => <CategoryBar key={item.label} label={item.label} value={item.value} max={maxCategory} color={categoryColors[index % categoryColors.length]} />) : <Empty text="ยังไม่มีข้อมูลรายจ่าย" />}</View>
      <View style={styles.card}><View style={styles.cardHeader}><Text style={styles.sectionTitle}>รายการล่าสุด</Text><Pressable onPress={() => navigate('history')}><Text style={styles.link}>ดูทั้งหมด</Text></Pressable></View>{transactions.slice(0, 4).map((item) => <TransactionRow key={item.id} item={item} onEdit={() => onEdit(item.id)} onDelete={() => deleteTransaction(item.id)} />)}{transactions.length === 0 ? <Empty text="ยังไม่มีรายการ" /> : null}</View>
    </Page>
    <BottomNav active="dashboard" navigate={navigate} onAdd={onAdd} />
  </>;
}

export function HistoryScreen({ navigate, onAdd, onEdit }: NavProps & { onEdit: (id: string) => void }) {
  const { transactions, deleteTransaction } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | TransactionType>('all');
  const filtered = transactions.filter((item) => (filter === 'all' || item.type === filter) && `${item.title} ${item.note} ${item.category}`.toLowerCase().includes(query.toLowerCase()));

  return <>
    <Page title="รายการรายรับ–รายจ่าย" subtitle="ค้นหา แก้ไข และลบรายการ" onProfile={() => navigate('profile')}>
      <TopTabs active="history" navigate={navigate} />
      <View style={styles.card}><Field label="ค้นหารายการ" value={query} onChangeText={setQuery} placeholder="ค้นหาชื่อ หมวดหมู่ หรือหมายเหตุ..." /><View style={styles.filterRow}><Filter label="ทั้งหมด" active={filter === 'all'} onPress={() => setFilter('all')} /><Filter label="รายรับ" active={filter === 'income'} onPress={() => setFilter('income')} /><Filter label="รายจ่าย" active={filter === 'expense'} onPress={() => setFilter('expense')} /></View></View>
      <Text style={styles.resultText}>พบ {filtered.length} รายการ</Text>
      <View style={styles.card}>{filtered.map((item) => <TransactionRow key={item.id} item={item} onEdit={() => onEdit(item.id)} onDelete={() => deleteTransaction(item.id)} />)}{filtered.length === 0 ? <Empty text="ไม่พบรายการที่ค้นหา" /> : null}</View>
    </Page>
    <BottomNav active="history" navigate={navigate} onAdd={onAdd} />
  </>;
}

export function TransactionFormScreen({ editingId, onClose }: { editingId?: string; onClose: () => void }) {
  const { transactions, saveTransaction } = useApp();
  const editing = transactions.find((item) => item.id === editingId);
  const [title, setTitle] = useState(editing?.title ?? '');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [type, setType] = useState<TransactionType>(editing?.type ?? 'expense');
  const [category, setCategory] = useState(editing?.category ?? 'อาหาร');
  const [date, setDate] = useState(editing?.date ?? new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(editing?.time ?? new Date().toTimeString().slice(0, 5));
  const [note, setNote] = useState(editing?.note ?? '');
  const [error, setError] = useState('');
  const categories = type === 'income' ? ['เงินเดือน', 'โบนัส', 'ขายของ', 'ลงทุน', 'อื่น ๆ'] : ['อาหาร', 'เดินทาง', 'ช้อปปิ้ง', 'จ่ายบิล', 'บันเทิง', 'อื่น ๆ'];

  const changeType = (next: TransactionType) => { setType(next); setCategory(next === 'income' ? 'เงินเดือน' : 'อาหาร'); };
  const submit = () => {
    const numericAmount = Number(amount.replace(/,/g, ''));
    if (!title.trim()) return setError('กรุณากรอกชื่อรายการ');
    if (!numericAmount || numericAmount <= 0) return setError('กรุณากรอกจำนวนเงินให้ถูกต้อง');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('วันที่ต้องเป็นรูปแบบ YYYY-MM-DD');
    saveTransaction({ title: title.trim(), amount: numericAmount, type, category, note: note.trim(), date, time }, editingId);
    onClose();
  };

  return <Page title={editing ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'} subtitle="บันทึกรายรับ–รายจ่าย" footer={false}>
    <View style={styles.balanceMini}><Text style={styles.balanceMiniLabel}>ยอดคงเหลือปัจจุบัน</Text><Text style={styles.balanceMiniValue}>฿ {formatMoney(sum(transactions.filter((i) => i.type === 'income')) - sum(transactions.filter((i) => i.type === 'expense')))}</Text></View>
    <View style={styles.card}>
      <Field label="ชื่อรายการ" value={title} onChangeText={setTitle} placeholder="เช่น ค่าอาหาร" />
      <Field label="จำนวนเงิน" value={amount} onChangeText={setAmount} placeholder="เช่น 150" keyboardType="numeric" />
      <Text style={styles.fieldLabel}>ประเภท</Text><View style={styles.typeRow}><TypeButton label="รายรับ" active={type === 'income'} color={colors.income} onPress={() => changeType('income')} /><TypeButton label="รายจ่าย" active={type === 'expense'} color={colors.expense} onPress={() => changeType('expense')} /></View>
      <Text style={styles.fieldLabel}>หมวดหมู่</Text><View style={styles.chipWrap}>{categories.map((item) => <Pressable key={item} style={[styles.chip, category === item && styles.chipActive]} onPress={() => setCategory(item)}><Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text></Pressable>)}</View>
      <View style={styles.split}><View style={styles.half}><Field label="วันที่" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" /></View><View style={styles.half}><Field label="เวลา" value={time} onChangeText={setTime} placeholder="HH:MM" /></View></View>
      <Field label="หมายเหตุ" value={note} onChangeText={setNote} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" multiline />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label={editing ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'} onPress={submit} />
      <Pressable style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>ยกเลิก</Text></Pressable>
    </View>
  </Page>;
}

export function YearSummaryScreen({ navigate, onAdd }: NavProps) {
  const { transactions } = useApp();
  const year = new Date().getFullYear();
  const yearItems = transactions.filter((item) => Number(item.date.slice(0, 4)) === year);
  const income = sum(yearItems.filter((item) => item.type === 'income'));
  const expense = sum(yearItems.filter((item) => item.type === 'expense'));
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => {
    const monthItems = yearItems.filter((item) => Number(item.date.slice(5, 7)) === index + 1);
    return { label: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][index], income: sum(monthItems.filter((item) => item.type === 'income')), expense: sum(monthItems.filter((item) => item.type === 'expense')) };
  }), [yearItems]);
  const max = Math.max(...months.flatMap((m) => [m.income, m.expense]), 1);

  return <>
    <Page title="สรุปรวมรายปี" subtitle={`ภาพรวมปี ${year + 543}`} onProfile={() => navigate('profile')}>
      <TopTabs active="year" navigate={navigate} />
      <View style={styles.summaryRow}><Stat label="รายรับ/ปี" value={income} color={colors.income} icon="↗" /><Stat label="รายจ่าย/ปี" value={expense} color={colors.expense} icon="↘" /></View>
      <View style={styles.summaryRow}><InfoCard label="รายรับเฉลี่ย/เดือน" value={income / 12} /><InfoCard label="รายจ่ายเฉลี่ย/เดือน" value={expense / 12} /></View>
      <View style={styles.card}><View style={styles.cardHeader}><Text style={styles.sectionTitle}>รายรับ–รายจ่ายรายเดือน</Text><View style={styles.legend}><Text style={styles.incomeLegend}>● รายรับ</Text><Text style={styles.expenseLegend}>● รายจ่าย</Text></View></View><View style={styles.chart}>{months.map((month) => <View key={month.label} style={styles.chartColumn}><View style={styles.bars}><View style={[styles.chartBar, { height: Math.max(3, (month.income / max) * 135), backgroundColor: colors.income }]} /><View style={[styles.chartBar, { height: Math.max(3, (month.expense / max) * 135), backgroundColor: colors.expense }]} /></View><Text style={styles.chartLabel}>{month.label}</Text></View>)}</View></View>
      <View style={styles.card}><Text style={styles.sectionTitle}>ยอดรวมปีนี้</Text><SummaryLine label="รายรับทั้งหมด" value={income} color={colors.income} /><SummaryLine label="รายจ่ายทั้งหมด" value={expense} color={colors.expense} /><SummaryLine label="เงินคงเหลือ" value={income - expense} color={colors.navy} /></View>
    </Page>
    <BottomNav active="year" navigate={navigate} onAdd={onAdd} />
  </>;
}

export function ProfileScreen({ navigate }: { navigate: (route: RouteName) => void }) {
  const { currentUser, updateProfile, signOut, transactions } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const save = async () => { if (name.trim() && email.includes('@')) { await updateProfile({ name: name.trim(), email: email.trim() }); setEditing(false); } };

  return <Page title="โปรไฟล์" subtitle="ข้อมูลบัญชีของคุณ" footer={false}>
    <View style={styles.profileHero}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{(currentUser?.name ?? 'U').slice(0, 1).toUpperCase()}</Text></View><Text style={styles.profileName}>{currentUser?.name}</Text><Text style={styles.profileEmail}>{currentUser?.email}</Text><Text style={styles.profileCount}>{transactions.length} รายการที่บันทึกไว้</Text></View>
    <View style={styles.card}><Text style={styles.sectionTitle}>Account settings</Text>{editing ? <><Field label="ชื่อผู้ใช้" value={name} onChangeText={setName} /><Field label="อีเมล" value={email} onChangeText={setEmail} autoCapitalize="none" /><PrimaryButton label="บันทึกโปรไฟล์" onPress={save} /><Pressable style={styles.cancel} onPress={() => setEditing(false)}><Text style={styles.cancelText}>ยกเลิก</Text></Pressable></> : <><ProfileLine label="Username" value={currentUser?.name ?? '-'} /><ProfileLine label="Email" value={currentUser?.email ?? '-'} /><PrimaryButton label="แก้ไขโปรไฟล์" onPress={() => setEditing(true)} /></>}</View>
    <View style={styles.profileButtons}><PrimaryButton label="กลับหน้าหลัก" onPress={() => navigate('dashboard')} /><PrimaryButton label="ออกจากระบบ" tone="red" onPress={signOut} /></View>
  </Page>;
}

function sum(items: Transaction[]) { return items.reduce((total, item) => total + item.amount, 0); }
function aggregateCategories(items: Transaction[]) { const values: Record<string, number> = {}; items.forEach((item) => { values[item.category] = (values[item.category] ?? 0) + item.amount; }); return Object.entries(values).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value); }
function Stat({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) { return <View style={styles.stat}><Text style={[styles.statIcon, { color }]}>{icon}</Text><Text style={styles.statLabel}>{label}</Text><Text style={[styles.statValue, { color }]}>฿{formatMoney(value)}</Text></View>; }
function InfoCard({ label, value }: { label: string; value: number }) { return <View style={styles.infoCard}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>฿{formatMoney(value)}</Text></View>; }
function Empty({ text }: { text: string }) { return <Text style={styles.empty}>{text}</Text>; }
function Filter({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable style={[styles.filter, active && styles.filterActive]} onPress={onPress}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>; }
function TypeButton({ label, active, color, onPress }: { label: string; active: boolean; color: string; onPress: () => void }) { return <Pressable style={[styles.typeButton, active && { backgroundColor: color }]} onPress={onPress}><Text style={[styles.typeText, active && { color: colors.white }]}>{label}</Text></Pressable>; }
function SummaryLine({ label, value, color }: { label: string; value: number; color: string }) { return <View style={styles.summaryLine}><Text style={styles.summaryLineLabel}>{label}</Text><Text style={[styles.summaryLineValue, { color }]}>฿{formatMoney(value)}</Text></View>; }
function ProfileLine({ label, value }: { label: string; value: string }) { return <View style={styles.profileLine}><View><Text style={styles.profileLineLabel}>{label}</Text><Text style={styles.profileLineValue}>{value}</Text></View></View>; }

const styles = StyleSheet.create({
  monthCard: { marginBottom: 14 }, monthLabel: { color: colors.ink, fontSize: 20, fontWeight: '800' }, monthText: { color: colors.muted, fontSize: 13, marginTop: 4 },
  balanceCard: { backgroundColor: colors.navy, borderRadius: 18, padding: 21, ...shadow }, balanceLabel: { color: '#C9D2EC', fontSize: 13 }, balance: { color: colors.white, fontSize: 29, fontWeight: '800', marginTop: 8 }, balanceLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }, balanceHint: { color: '#C9D2EC', fontSize: 10 }, ratioTrack: { height: 6, borderRadius: 6, backgroundColor: '#31457A', marginTop: 8, overflow: 'hidden' }, ratioFill: { height: 6, backgroundColor: colors.expense, borderRadius: 6 },
  summaryRow: { flexDirection: 'row', gap: 10, marginTop: 14 }, stat: { flex: 1, minWidth: 0, backgroundColor: colors.white, borderRadius: 15, padding: 13, ...shadow }, statIcon: { fontSize: 16, fontWeight: '800' }, statLabel: { color: colors.muted, fontSize: 10, marginTop: 6 }, statValue: { fontSize: 12, fontWeight: '800', marginTop: 5 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginTop: 16, ...shadow }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' }, cardMeta: { color: colors.muted, fontSize: 11 }, link: { color: colors.blue, fontSize: 12, fontWeight: '700' }, empty: { textAlign: 'center', color: colors.muted, fontSize: 13, paddingVertical: 24 },
  filterRow: { flexDirection: 'row', gap: 8 }, filter: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 9, backgroundColor: colors.input }, filterActive: { backgroundColor: colors.navy }, filterText: { color: colors.muted, fontSize: 12, fontWeight: '600' }, filterTextActive: { color: colors.white }, resultText: { color: colors.muted, fontSize: 12, marginTop: 16, marginLeft: 3 },
  balanceMini: { backgroundColor: colors.navy, borderRadius: 16, padding: 18, marginBottom: 2 }, balanceMiniLabel: { color: '#C9D2EC', fontSize: 12 }, balanceMiniValue: { color: colors.white, fontSize: 24, fontWeight: '800', marginTop: 6 }, fieldLabel: { color: colors.text, fontSize: 13, fontWeight: '600', marginBottom: 7 }, typeRow: { flexDirection: 'row', gap: 10, marginBottom: 15 }, typeButton: { flex: 1, backgroundColor: colors.input, borderRadius: 10, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, typeText: { color: colors.muted, fontSize: 13, fontWeight: '700' }, chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }, chip: { paddingHorizontal: 13, paddingVertical: 9, backgroundColor: colors.input, borderRadius: 18 }, chipActive: { backgroundColor: colors.navy }, chipText: { color: colors.muted, fontSize: 12 }, chipTextActive: { color: colors.white, fontWeight: '700' }, split: { flexDirection: 'row', gap: 10 }, half: { flex: 1 }, error: { color: colors.expense, fontSize: 12, marginBottom: 12 }, cancel: { alignItems: 'center', paddingVertical: 13 }, cancelText: { color: colors.muted, fontSize: 13 },
  infoCard: { flex: 1, backgroundColor: colors.white, borderRadius: 15, padding: 15, ...shadow }, infoLabel: { color: colors.muted, fontSize: 10 }, infoValue: { color: colors.navy, fontSize: 14, fontWeight: '800', marginTop: 7 }, legend: { flexDirection: 'row', gap: 9 }, incomeLegend: { color: colors.income, fontSize: 9 }, expenseLegend: { color: colors.expense, fontSize: 9 }, chart: { height: 180, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 18, borderBottomWidth: 1, borderBottomColor: colors.line }, chartColumn: { flex: 1, alignItems: 'center' }, bars: { height: 145, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }, chartBar: { width: 5, borderTopLeftRadius: 3, borderTopRightRadius: 3 }, chartLabel: { color: colors.muted, fontSize: 7, marginTop: 6, marginBottom: 5 }, summaryLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line }, summaryLineLabel: { color: colors.muted, fontSize: 12 }, summaryLineValue: { fontSize: 13, fontWeight: '800' },
  profileHero: { alignItems: 'center', paddingVertical: 12 }, profileAvatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', ...shadow }, profileAvatarText: { color: colors.white, fontSize: 38, fontWeight: '800' }, profileName: { color: colors.ink, fontSize: 21, fontWeight: '800', marginTop: 13 }, profileEmail: { color: colors.muted, fontSize: 13, marginTop: 4 }, profileCount: { color: colors.purple, fontSize: 11, fontWeight: '700', marginTop: 9 }, profileLine: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line, marginBottom: 8 }, profileLineLabel: { color: colors.muted, fontSize: 10 }, profileLineValue: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 4 }, profileButtons: { gap: 10, marginTop: 16 },
});
