// CSV Parser utility for Shopify data
import { parse } from 'papaparse';

export interface OrderData {
  date: string;
  orderId: string;
  totalPrice: number;
  [key: string]: any;
}

export interface SessionData {
  date: string;
  sessions: number;
  [key: string]: any;
}

export interface CorrelationData {
  date: string;
  revenue: number;
  sessions: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface AnalysisResult {
  correlationData: CorrelationData[];
  pearsonCorrelation: number;
  totalRevenue: number;
  totalOrders: number;
  totalSessions: number;
  averageConversionRate: number;
  averageOrderValue: number;
}

/**
 * Parse Shopify orders CSV file
 */
export const parseOrdersCSV = (csvContent: string): OrderData[] => {
  const { data } = parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  return data.map((row: any) => {
    // Assuming the CSV has 'Created at' and 'Total' columns
    // Adjust field names based on actual Shopify export format
    const date = row['Created at'] ? new Date(row['Created at']).toISOString().split('T')[0] : '';
    const totalPrice = parseFloat(row['Total'] || '0');
    
    return {
      date,
      orderId: row['Name'] || row['Order ID'] || '',
      totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
      ...row
    };
  });
};

/**
 * Parse Shopify sessions CSV file
 */
export const parseSessionsCSV = (csvContent: string): SessionData[] => {
  const { data } = parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  return data.map((row: any) => {
    // Try different possible column names for sessions data
    // Shopify might use different column names in different reports
    const date = row['Date'] || row['Day'] || '';
    
    // Try different possible column names for sessions count
    let sessions = 0;
    if (row['Sessions'] !== undefined) {
      sessions = parseInt(row['Sessions'], 10);
    } else if (row['Total sessions'] !== undefined) {
      sessions = parseInt(row['Total sessions'], 10);
    } else if (row['session_count'] !== undefined) {
      sessions = parseInt(row['session_count'], 10);
    } else {
      // Look for any column that might contain session data
      for (const key in row) {
        if (key.toLowerCase().includes('session') && !isNaN(parseInt(row[key], 10))) {
          sessions = parseInt(row[key], 10);
          break;
        }
      }
    }
    
    return {
      date,
      sessions: isNaN(sessions) ? 0 : sessions,
      ...row
    };
  });
};

/**
 * Calculate Pearson correlation coefficient
 */
export const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  // Calculate means
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;

  // Calculate covariance and standard deviations
  let covariance = 0;
  let xStdDev = 0;
  let yStdDev = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    covariance += xDiff * yDiff;
    xStdDev += xDiff * xDiff;
    yStdDev += yDiff * yDiff;
  }

  if (xStdDev === 0 || yStdDev === 0) return 0;
  
  return covariance / (Math.sqrt(xStdDev) * Math.sqrt(yStdDev));
};

/**
 * Analyze correlation between orders revenue and sessions
 */
export const analyzeCorrelation = (orders: OrderData[], sessions: SessionData[]): AnalysisResult => {
  // Create a map of dates to revenue and order counts
  const revenueByDate: Record<string, number> = {};
  const orderCountByDate: Record<string, number> = {};
  
  orders.forEach(order => {
    const date = order.date;
    if (!revenueByDate[date]) {
      revenueByDate[date] = 0;
      orderCountByDate[date] = 0;
    }
    revenueByDate[date] += order.totalPrice;
    orderCountByDate[date]++;
  });

  // Create a map of dates to session counts
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) acc[date] = session.sessions;
    else acc[date] += session.sessions;
    return acc;
  }, {} as Record<string, number>);

  // Combine the data for dates that exist in both datasets
  const correlationData: CorrelationData[] = [];
  const revenueValues: number[] = [];
  const sessionValues: number[] = [];
  
  // Get all unique dates from both datasets
  const allDates = Array.from(new Set([...Object.keys(revenueByDate), ...Object.keys(sessionsByDate)])).sort();
  
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalSessions = 0;
  
  allDates.forEach(date => {
    const revenue = revenueByDate[date] || 0;
    const orderCount = orderCountByDate[date] || 0;
    const sessions = sessionsByDate[date] || 0;
    const conversionRate = sessions > 0 ? (orderCount / sessions) * 100 : 0;
    const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;
    
    totalRevenue += revenue;
    totalOrders += orderCount;
    totalSessions += sessions;
    
    if (revenue > 0 || sessions > 0) {
      correlationData.push({
        date,
        revenue,
        sessions,
        conversionRate,
        averageOrderValue
      });
      
      revenueValues.push(revenue);
      sessionValues.push(sessions);
    }
  });
  
  const pearsonCorrelation = calculatePearsonCorrelation(revenueValues, sessionValues);
  const averageConversionRate = totalSessions > 0 ? (totalOrders / totalSessions) * 100 : 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  return {
    correlationData,
    pearsonCorrelation,
    totalRevenue,
    totalOrders,
    totalSessions,
    averageConversionRate,
    averageOrderValue
  };
}; 