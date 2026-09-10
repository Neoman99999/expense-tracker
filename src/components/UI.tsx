import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { RouteName } from '../../App';
import { colors, shadow } from '../theme';
import { Transaction } from '../types';

export const formatMoney = (value: number) => value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const thaiMonthYear = (date = new Date()) => date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });

export function Header({ title, subtitle, onProfile }: { title: string; subtitle?: string; onProfile?: () => void }) {
  return (
    <View style={styles.header}>
      <View>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {onProfile ? <Pressable style={styles.avatar} onPress={onProfile}><Text style={styles.avatarText}>👤</Text></Pressable> : null}
    </View>
  );
}

export function Page({ children, title, subtitle, onProfile, footer = true }: { children: ReactNode; title: string; subtitle?: string; onProfile?: () => void; footer?: boolean }) {
  return (
    <View style={styles.page}>
      <Header title={title} subtitle={subtitle} onProfile={onProfile} />
      <ScrollView style={styles.sheet} contentContainerStyle={[styles.sheetContent, footer && styles.withFooter]} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

export function BottomNav({ active, navigate, onAdd }: { active: RouteName; navigate: (route: RouteName) => void; onAdd: () => void }) {
  const items: { route: RouteName; icon: string; label: string }[] = [
    { route: 'dashboard', icon: '⌂', label: 'สรุป' }, { route: 'history', icon: '≡', label: 'รายการ' }, { route: 'year', icon: '▥', label: 'รายปี' }, { route: 'profile', icon: '●', label: 'โปรไฟล์' },
  ];
  return (
    <View style={styles.bottomNav}>
      {items.slice(0, 2).map((item) => <NavItem key={item.route} {...item} active={active === item.route} onPress={() => navigate(item.route)} />)}
      <Pressable style={styles.fab} onPress={onAdd}><Text style={styles.fabText}>＋</Text></Pressable>
      {items.slice(2).map((item) => <NavItem key={item.route} {...item} active={active === item.route} onPress={() => navigate(item.route)} />)}
    </View>
  );
}

function NavItem({ icon, label, active, onPress }: { icon: string; label: string; active: boolean; onPress: () => void }) {
  return <Pressable style={styles.navItem} onPress={onPress}><Text style={[styles.navIcon, active && styles.navActive]}>{icon}</Text><Text style={[styles.navLabel, active && styles.navActive]}>{label}</Text></Pressable>;
}

export function PrimaryButton({ label, onPress, tone = 'navy' }: { label: string; onPress: () => void; tone?: 'navy' | 'red' | 'green' }) {
  return <Pressable style={({ pressed }) => [styles.button, tone === 'red' && styles.buttonRed, tone === 'green' && styles.buttonGreen, pressed && { opacity: 0.75 }]} onPress={onPress}><Text style={styles.buttonText}>{label}</Text></Pressable>;
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput style={styles.input} placeholderTextColor="#9BA2A8" {...props} /></View>;
}

export function TopTabs({ active, navigate }: { active: RouteName; navigate: (route: RouteName) => void }) {
  return <View style={styles.tabs}>{[['dashboard', 'สรุป'], ['history', 'รายการ'], ['year', 'สรุปรวม']].map(([route, label]) => <Pressable key={route} style={[styles.tab, active === route && styles.activeTab]} onPress={() => navigate(route as RouteName)}><Text style={[styles.tabText, active === route && styles.activeTabText]}>{label}</Text></Pressable>)}</View>;
}

export function TransactionRow({ item, onEdit, onDelete }: { item: Transaction; onEdit?: () => void; onDelete: () => void }) {
  const positive = item.type === 'income';
  return (
    <View style={styles.transactionRow}>
      <View style={[styles.typeDot, { backgroundColor: positive ? '#E5F9E9' : '#FFEAEA' }]}><Text>{positive ? '↗' : '↘'}</Text></View>
      <View style={styles.transactionInfo}><Text style={styles.transactionTitle}>{item.title}</Text><Text style={styles.transactionMeta}>{item.category} · {item.date} {item.time}</Text>{item.note ? <Text style={styles.transactionNote}>{item.note}</Text> : null}</View>
      <View style={styles.transactionEnd}><Text style={[styles.amount, { color: positive ? colors.income : colors.expense }]}>{positive ? '+' : '-'} ฿{formatMoney(item.amount)}</Text><View style={styles.actionRow}>{onEdit ? <Pressable onPress={onEdit}><Text style={styles.editText}>แก้ไข</Text></Pressable> : null}<Pressable onPress={onDelete}><Text style={styles.deleteText}>ลบ</Text></Pressable></View></View>
    </View>
  );
}

export function CategoryBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const width = max > 0 ? `${Math.max(5, Math.round((value / max) * 100))}%` : '0%';
  return <View style={styles.category}><View style={styles.categoryHeader}><Text style={styles.categoryLabel}>{label}</Text><Text style={styles.categoryValue}>฿{formatMoney(value)}</Text></View><View style={styles.barTrack}><View style={[styles.barFill, { width: width as `${number}%`, backgroundColor: color }]} /></View></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.navy }, header: { minHeight: 126, paddingTop: 34, paddingHorizontal: 24, paddingBottom: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSubtitle: { color: '#C9D2EC', fontSize: 13, marginBottom: 5 }, headerTitle: { color: colors.white, fontSize: 23, fontWeight: '700' }, avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#263B70', alignItems: 'center', justifyContent: 'center' }, avatarText: { fontSize: 18 },
  sheet: { flex: 1, backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28 }, sheetContent: { padding: 20, paddingBottom: 42 }, withFooter: { paddingBottom: 110 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 78, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8 },
  navItem: { width: 65, alignItems: 'center', gap: 3 }, navIcon: { color: colors.muted, fontSize: 20, fontWeight: '700' }, navLabel: { color: colors.muted, fontSize: 10 }, navActive: { color: colors.navy },
  fab: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', marginTop: -28, ...shadow }, fabText: { color: colors.white, fontSize: 29, marginTop: -2 },
  button: { backgroundColor: colors.navy, minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, buttonRed: { backgroundColor: colors.expense }, buttonGreen: { backgroundColor: colors.income }, buttonText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  field: { marginBottom: 15 }, fieldLabel: { color: colors.text, fontSize: 13, fontWeight: '600', marginBottom: 7 }, input: { minHeight: 47, borderRadius: 10, backgroundColor: colors.input, borderWidth: 1, borderColor: '#DFE3E8', paddingHorizontal: 14, fontSize: 15, color: colors.text },
  tabs: { backgroundColor: '#D9D9D9', borderRadius: 10, padding: 4, flexDirection: 'row', marginBottom: 18 }, tab: { flex: 1, minHeight: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, activeTab: { backgroundColor: colors.white }, tabText: { color: '#566060', fontSize: 12, fontWeight: '600' }, activeTabText: { color: colors.navy },
  transactionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 10 }, typeDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, transactionInfo: { flex: 1 }, transactionTitle: { color: colors.text, fontSize: 14, fontWeight: '700' }, transactionMeta: { color: colors.muted, fontSize: 10, marginTop: 3 }, transactionNote: { color: colors.muted, fontSize: 11, marginTop: 3 }, transactionEnd: { alignItems: 'flex-end', maxWidth: 126 }, amount: { fontSize: 13, fontWeight: '700' }, actionRow: { flexDirection: 'row', gap: 12, marginTop: 7 }, editText: { color: colors.blue, fontSize: 11, fontWeight: '600' }, deleteText: { color: colors.expense, fontSize: 11, fontWeight: '600' },
  category: { marginTop: 14 }, categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }, categoryLabel: { color: colors.text, fontSize: 13, fontWeight: '600' }, categoryValue: { color: colors.muted, fontSize: 12 }, barTrack: { height: 9, backgroundColor: '#E8EBEF', borderRadius: 9, overflow: 'hidden' }, barFill: { height: 9, borderRadius: 9 },
});
