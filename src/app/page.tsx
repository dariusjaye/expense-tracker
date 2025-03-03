"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import ReceiptUploader from '@/components/ReceiptUploader';
import MobileUploadQR from '@/components/MobileUploadQR';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import { VeryfiReceiptData } from '@/lib/veryfi/veryfiClient';
import { Expense, Vendor, ExpenseFilter } from '@/lib/utils/expenseUtils';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '@/lib/firebase/expenseDb';
import { getVendors } from '@/lib/firebase/expenseDb';
import { processReceipt } from '@/lib/utils/receiptUtils';
import { fetchShopifyOrders } from '@/lib/utils/shopifyUtils';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [receiptData, setReceiptData] = useState<Partial<Expense> | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
  const [thisMonthRevenue, setThisMonthRevenue] = useState(0);
  
  // Fetch expenses and vendors when user is authenticated
  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchVendors();
      fetchThisMonthRevenue();
    }
  }, [user]);
  
  // Set recent expenses when expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      // Sort expenses by date (newest first) and take the first 5
      const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentExpenses(sorted.slice(0, 5));
    }
  }, [expenses]);
  
  const fetchExpenses = async () => {
    if (!user) return;
    
    setIsLoadingExpenses(true);
    try {
      const filter: ExpenseFilter = {}; // Empty filter to get all expenses
      const { expenses: fetchedExpenses, lastDoc: lastDocument } = await getExpenses(user.uid, filter, 100);
      setExpenses(fetchedExpenses);
      setLastDoc(lastDocument);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsLoadingExpenses(false);
    }
  };
  
  const fetchVendors = async () => {
    if (!user) return;
    
    try {
      const fetchedVendors = await getVendors(user.uid);
      setVendors(fetchedVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };
  
  const fetchThisMonthRevenue = async () => {
    setIsLoadingRevenue(true);
    try {
      // Get the first day of the current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Fetch orders for this month
      const { orders } = await fetchShopifyOrders({
        startDate,
        endDate: now,
        limit: 250, // Limit to 250 orders per page
        cursor: undefined,
        status: 'any' // Include all order statuses
      });
      
      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (parseFloat(order.total_price) || 0);
      }, 0);
      
      setThisMonthRevenue(totalRevenue);
    } catch (error) {
      console.error('Error fetching this month revenue:', error);
    } finally {
      setIsLoadingRevenue(false);
    }
  };
  
  const handleReceiptProcessed = async (data: any) => {
    try {
      const processedData = await processReceipt(data);
      setReceiptData(processedData);
      setShowExpenseForm(true);
    } catch (error) {
      console.error('Error processing receipt:', error);
      alert('Failed to process receipt. Please try again or enter expense details manually.');
    }
  };
  
  const handleAddExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Add the expense to the database
      const newExpense = await addExpense(user.uid, expenseData);
      
      // Update the local state without refetching all expenses
      setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
      
      // Reset form state
      setShowExpenseForm(false);
      setReceiptData(null);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditExpense = (expense: Expense) => {
    setReceiptData(null);
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };
  
  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    if (!user) return;
    
    try {
      await deleteExpense(expenseId);
      
      // Update the local state without refetching all expenses
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };
  
  const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      if (editingExpense) {
        // Update the expense in the database
        updateExpense(editingExpense.id, expenseData)
          .then(() => {
            // Update the local state without refetching all expenses
            setExpenses(prevExpenses => 
              prevExpenses.map(expense => 
                expense.id === editingExpense.id 
                  ? { 
                      ...expense, 
                      ...expenseData, 
                      updatedAt: Date.now() 
                    } 
                  : expense
              )
            );
            
            // Reset form state
            setShowExpenseForm(false);
            setEditingExpense(null);
            setReceiptData(null);
            setIsSubmitting(false);
          })
          .catch(error => {
            console.error('Error updating expense:', error);
            alert('Failed to update expense. Please try again.');
            setIsSubmitting(false);
          });
      } else {
        // Add a new expense
        handleAddExpense(expenseData)
          .then(() => {
            setIsSubmitting(false);
          })
          .catch(error => {
            console.error('Error adding expense:', error);
            setIsSubmitting(false);
          });
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
  return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-gray-600 mb-8">You need to be signed in to view your dashboard.</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <header className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and manage your financial data</p>
          
          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEditingExpense(null);
                setReceiptData(null);
                setShowExpenseForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Expense
            </button>
            
            <ReceiptUploader onReceiptProcessed={handleReceiptProcessed} />
            
            <MobileUploadQR />
          </div>
        </header>
        
        {/* Expense Form */}
        {showExpenseForm && (
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <ExpenseForm
              initialData={editingExpense || receiptData || undefined}
              vendors={vendors}
              onSave={handleSaveExpense}
              onCancel={() => {
                setShowExpenseForm(false);
                setEditingExpense(null);
                setReceiptData(null);
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
        
        {/* Main Content */}
        <div className="space-y-6">
          {/* Financial Stats - Moved above Recent Expenses */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-5 text-gray-800">Financial Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Revenue Stats */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-blue-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  Revenue
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-blue-700 text-sm">This Month</span>
                    <span className="font-semibold text-blue-900">
                      {isLoadingRevenue ? (
                        <div className="animate-pulse h-4 w-16 bg-blue-200 rounded"></div>
                      ) : (
                        `$${thisMonthRevenue.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-blue-700 text-sm">Last 3 Months</span>
                    <span className="font-semibold text-blue-900">
                      {isLoadingRevenue ? (
                        <div className="animate-pulse h-4 w-16 bg-blue-200 rounded"></div>
                      ) : (
                        `$${(thisMonthRevenue * 2.5).toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Expense Stats */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Expenses
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-red-700 text-sm">This Month</span>
                    <span className="font-semibold text-red-900">
                      ${expenses
                        .filter(expense => {
                          const expenseDate = new Date(expense.date);
                          const now = new Date();
                          return (
                            expenseDate.getMonth() === now.getMonth() &&
                            expenseDate.getFullYear() === now.getFullYear() &&
                            expense.type !== 'cogs' // Only include regular expenses
                          );
                        })
                        .reduce((sum, expense) => sum + expense.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-red-700 text-sm">Last 3 Months</span>
                    <span className="font-semibold text-red-900">
                      ${expenses
                        .filter(expense => {
                          const expenseDate = new Date(expense.date);
                          const now = new Date();
                          const threeMonthsAgo = new Date();
                          threeMonthsAgo.setMonth(now.getMonth() - 3);
                          return expenseDate >= threeMonthsAgo && expense.type !== 'cogs'; // Only include regular expenses
                        })
                        .reduce((sum, expense) => sum + expense.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* COGS Stats */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-purple-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Cost of Goods Sold
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <span className="text-purple-700 text-sm">This Month</span>
                    <span className="font-semibold text-purple-900">
                      ${expenses
                        .filter(expense => {
                          const expenseDate = new Date(expense.date);
                          const now = new Date();
                          return (
                            expenseDate.getMonth() === now.getMonth() &&
                            expenseDate.getFullYear() === now.getFullYear() &&
                            expense.type === 'cogs' // Only include COGS
                          );
                        })
                        .reduce((sum, expense) => sum + expense.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <span className="text-purple-700 text-sm">Last 3 Months</span>
                    <span className="font-semibold text-purple-900">
                      ${expenses
                        .filter(expense => {
                          const expenseDate = new Date(expense.date);
                          const now = new Date();
                          const threeMonthsAgo = new Date();
                          threeMonthsAgo.setMonth(now.getMonth() - 3);
                          return expenseDate >= threeMonthsAgo && expense.type === 'cogs'; // Only include COGS
                        })
                        .reduce((sum, expense) => sum + expense.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Profit Stats */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Profit
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-green-700 text-sm">This Month</span>
                    <span className="font-semibold text-green-900">
                      {isLoadingRevenue ? (
                        <div className="animate-pulse h-4 w-16 bg-green-200 rounded"></div>
                      ) : (
                        `$${(thisMonthRevenue - expenses
                          .filter(expense => {
                            const expenseDate = new Date(expense.date);
                            const now = new Date();
                            return (
                              expenseDate.getMonth() === now.getMonth() &&
                              expenseDate.getFullYear() === now.getFullYear()
                            );
                          })
                          .reduce((sum, expense) => sum + expense.amount, 0)).toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-green-700 text-sm">Last 3 Months</span>
                    <span className="font-semibold text-green-900">
                      {isLoadingRevenue ? (
                        <div className="animate-pulse h-4 w-16 bg-green-200 rounded"></div>
                      ) : (
                        `$${((thisMonthRevenue * 2.5) - expenses
                          .filter(expense => {
                            const expenseDate = new Date(expense.date);
                            const now = new Date();
                            const threeMonthsAgo = new Date();
                            threeMonthsAgo.setMonth(now.getMonth() - 3);
                            return expenseDate >= threeMonthsAgo;
                          })
                          .reduce((sum, expense) => sum + expense.amount, 0)).toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Recent Expenses - Now below Financial Summary */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-800">Recent Expenses</h2>
              {expenses.length > 5 && (
                <button
                  onClick={() => {
                    // Navigate to expenses page or show more expenses
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  View All
                </button>
              )}
        </div>
            
            {isLoadingExpenses ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                ))}
        </div>
            ) : recentExpenses.length > 0 ? (
              <ExpenseList
                expenses={recentExpenses}
                vendors={vendors}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No expenses found. Add your first expense to get started!</p>
        </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
