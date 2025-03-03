import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { CorrelationData } from '@/lib/utils/csvParser';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CorrelationChartsProps {
  data: CorrelationData[];
  pearsonCorrelation: number;
  totalRevenue: number;
  totalOrders: number;
  totalSessions: number;
  averageConversionRate: number;
  averageOrderValue: number;
}

export default function CorrelationCharts({
  data,
  pearsonCorrelation,
  totalRevenue,
  totalOrders,
  totalSessions,
  averageConversionRate,
  averageOrderValue
}: CorrelationChartsProps) {
  const [timeSeriesData, setTimeSeriesData] = useState<ChartData<'line'>>({ datasets: [] });
  const [conversionRateData, setConversionRateData] = useState<ChartData<'bar'>>({ datasets: [] });
  const [aovData, setAovData] = useState<ChartData<'bar'>>({ datasets: [] });
  
  useEffect(() => {
    if (data.length === 0) return;
    
    // Prepare time series data
    const timeSeriesChartData: ChartData<'line'> = {
      labels: data.map(item => item.date),
      datasets: [
        {
          label: 'Revenue ($)',
          data: data.map(item => item.revenue),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Sessions',
          data: data.map(item => item.sessions),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y1',
        }
      ]
    };
    
    // Prepare bar chart data for conversion rate
    const conversionRateChartData: ChartData<'bar'> = {
      labels: data.map(item => item.date),
      datasets: [
        {
          label: 'Conversion Rate (%)',
          data: data.map(item => item.conversionRate),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }
      ]
    };

    // Prepare bar chart data for average order value
    const aovChartData: ChartData<'bar'> = {
      labels: data.map(item => item.date),
      datasets: [
        {
          label: 'Average Order Value ($)',
          data: data.map(item => item.averageOrderValue),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        }
      ]
    };
    
    setTimeSeriesData(timeSeriesChartData);
    setConversionRateData(conversionRateChartData);
    setAovData(aovChartData);
  }, [data]);
  
  const timeSeriesOptions: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Sessions'
        }
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Revenue and Sessions Over Time',
      },
    },
  };
  
  const conversionRateOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Conversion Rate by Date',
      },
    },
  };

  const aovOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Average Order Value by Date',
      },
    },
  };
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };
  
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-gray-500 mt-1">From {totalOrders} orders</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold text-pink-600">{formatNumber(totalSessions)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Average Order Value</h3>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(averageOrderValue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Average Conversion Rate</h3>
          <p className="text-3xl font-bold text-green-600">{formatNumber(averageConversionRate)}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Revenue-Sessions Correlation</h3>
          <p className="text-3xl font-bold text-purple-600">{formatNumber(pearsonCorrelation)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {pearsonCorrelation > 0.7 
              ? 'Strong positive correlation: Revenue strongly increases with more sessions' 
              : pearsonCorrelation > 0.3 
                ? 'Moderate positive correlation: Revenue tends to increase with more sessions' 
                : pearsonCorrelation > 0 
                  ? 'Weak positive correlation: Revenue slightly increases with more sessions' 
                  : pearsonCorrelation < -0.7 
                    ? 'Strong negative correlation: Revenue decreases with more sessions' 
                    : pearsonCorrelation < -0.3 
                      ? 'Moderate negative correlation: Revenue tends to decrease with more sessions' 
                      : 'Weak or no correlation: Sessions have little impact on revenue'}
          </p>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Line options={timeSeriesOptions} data={timeSeriesData} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Bar options={conversionRateOptions} data={conversionRateData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Bar options={aovOptions} data={aovData} />
        </div>
      </div>
    </div>
  );
} 