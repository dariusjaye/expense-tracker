import { useState, useEffect } from 'react';
import { 
  ShopifyOrder, 
  calculateRevenueSummary, 
  formatCurrency,
  getMonthName
} from '@/lib/utils/shopifyUtils';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface RevenueAnalyticsProps {
  orders: ShopifyOrder[];
  timeRange: 'this-month' | 'month' | 'quarter' | 'year' | 'all';
  currency: string;
}

export default function RevenueAnalytics({ orders, timeRange, currency }: RevenueAnalyticsProps) {
  const [filteredOrders, setFilteredOrders] = useState<ShopifyOrder[]>([]);
  const [dailyRevenueData, setDailyRevenueData] = useState<any>(null);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<any>(null);
  const [productRevenueData, setProductRevenueData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Debug log when component receives props
  useEffect(() => {
    console.log('RevenueAnalytics received props:', { 
      ordersCount: orders?.length || 0, 
      timeRange, 
      currency,
      firstOrder: orders?.length > 0 ? orders[0] : null
    });
  }, [orders, timeRange, currency]);

  // Filter orders based on time range
  useEffect(() => {
    try {
      setError(null);
      
      // Ensure orders is an array before proceeding
      if (!Array.isArray(orders)) {
        console.error('Orders is not an array:', orders);
        setFilteredOrders([]);
        setError('Invalid orders data received');
        return;
      }
      
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
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
        default:
          startDate = new Date(2000, 0, 1); // Far in the past
          break;
      }
      
      const filtered = orders.filter(order => {
        // Check if processed_at or created_at exists before creating Date object
        const orderDate = order.processed_at 
          ? new Date(order.processed_at) 
          : (order.created_at ? new Date(order.created_at) : null);
          
        if (!orderDate) return false;
        return orderDate >= startDate && orderDate <= now;
      });
      
      console.log(`Filtered orders: ${filtered.length} out of ${orders.length} for time range: ${timeRange}`);
      setFilteredOrders(filtered);
    } catch (err) {
      console.error('Error filtering orders:', err);
      setError(`Error filtering orders: ${err instanceof Error ? err.message : String(err)}`);
      setFilteredOrders([]);
    }
  }, [orders, timeRange]);

  // Prepare chart data
  useEffect(() => {
    try {
      if (!Array.isArray(filteredOrders) || filteredOrders.length === 0) {
        console.log('No filtered orders available for charts');
        setDailyRevenueData(null);
        setMonthlyRevenueData(null);
        setProductRevenueData(null);
        return;
      }
      
      console.log(`Preparing chart data for ${filteredOrders.length} filtered orders`);
      const summary = calculateRevenueSummary(filteredOrders);
      console.log('Revenue summary calculated:', summary);
      
      // Daily revenue chart data
      if (summary.revenueByDay && Array.isArray(summary.revenueByDay)) {
        const sortedDays = summary.revenueByDay.map(day => day.date).sort();
        
        setDailyRevenueData({
          labels: sortedDays.map(day => new Date(day).toLocaleDateString()),
          datasets: [
            {
              label: 'Daily Revenue',
              data: sortedDays.map(day => {
                const dayData = summary.revenueByDay.find(d => d.date === day);
                return dayData ? dayData.revenue : 0;
              }),
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
          ],
        });
      }
      
      // Monthly revenue chart data
      // Note: The RevenueSummary doesn't have revenueByMonth, so we'll calculate it here
      const revenueByMonth: Record<string, number> = {};
      summary.revenueByDay.forEach(day => {
        const month = day.date.substring(0, 7); // YYYY-MM
        if (revenueByMonth[month]) {
          revenueByMonth[month] += day.revenue;
        } else {
          revenueByMonth[month] = day.revenue;
        }
      });
      
      if (Object.keys(revenueByMonth).length > 0) {
        const sortedMonths = Object.keys(revenueByMonth).sort();
        
        setMonthlyRevenueData({
          labels: sortedMonths.map(month => {
            try {
              return getMonthName(month);
            } catch (error) {
              console.error('Error getting month name:', error);
              return 'Unknown';
            }
          }),
          datasets: [
            {
              label: 'Monthly Revenue',
              data: sortedMonths.map(month => revenueByMonth[month]),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
          ],
        });
      }
      
      // Product revenue chart data
      if (summary.topProducts && Array.isArray(summary.topProducts)) {
        setProductRevenueData({
          labels: summary.topProducts.map(product => 
            product.title ? 
              (product.title.length > 20 ? product.title.substring(0, 20) + '...' : product.title) : 
              'Unknown Product'
          ),
          datasets: [
            {
              label: 'Product Revenue',
              data: summary.topProducts.map(product => product.revenue),
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
              ],
              borderWidth: 1,
            },
          ],
        });
      }
    } catch (err) {
      console.error('Error preparing chart data:', err);
      setError(`Error preparing chart data: ${err instanceof Error ? err.message : String(err)}`);
      setDailyRevenueData(null);
      setMonthlyRevenueData(null);
      setProductRevenueData(null);
    }
  }, [filteredOrders, currency]);

  // If there's an error, display it
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        <p>Error loading revenue data: {error}</p>
      </div>
    );
  }

  // If no orders, show empty state
  if (!Array.isArray(filteredOrders) || filteredOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No orders found for the selected time range.</p>
        <p className="text-sm text-gray-400 mt-2">Received {orders?.length || 0} orders, but none match the current filter criteria.</p>
      </div>
    );
  }

  // Calculate summary
  const summary = calculateRevenueSummary(filteredOrders);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue, currency)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Order Count</h3>
          <p className="text-3xl font-bold text-gray-900">{summary.totalOrders}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average Order Value</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.averageOrderValue, currency)}</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        {dailyRevenueData && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Revenue</h3>
            <div className="h-64">
              <Bar 
                data={dailyRevenueData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => formatCurrency(Number(value), currency),
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
        
        {/* Monthly Revenue Chart */}
        {monthlyRevenueData && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
            <div className="h-64">
              <Bar 
                data={monthlyRevenueData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => formatCurrency(Number(value), currency),
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
        
        {/* Top Products Chart */}
        {productRevenueData && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products by Revenue</h3>
            <div className="h-64">
              <Pie 
                data={productRevenueData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.raw as number;
                          return `${context.label}: ${formatCurrency(value, currency)}`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
        
        {/* Top Products Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.revenue, currency)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 