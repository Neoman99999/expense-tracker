export type TransactionType = 'income' | 'expense';
export type Transaction = { id: string; title: string; amount: number; type: TransactionType; category: string; note: string; date: string; time: string };
export type UserProfile = { name: string; email: string };
