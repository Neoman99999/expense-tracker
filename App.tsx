import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.page}>
      <StatusBar barStyle="light-content" />

      <View style={styles.phone}>
        <View style={styles.header}>
          <Text style={styles.greeting}>สวัสดี 👋</Text>
          <Text style={styles.appName}>Expense Tracker</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>สรุปรายรับ - รายจ่าย</Text>
          <Text style={styles.month}>กันยายน 2569</Text>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>ยอดเงินคงเหลือ</Text>
            <Text style={styles.balance}>฿ 5,000.00</Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>รายรับ</Text>
              <Text style={styles.income}>฿ 10,000</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>รายจ่าย</Text>
              <Text style={styles.expense}>฿ 5,000</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#EDEDED',
    alignItems: 'center',
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#112250',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  greeting: {
    color: '#C9D2EC',
    fontSize: 14,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
  title: {
    color: '#093030',
    fontSize: 20,
    fontWeight: '600',
  },
  month: {
    color: '#5C6464',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: '#112250',
    borderRadius: 18,
    padding: 22,
  },
  balanceLabel: {
    color: '#C9D2EC',
    fontSize: 14,
  },
  balance: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  summaryLabel: {
    color: '#5C6464',
    fontSize: 13,
  },
  income: {
    color: '#00BE23',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
  expense: {
    color: '#E31212',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
});