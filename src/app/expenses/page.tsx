"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import ExpenseList from '@/components/ExpenseList';
import ExpenseForm from '@/components/ExpenseForm';
import ReceiptUploader from '@/components/ReceiptUploader';
import { Expense, Payee } from '@/lib/utils/expenseUtils';
import { VeryfiReceiptData } from '@/lib/veryfi/veryfiClient';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '@/lib/firebase/expenseDb';
import { getPayees } from '@/lib/firebase/expenseDb';

export default function ExpensesPage() {
  const { user, loading } = useAuth();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [receiptData, setReceiptData] = useState<VeryfiReceiptData | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch expenses and payees when user is authenticated
  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchPayees();
    }
  }, [user]);
  
  const fetchExpenses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { expenses: fetchedExpenses } = await getExpenses(user.uid);
      setExpenses(fetchedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchPayees = async () => {
    if (!user) return;
    
    try {
      const fetchedPayees = await getPayees(user.uid);
      setPayees(fetchedPayees);
    } catch (error) {
      console.error('Error fetching payees:', error);
    }
  };
  
  const handleReceiptProcessed = (data: VeryfiReceiptData) => {
    setReceiptData(data);
    setShowExpenseForm(true);
    setEditingExpense(null);
  };
  
  const handleAddExpenseClick = () => {
    setReceiptData(null);
    setShowExpenseForm(true);
    setEditingExpense(null);
  };
  
  const handleEditExpense = (expense: Expense) => {
    setReceiptData(null);
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };
  
  const handleDeleteExpense = async (expenseId: string) => {
    if (!user) return;
    
    try {
      await deleteExpense(expenseId);
      setExpenses(expenses.filter(expense => expense.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };
  
  const handleSaveExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (editingExpense) {
        // Update existing expense
        await updateExpense(editingExpense.id, expenseData);
        
        // Update local state
        setExpenses(expenses.map(expense => 
          expense.id === editingExpense.id
            ? { ...expense, ...expenseData, updatedAt: Date.now() }
            : expense
        ));
      } else {
        // Add new expense
        const newExpense = await addExpense(user.uid, expenseData);
        
        // Update local state
        setExpenses([...expenses, newExpense]);
      }
      
      // Reset form state
      setShowExpenseForm(false);
      setEditingExpense(null);
      setReceiptData(null);
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancelExpenseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
    setReceiptData(null);
  };
  
  // If user is not authenticated or loading, show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Expenses</h1>
        <p className="text-lg text-gray-600 mb-8">
          Please sign in to view and manage your expenses.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleAddExpenseClick}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Expense
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Expense Form */}
      {showExpenseForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          
          {/* Financial Summary Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Total Expenses */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700 mb-1">Total Expenses</p>
                <p className="text-xl font-semibold text-blue-900">
                  ${expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                </p>
              </div>
              
              {/* This Month */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-700 mb-1">This Month</p>
                <p className="text-xl font-semibold text-green-900">
                  ${expenses
                    .filter(expense => {
                      const expenseDate = new Date(expense.date);
                      const now = new Date();
                      return (
                        expenseDate.getMonth() === now.getMonth() &&
                        expenseDate.getFullYear() === now.getFullYear()
                      );
                    })
                    .reduce((sum, expense) => sum + expense.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              
              {/* Last Month */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-700 mb-1">Last Month</p>
                <p className="text-xl font-semibold text-purple-900">
                  ${expenses
                    .filter(expense => {
                      const expenseDate = new Date(expense.date);
                      const now = new Date();
                      const lastMonth = new Date(now);
                      lastMonth.setMonth(now.getMonth() - 1);
                      return (
                        expenseDate.getMonth() === lastMonth.getMonth() &&
                        expenseDate.getFullYear() === lastMonth.getFullYear()
                      );
                    })
                    .reduce((sum, expense) => sum + expense.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          {!editingExpense && !receiptData && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Receipt</h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload a receipt image to automatically extract expense details using OCR.
              </p>
              <ReceiptUploader
                onReceiptProcessed={handleReceiptProcessed}
                isProcessing={isSubmitting}
              />
              <div className="mt-4 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">or enter details manually</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
            </div>
          )}
          
          <ExpenseForm
            initialData={editingExpense || receiptData ? {
              ...editingExpense,
              ...(receiptData && {
                amount: receiptData.total || 0,
                date: receiptData.date ? new Date(receiptData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                vendorName: receiptData.vendor?.name || '',
                category: receiptData.category || '',
                notes: receiptData.notes || ''
              })
            } : {}}
            vendors={payees}
            onSave={handleSaveExpense}
            onCancel={handleCancelExpenseForm}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
      
      {/* Expense List */}
      {!isLoading && (
        <ExpenseList
          expenses={expenses}
          vendors={payees}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
        />
      )}
    </div>
  );
} 