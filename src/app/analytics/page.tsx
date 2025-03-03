"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import ExpenseAnalytics from '@/components/ExpenseAnalytics';
import { Expense } from '@/lib/utils/expenseUtils';
import { getExpenses } from '@/lib/firebase/expenseDb';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    endDate: new Date()
  });

  // Add a state for the time range selection
  const [timeRangeSelection, setTimeRangeSelection] = useState<'month' | 'quarter' | 'year' | 'all'>('quarter');

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
      
      if (result && result.expenses) {
        console.log('Fetched expenses count:', result.expenses.length);
        setExpenses(result.expenses);
      } else {
        console.error('Invalid expenses data structure:', result);
        setExpenses([]);
        setError('Failed to load expenses data');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
      setError(`Error fetching expenses: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter expenses based on date range
  const filteredExpenses = expenses.filter(expense => {
    if (!expense || !expense.date) return false;
    
    try {
      const expenseDate = new Date(expense.date);
      return expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
    } catch (error) {
      console.error('Error filtering expense by date:', error, expense);
      return false;
    }
  });

  // Handle time range change
  const handleTimeRangeChange = (range: 'month' | 'quarter' | 'year' | 'all') => {
    setTimeRangeSelection(range);
    
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'all':
        startDate = new Date(2000, 0, 1); // Far in the past
        break;
    }
    
    setDateRange({
      startDate,
      endDate: now
    });
  };

  // If user is not authenticated or loading, show loading state
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Expense Analytics</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button 
            onClick={fetchExpenses}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Expense Analytics</h1>
        <p className="text-lg text-gray-600 mb-8">
          Please sign in to view your expense analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Expense Analytics</h1>
        <button 
          onClick={fetchExpenses}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh Data
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                className="border rounded-md px-3 py-2 w-full"
                value={dateRange.startDate.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  startDate: new Date(e.target.value)
                })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                className="border rounded-md px-3 py-2 w-full"
                value={dateRange.endDate.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  endDate: new Date(e.target.value)
                })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Time Range</label>
              <select
                className="border rounded-md px-3 py-2 w-full"
                value={timeRangeSelection}
                onChange={(e) => handleTimeRangeChange(e.target.value as 'month' | 'quarter' | 'year' | 'all')}
              >
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No expenses found for the selected date range.</p>
          </div>
        ) : (
          <ExpenseAnalytics 
            expenses={filteredExpenses} 
            timeRange={timeRangeSelection}
          />
        )}
      </div>
    </div>
  );
} 