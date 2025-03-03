import { VeryfiReceiptData } from '../veryfi/veryfiClient';

export interface Vendor {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  category?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type Payee = Vendor;

export interface Expense {
  id: string;
  vendorId: string;
  vendorName: string;
  date: string; // ISO format: YYYY-MM-DD
  amount: number;
  currency: string;
  category: string;
  subcategory?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  notes?: string;
  items?: ExpenseItem[];
  tax?: number;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually';
  tags?: string[];
  type?: 'expense' | 'cogs';
  createdAt: number;
  updatedAt: number;
}

export interface ExpenseItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  categories?: string[];
  vendorIds?: string[];
  searchTerm?: string;
  tags?: string[];
}

export interface ExpenseSummary {
  totalExpenses: number;
  categoryBreakdown: Record<string, number>;
  vendorBreakdown: Record<string, number>;
  monthlyTotals: Record<string, number>;
}

export const EXPENSE_CATEGORIES = [
  'Advertising',
  'Auto',
  'Bank Fees',
  'Entertainment',
  'Equipment',
  'Food',
  'Insurance',
  'Office Supplies',
  'Rent',
  'Salary',
  'Software',
  'Taxes',
  'Travel',
  'Utilities',
  'Other',
];

export function convertVeryfiDataToExpense(
  receiptData: VeryfiReceiptData,
  vendorId?: string
): Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> {
  // Format date to YYYY-MM-DD
  const date = receiptData.date ? new Date(receiptData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  
  // Map receipt items to expense items
  const items = receiptData.items?.map(item => ({
    description: item.description || '',
    quantity: item.quantity,
    unitPrice: item.unit_price,
    total: item.total,
  })) || [];

  return {
    vendorId: vendorId || '',
    vendorName: receiptData.vendor?.name || '',
    date,
    amount: receiptData.total || 0,
    currency: receiptData.currency || 'USD',
    category: receiptData.category || 'Other',
    paymentMethod: receiptData.payment_method,
    receiptUrl: receiptData.receipt_url,
    notes: receiptData.notes,
    items,
    tax: receiptData.tax,
    type: 'expense', // Default to 'expense'
  };
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function calculateExpenseSummary(expenses: Expense[]): ExpenseSummary {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  expenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + expense.amount;
  });
  
  // Vendor breakdown
  const vendorBreakdown: Record<string, number> = {};
  expenses.forEach(expense => {
    vendorBreakdown[expense.vendorName] = (vendorBreakdown[expense.vendorName] || 0) + expense.amount;
  });
  
  // Monthly totals
  const monthlyTotals: Record<string, number> = {};
  expenses.forEach(expense => {
    const month = expense.date.substring(0, 7); // YYYY-MM
    monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
  });
  
  return {
    totalExpenses,
    categoryBreakdown,
    vendorBreakdown,
    monthlyTotals,
  };
} 