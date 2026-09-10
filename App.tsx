import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { SignInScreen, SignUpScreen } from './src/screens/AuthScreens';
import { DashboardScreen, HistoryScreen, ProfileScreen, TransactionFormScreen, YearSummaryScreen } from './src/screens/MainScreens';
import { colors } from './src/theme';

export type RouteName = 'signIn' | 'signUp' | 'dashboard' | 'history' | 'year' | 'transactionForm' | 'profile';

function AppNavigator() {
  const { ready, currentUser } = useApp();
  const [route, setRoute] = useState<RouteName>('signIn');
  const [editingId, setEditingId] = useState<string | undefined>();

  useEffect(() => {
    if (ready) setRoute(currentUser ? 'dashboard' : 'signIn');
  }, [ready, currentUser]);

  const openTransactionForm = (id?: string) => {
    setEditingId(id);
    setRoute('transactionForm');
  };

  if (!ready) {
    return <View style={styles.loading}><ActivityIndicator color={colors.navy} size="large" /></View>;
  }
  if (!currentUser) {
    return route === 'signUp'
      ? <SignUpScreen onSignIn={() => setRoute('signIn')} />
      : <SignInScreen onSignUp={() => setRoute('signUp')} />;
  }

  switch (route) {
    case 'history':
      return <HistoryScreen navigate={setRoute} onAdd={() => openTransactionForm()} onEdit={openTransactionForm} />;
    case 'year':
      return <YearSummaryScreen navigate={setRoute} onAdd={() => openTransactionForm()} />;
    case 'transactionForm':
      return <TransactionFormScreen editingId={editingId} onClose={() => setRoute('dashboard')} />;
    case 'profile':
      return <ProfileScreen navigate={setRoute} />;
    default:
      return <DashboardScreen navigate={setRoute} onAdd={() => openTransactionForm()} onEdit={openTransactionForm} />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <SafeAreaView style={styles.page}>
        <StatusBar barStyle="light-content" />
        <View style={styles.phone}><AppNavigator /></View>
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#E7E9ED', alignItems: 'center' },
  phone: { flex: 1, width: '100%', maxWidth: 430, backgroundColor: colors.navy },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
