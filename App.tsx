import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type TransactionType = 'income' | 'expense';

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
};

const STORAGE_KEY = 'expense-tracker-transactions';

const initialTransactions: Transaction[] = [
  {
    id: '1',
    title: 'เงินเดือน',
    amount: 10000,
    type: 'income',
  },
  {
    id: '2',
    title: 'ค่าอาหาร',
    amount: 5000,
    type: 'expense',
  },
];

export default function App() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const [isLoaded, setIsLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const savedTransactions = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTransactions) {
          const parsedTransactions =
            JSON.parse(savedTransactions) as Transaction[];

          setTransactions(parsedTransactions);
        }
      } catch (storageError) {
        console.error('ไม่สามารถโหลดข้อมูลได้', storageError);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(transactions),
        );
      } catch (storageError) {
        console.error('ไม่สามารถบันทึกข้อมูลได้', storageError);
      }
    };

    saveTransactions();
  }, [transactions, isLoaded]);

  const totalIncome = transactions
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + item.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatMoney = (value: number) => {
    return value.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setError('');
    setShowForm(false);
  };

  const addTransaction = () => {
    const numericAmount = Number(amount.replace(/,/g, ''));

    if (!title.trim()) {
      setError('กรุณากรอกชื่อรายการ');
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: numericAmount,
      type,
    };

    setTransactions((currentTransactions) => [
      newTransaction,
      ...currentTransactions,
    ]);

    resetForm();
  };

  return (
    <SafeAreaView style={styles.page}>
      <StatusBar barStyle="light-content" />

      <View style={styles.phone}>
        <View style={styles.header}>
          <Text style={styles.greeting}>สวัสดี 👋</Text>
          <Text style={styles.appName}>Expense Tracker</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>สรุปรายรับ - รายจ่าย</Text>
          <Text style={styles.month}>กันยายน 2569</Text>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>ยอดเงินคงเหลือ</Text>

            <Text style={styles.balance}>
              ฿ {formatMoney(balance)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>รายรับ</Text>

              <Text style={styles.income}>
                ฿ {formatMoney(totalIncome)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>รายจ่าย</Text>

              <Text style={styles.expense}>
                ฿ {formatMoney(totalExpense)}
              </Text>
            </View>
          </View>

          {!showForm && (
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.addButtonText}>+ เพิ่มรายการ</Text>
            </Pressable>
          )}

          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>เพิ่มรายการใหม่</Text>

              <Text style={styles.inputLabel}>ชื่อรายการ</Text>

              <TextInput
                style={styles.input}
                placeholder="เช่น ค่าอาหาร"
                placeholderTextColor="#9A9A9A"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>จำนวนเงิน</Text>

              <TextInput
                style={styles.input}
                placeholder="เช่น 150"
                placeholderTextColor="#9A9A9A"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={styles.inputLabel}>ประเภท</Text>

              <View style={styles.typeRow}>
                <Pressable
                  style={[
                    styles.typeButton,
                    type === 'income' && styles.incomeTypeButton,
                  ]}
                  onPress={() => setType('income')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === 'income' && styles.activeTypeText,
                    ]}
                  >
                    รายรับ
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.typeButton,
                    type === 'expense' && styles.expenseTypeButton,
                  ]}
                  onPress={() => setType('expense')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === 'expense' && styles.activeTypeText,
                    ]}
                  >
                    รายจ่าย
                  </Text>
                </Pressable>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={addTransaction}
              >
                <Text style={styles.saveButtonText}>บันทึกรายการ</Text>
              </Pressable>

              <Pressable style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.sectionTitle}>รายการล่าสุด</Text>

          <View style={styles.transactionCard}>
            {transactions.map((item) => (
              <View style={styles.transactionRow} key={item.id}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.transactionType}>
                    {item.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                  </Text>
                </View>

                <Text
                  style={
                    item.type === 'income'
                      ? styles.incomeAmount
                      : styles.expenseAmount
                  }
                >
                  {item.type === 'income' ? '+' : '-'} ฿
                  {formatMoney(item.amount)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
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
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
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
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  expense: {
    color: '#E31212',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#112250',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
  },
  formTitle: {
    color: '#112250',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#4C5555',
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F2F3F5',
    borderWidth: 1,
    borderColor: '#E0E2E5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#ECEEF2',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  incomeTypeButton: {
    backgroundColor: '#00BE23',
  },
  expenseTypeButton: {
    backgroundColor: '#E31212',
  },
  typeButtonText: {
    color: '#5C6464',
    fontWeight: '600',
  },
  activeTypeText: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#E31212',
    fontSize: 13,
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: '#112250',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#777777',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#093030',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: '#202525',
    fontSize: 15,
    fontWeight: '600',
  },
  transactionType: {
    color: '#8A9090',
    fontSize: 12,
    marginTop: 3,
  },
  incomeAmount: {
    color: '#00BE23',
    fontSize: 14,
    fontWeight: '700',
  },
  expenseAmount: {
    color: '#E31212',
    fontSize: 14,
    fontWeight: '700',
  },
});