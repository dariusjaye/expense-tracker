"use client";

import { useState, useEffect } from 'react';
import { Expense } from '@/lib/utils/expenseUtils';
import { calculateExpenseSummary } from '@/lib/utils/expenseUtils';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

export interface ExpenseAnalyticsProps {
  expenses: Expense[];
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

export default function ExpenseAnalytics({ expenses, timeRange = 'month' }: ExpenseAnalyticsProps) {
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [categoryChartData, setCategoryChartData] = useState<any>(null);
  const [vendorChartData, setVendorChartData] = useState<any>(null);
  const [timeChartData, setTimeChartData] = useState<any>(null);

  // Filter expenses based on time range
  useEffect(() => {
    if (!expenses || !expenses.length) {
      setFilteredExpenses([]);
      return;
    }

    const now = new Date();
    let filtered: Expense[];

    switch (timeRange) {
      case 'week':
        // Last 7 days
        filtered = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return (now.getTime() - expenseDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        });
        break;
      case 'month':
        // Last 30 days
        filtered = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return (now.getTime() - expenseDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        });
        break;
      case 'quarter':
        // Last 90 days
        filtered = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return (now.getTime() - expenseDate.getTime()) <= 90 * 24 * 60 * 60 * 1000;
        });
        break;
      case 'year':
        // Last 365 days
        filtered = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return (now.getTime() - expenseDate.getTime()) <= 365 * 24 * 60 * 60 * 1000;
        });
        break;
      case 'all':
      default:
        filtered = [...expenses];
        break;
    }

    setFilteredExpenses(filtered);
  }, [expenses, timeRange]);

  // Prepare chart data when filtered expenses change
  useEffect(() => {
    if (!filteredExpenses || !filteredExpenses.length) {
      setCategoryChartData(null);
      setVendorChartData(null);
      setTimeChartData(null);
      return;
    }

    try {
      // Calculate expense summary
      const summary = calculateExpenseSummary(filteredExpenses);

      // Prepare category chart data
      const categoryData = {
        labels: Object.keys(summary.categoryBreakdown),
        datasets: [
          {
            data: Object.values(summary.categoryBreakdown),
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
              '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F15BB5'
            ],
            borderWidth: 1,
          },
        ],
      };
      setCategoryChartData(categoryData);

      // Prepare vendor chart data
      // Get top 5 vendors by total amount
      const vendorEntries = Object.entries(summary.vendorBreakdown);
      const topVendors = vendorEntries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const vendorData = {
        labels: topVendors.map(([name]) => name),
        datasets: [
          {
            label: 'Expense Amount',
            data: topVendors.map(([, amount]) => amount),
            backgroundColor: '#36A2EB',
            borderColor: '#2980B9',
            borderWidth: 1,
          },
        ],
      };
      setVendorChartData(vendorData);

      // Prepare time chart data (monthly breakdown)
      const monthlyData: { [key: string]: number } = {};
      
      // Group expenses by month
      filteredExpenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = 0;
        }
        
        monthlyData[monthYear] += expense.amount;
      });
      
      // Sort months chronologically
      const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
      });
      
      const timeData = {
        labels: sortedMonths,
        datasets: [
          {
            label: 'Monthly Expenses',
            data: sortedMonths.map(month => monthlyData[month]),
            backgroundColor: '#4BC0C0',
            borderColor: '#3498DB',
            borderWidth: 1,
          },
        ],
      };
      setTimeChartData(timeData);
    } catch (error) {
      console.error('Error preparing chart data:', error);
      // Set fallback empty chart data
      setCategoryChartData({ labels: [], datasets: [{ data: [], backgroundColor: [] }] });
      setVendorChartData({ labels: [], datasets: [{ data: [], backgroundColor: [] }] });
      setTimeChartData({ labels: [], datasets: [{ data: [], backgroundColor: [] }] });
    }
  }, [filteredExpenses]);

  // If no expenses, show a message
  if (!filteredExpenses || filteredExpenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No expense data available for the selected time period.</p>
      </div>
    );
  }

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Expenses</h3>
          <p className="text-2xl font-bold text-blue-900">${totalExpenses.toFixed(2)}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Average per Expense</h3>
          <p className="text-2xl font-bold text-green-900">
            ${(totalExpenses / filteredExpenses.length).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Number of Expenses</h3>
          <p className="text-2xl font-bold text-purple-900">{filteredExpenses.length}</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Expense by Category</h3>
          <div className="h-64">
            {categoryChartData && <Pie data={categoryChartData} options={{ maintainAspectRatio: false }} />}
          </div>
        </div>
        
        {/* Vendor Breakdown */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Top Vendors</h3>
          <div className="h-64">
            {vendorChartData && <Bar 
              data={vendorChartData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            />}
          </div>
        </div>
      </div>
      
      {/* Time Breakdown */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Monthly Expense Trend</h3>
        <div className="h-64">
          {timeChartData && <Bar 
            data={timeChartData} 
            options={{ 
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} 
          />}
        </div>
      </div>
    </div>
  );
} 