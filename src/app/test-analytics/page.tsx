"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getExpenses } from '@/lib/firebase/expenseDb';
import { Expense } from '@/lib/utils/expenseUtils';
import ExpenseAnalytics from '@/components/ExpenseAnalytics';

export default function TestAnalyticsPage() {
  const { user, loading, signInWithPin } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Sign in with PIN
  const handleSignIn = async () => {
    try {
      setError(null);
      const success = await signInWithPin(pin);
      if (!success) {
        setError('Invalid PIN');
      }
    } catch (err) {
      setError(`Error signing in: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Fetch expenses when user is authenticated
  useEffect(() => {
    if (user) {
      fetchExpenses();
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [user, loading]);

  const fetchExpenses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching expenses for user:', user.uid);
      const result = await getExpenses(user.uid);
      const fetchedExpenses = result.expenses;
      
      setDebugInfo({
        userUid: user.uid,
        expensesCount: fetchedExpenses.length,
        firstExpense: fetchedExpenses.length > 0 ? fetchedExpenses[0] : null,
      });
      
      if (Array.isArray(fetchedExpenses)) {
        setExpenses(fetchedExpenses);
      } else {
        console.error('Expenses is not an array:', fetchedExpenses);
        setExpenses([]);
        setError('Expenses data is not in the expected format');
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setExpenses([]);
      setError(`Error fetching expenses: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Analytics Test Page</h1>
      
      {!user ? (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Sign In</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN (1996)"
              className="border rounded px-3 py-2"
            />
            <button 
              onClick={handleSignIn}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Sign In
            </button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">User Info</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify({ uid: user.uid, email: user.email, displayName: user.displayName }, null, 2)}
            </pre>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Expenses</h2>
              <button 
                onClick={fetchExpenses}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Refresh Expenses
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : expenses.length === 0 ? (
              <p className="text-gray-500">No expenses found.</p>
            ) : (
              <div>
                <p className="mb-4">Found {expenses.length} expenses.</p>
                <ExpenseAnalytics expenses={expenses} timeRange="all" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 