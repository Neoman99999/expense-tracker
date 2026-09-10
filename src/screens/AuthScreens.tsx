import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Field, PrimaryButton } from '../components/UI';
import { useApp } from '../context/AppContext';
import { colors, shadow } from '../theme';

export function SignInScreen({ onSignUp }: { onSignUp: () => void }) {
  const { signIn } = useApp();
  const [email, setEmail] = useState('demo@email.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const submit = async () => setError((await signIn(email.trim(), password)) ?? '');

  return <AuthLayout title="เข้าสู่ระบบ" subtitle="ยินดีต้อนรับกลับมา">
    <Field label="อีเมล" value={email} onChangeText={setEmail} placeholder="you@email.com" autoCapitalize="none" keyboardType="email-address" />
    <Field label="รหัสผ่าน" value={password} onChangeText={setPassword} placeholder="อย่างน้อย 6 ตัวอักษร" secureTextEntry />
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <PrimaryButton label="เข้าสู่ระบบ" onPress={submit} />
    <View style={styles.switchRow}><Text style={styles.switchLabel}>ยังไม่มีบัญชี?</Text><Pressable onPress={onSignUp}><Text style={styles.switchLink}> สมัครสมาชิก</Text></Pressable></View>
  </AuthLayout>;
}

export function SignUpScreen({ onSignIn }: { onSignIn: () => void }) {
  const { signUp } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const submit = async () => {
    if (password !== confirm) return setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
    setError((await signUp(name, email.trim(), password)) ?? '');
  };

  return <AuthLayout title="สมัครสมาชิก" subtitle="สร้างบัญชี Expense Tracker">
    <Field label="ชื่อผู้ใช้" value={name} onChangeText={setName} placeholder="ชื่อของคุณ" />
    <Field label="อีเมล" value={email} onChangeText={setEmail} placeholder="you@email.com" autoCapitalize="none" keyboardType="email-address" />
    <Field label="รหัสผ่าน" value={password} onChangeText={setPassword} placeholder="อย่างน้อย 6 ตัวอักษร" secureTextEntry />
    <Field label="ยืนยันรหัสผ่าน" value={confirm} onChangeText={setConfirm} placeholder="กรอกรหัสผ่านอีกครั้ง" secureTextEntry />
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <PrimaryButton label="สมัครสมาชิก" onPress={submit} />
    <View style={styles.switchRow}><Text style={styles.switchLabel}>มีบัญชีแล้ว?</Text><Pressable onPress={onSignIn}><Text style={styles.switchLink}> เข้าสู่ระบบ</Text></Pressable></View>
  </AuthLayout>;
}

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.brand}><Text style={styles.brandIcon}>฿</Text><Text style={styles.brandName}>Expense Tracker</Text><Text style={styles.brandSub}>จัดการเงินของคุณให้ง่ายขึ้น</Text></View>
      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text>{children}</View>
        <Text style={styles.demo}>บัญชีทดลอง: demo@email.com / 123456</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.navy }, brand: { paddingTop: 54, paddingBottom: 36, alignItems: 'center' }, brandIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.white, color: colors.navy, textAlign: 'center', lineHeight: 58, fontSize: 30, fontWeight: '800', overflow: 'hidden' }, brandName: { color: colors.white, fontSize: 25, fontWeight: '800', marginTop: 14 }, brandSub: { color: '#C9D2EC', fontSize: 13, marginTop: 6 },
  sheet: { flex: 1, backgroundColor: colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 }, sheetContent: { padding: 22, paddingTop: 34, paddingBottom: 60 }, card: { backgroundColor: colors.white, borderRadius: 18, padding: 22, ...shadow }, title: { color: colors.ink, fontSize: 22, fontWeight: '800', textAlign: 'center' }, subtitle: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 5, marginBottom: 24 }, error: { color: colors.expense, fontSize: 12, marginBottom: 12 }, switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 }, switchLabel: { color: colors.muted, fontSize: 13 }, switchLink: { color: colors.navy, fontSize: 13, fontWeight: '700' }, demo: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 18 },
});
