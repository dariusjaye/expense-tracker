"use client";

import React, { useState, useEffect } from 'react';
import RevenueAnalytics from '@/components/RevenueAnalytics';
import { ShopifyOrder, fetchShopifyOrders, formatCurrency } from '@/lib/utils/shopifyUtils';

export default function RevenuePage() {
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    endDate: new Date()
  });

  // Add a state for the time range selection
  const [timeRangeSelection, setTimeRangeSelection] = useState<'this-month' | 'month' | 'quarter' | 'year' | 'all'>('quarter');
  const [currency, setCurrency] = useState<string>('USD');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [includeArchived, setIncludeArchived] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('RevenuePage mounted');
    setDebugInfo('Component mounted');
  }, []);

  // Fetch orders directly without relying on authentication
  const fetchOrders = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    setIsRefreshing(true);
    setDebugInfo(prev => prev + '\nFetching orders...');
    
    try {
      console.log('Fetching Shopify orders');
      console.log('Date range:', dateRange);
      console.log('Include archived:', includeArchived);
      
      // Test API connectivity
      try {
        const apiTest = await fetch('/api/shopify/orders');
        if (!apiTest.ok) {
          const errorData = await apiTest.json();
          throw new Error(`API test failed: ${errorData.error || apiTest.statusText}`);
        }
        setDebugInfo(prev => prev + '\nAPI test successful');
      } catch (apiError) {
        console.error('API test error:', apiError);
        setDebugInfo(prev => prev + '\nAPI test error: ' + String(apiError));
        throw apiError;
      }
      
      // Fetch all pages of orders
      let allOrders: ShopifyOrder[] = [];
      let nextCursor: string | undefined = undefined;
      let pageCount = 0;
      
      // Store the status to use for all requests
      const orderStatus = includeArchived ? 'any' : 'open'; // 'any' includes archived orders, 'open' only includes open orders
      
      do {
        // Fetch orders using the server-side API
        const result = await fetchShopifyOrders({
          // Only send date range and status on the first request
          startDate: pageCount === 0 ? dateRange.startDate : undefined,
          endDate: pageCount === 0 ? dateRange.endDate : undefined,
          limit: 250, // Limit to 250 orders per page
          cursor: nextCursor,
          status: pageCount === 0 ? orderStatus : undefined
        });
        
        pageCount++;
        const newOrders = result.orders || [];
        allOrders = [...allOrders, ...newOrders];
        nextCursor = result.nextCursor || undefined;
        
        console.log(`Fetched page ${pageCount} with ${newOrders.length} orders. Next cursor: ${nextCursor || 'none'}`);
        setDebugInfo(prev => prev + `\nFetched page ${pageCount} with ${newOrders.length} orders`);
        
        // Set orders after each page to show progress
        setOrders(allOrders);
        
        // Set currency from the first order if available
        if (allOrders.length > 0 && allOrders[0].currency && !currency) {
          setCurrency(allOrders[0].currency);
        }
        
        // Limit to 10 pages maximum to prevent infinite loops
        if (pageCount >= 10) {
          console.warn('Reached maximum page count (10), stopping pagination');
          setDebugInfo(prev => prev + '\nReached maximum page count (10), stopping pagination');
          break;
        }
      } while (nextCursor);
      
      console.log(`Fetched a total of ${allOrders.length} orders across ${pageCount} pages`);
      setDebugInfo(prev => prev + `\nFetched a total of ${allOrders.length} orders across ${pageCount} pages`);
      
    } catch (error) {
      console.error('Error fetching Shopify orders:', error);
      setOrders([]);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Error fetching orders: ${errorMessage}`);
      setDebugInfo(prev => prev + `\nError: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch orders when date range changes
  useEffect(() => {
    // Skip the initial render
    if (isLoading) return;
    
    console.log('Date range changed, fetching orders');
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.startDate.toISOString(), dateRange.endDate.toISOString()]);

  // Fetch orders when includeArchived changes
  useEffect(() => {
    // Skip the initial render
    if (isLoading) return;
    
    console.log('Include archived setting changed, fetching orders');
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeArchived]);

  // Handle time range change
  const handleTimeRangeChange = (range: 'this-month' | 'month' | 'quarter' | 'year' | 'all') => {
    setTimeRangeSelection(range);
    
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'this-month':
        // Start from the 1st day of the current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
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
    
    const newDateRange = {
      startDate,
      endDate: now
    };
    
    setDateRange(newDateRange);
    
    // Fetch orders with the new date range
    setTimeout(() => {
      fetchOrders();
    }, 0);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // If loading, show loading state
  if (isLoading && orders.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="mb-2">Loading revenue data...</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Reload Page
        </button>
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium mb-2">Debug Actions</h3>
          <button 
            onClick={() => fetchOrders(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2"
          >
            Force Fetch Orders
          </button>
          
          <button 
            onClick={() => {
              console.log('Current state:', { orders, isLoading, error });
              alert('State logged to console');
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Log State
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
        <button 
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing}
          className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isRefreshing && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button 
            onClick={() => fetchOrders(true)}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded"
          >
            Try Again
          </button>
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700 whitespace-pre-wrap">
            <p>Debug Info:</p>
            {debugInfo}
          </div>
        </div>
      )}
      
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
            <div className="flex items-end">
              <button
                onClick={() => fetchOrders()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTimeRangeChange('this-month')}
              className={`px-4 py-2 rounded ${timeRangeSelection === 'this-month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              This Month
            </button>
            <button
              onClick={() => handleTimeRangeChange('month')}
              className={`px-4 py-2 rounded ${timeRangeSelection === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Last Month
            </button>
            <button
              onClick={() => handleTimeRangeChange('quarter')}
              className={`px-4 py-2 rounded ${timeRangeSelection === 'quarter' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Last Quarter
            </button>
            <button
              onClick={() => handleTimeRangeChange('year')}
              className={`px-4 py-2 rounded ${timeRangeSelection === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Last Year
            </button>
            <button
              onClick={() => handleTimeRangeChange('all')}
              className={`px-4 py-2 rounded ${timeRangeSelection === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              All Time
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="include-archived"
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="include-archived" className="ml-2 block text-sm text-gray-700">
              Include Archived Orders
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            When checked, archived orders will be included in the results.
          </p>
        </div>
      </div>
      
      {orders.length > 0 ? (
        <>
          <RevenueAnalytics 
            orders={orders} 
            timeRange={timeRangeSelection}
            currency={currency}
          />
          
          {/* Recent Orders Table */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customer ? 
                          `${order.customer.first_name} ${order.customer.last_name}` : 
                          (order.email || 'Anonymous')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.financial_status === 'paid' ? 'bg-green-100 text-green-800' : 
                            order.financial_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            order.financial_status === 'refunded' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {order.financial_status ? order.financial_status.charAt(0).toUpperCase() + order.financial_status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(parseFloat(order.total_price), order.currency)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.line_items.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orders.length > 10 && (
              <div className="mt-4 text-right">
                <p className="text-sm text-gray-500">Showing 10 of {orders.length} orders</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">No Orders Found</h2>
          <p className="text-gray-600 mb-6">
            No orders were found for the selected date range. Try adjusting your filters or connecting your Shopify store.
          </p>
        </div>
      )}
    </div>
  );
} 