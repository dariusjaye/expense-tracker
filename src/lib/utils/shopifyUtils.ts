// Shopify Order Interfaces
export interface ShopifyLineItem {
  id: number;
  variant_id: number;
  title: string;
  quantity: number;
  sku: string;
  variant_title: string;
  vendor: string;
  price: string;
  name: string;
}

export interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  created_at: string;
  processed_at: string;
  updated_at: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  total_discounts: string;
  total_line_items_price: string;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  line_items: ShopifyLineItem[];
}

// Shopify Product Interfaces
export interface ShopifyProductVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  inventory_quantity: number;
  inventory_management: string | null;
}

export interface ShopifyProductImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  src: string;
  variant_ids: number[];
}

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string;
  status: string;
  tags: string;
  variants: ShopifyProductVariant[];
  images: ShopifyProductImage[];
}

// Revenue Summary Interface
export interface RevenueSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProducts: number;
  topProducts: {
    title: string;
    revenue: number;
    quantity: number;
  }[];
  revenueByDay: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

// Calculate revenue summary from orders
export function calculateRevenueSummary(orders: ShopifyOrder[]): RevenueSummary {
  let totalRevenue = 0;
  const totalOrders = orders.length;
  let totalProducts = 0;
  
  // Track revenue by day
  const revenueByDay: { date: string; revenue: number; orders: number }[] = [];
  
  // Track product sales
  const productSales: Record<string, { title: string; revenue: number; quantity: number }> = {};
  
  orders.forEach(order => {
    const orderRevenue = parseFloat(order.total_price);
    totalRevenue += orderRevenue;
    
    // Process date for daily revenue
    const orderDate = new Date(order.created_at).toISOString().split('T')[0];
    const dayData = revenueByDay.find(day => day.date === orderDate);
    
    if (dayData) {
      dayData.revenue += orderRevenue;
      dayData.orders += 1;
    } else {
      revenueByDay.push({
        date: orderDate,
        revenue: orderRevenue,
        orders: 1
      });
    }
    
    // Process line items for product sales
    order.line_items.forEach(item => {
      totalProducts += item.quantity;
      
      const productKey = item.title;
      const itemRevenue = parseFloat(item.price) * item.quantity;
      
      if (productSales[productKey]) {
        productSales[productKey].revenue += itemRevenue;
        productSales[productKey].quantity += item.quantity;
      } else {
        productSales[productKey] = {
          title: item.title,
          revenue: itemRevenue,
          quantity: item.quantity
        };
      }
    });
  });
  
  // Calculate average order value
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Get top products by revenue
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  
  // Sort revenue by day chronologically
  revenueByDay.sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    totalProducts,
    topProducts,
    revenueByDay
  };
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Get month name from date string
export function getMonthName(dateString: string): string {
  if (!dateString || typeof dateString !== 'string') {
    return 'Unknown';
  }
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'long' });
  } catch (error) {
    console.error('Error parsing date:', error);
    return 'Unknown';
  }
}

// Fetch orders from the server-side API
export async function fetchShopifyOrders({
  startDate,
  endDate,
  limit = 250,
  status = 'any',
  cursor = null,
}: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  status?: string;
  cursor?: string | null;
}): Promise<{
  orders: ShopifyOrder[];
  nextCursor: string | null;
  originalParams: {
    startDate: string | null;
    endDate: string | null;
    status: string | null;
  };
}> {
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (startDate) {
    queryParams.append('startDate', startDate.toISOString());
  }
  
  if (endDate) {
    queryParams.append('endDate', endDate.toISOString());
  }
  
  if (limit) {
    queryParams.append('limit', limit.toString());
  }
  
  if (cursor) {
    queryParams.append('cursor', cursor);
  }
  
  if (status) {
    queryParams.append('status', status);
  }
  
  // Make the request to our server-side API
  const response = await fetch(`/api/shopify/orders?${queryParams.toString()}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch Shopify orders');
  }
  
  const data = await response.json();
  return {
    orders: data.orders || [],
    nextCursor: data.nextCursor || null,
    originalParams: data.originalParams
  };
}

// Fetch Shopify Products
export async function fetchShopifyProducts({
  limit = 250,
  cursor = null,
  collectionId = null,
  productType = null,
  vendor = null,
}: {
  limit?: number;
  cursor?: string | null;
  collectionId?: string | null;
  productType?: string | null;
  vendor?: string | null;
}): Promise<{
  products: ShopifyProduct[];
  nextCursor: string | null;
  originalParams: {
    collectionId: string | null;
    productType: string | null;
    vendor: string | null;
  };
}> {
  try {
    const queryParams = new URLSearchParams();
    
    if (limit) {
      queryParams.append('limit', limit.toString());
    }
    
    if (cursor) {
      queryParams.append('cursor', cursor);
    }
    
    if (collectionId) {
      queryParams.append('collection_id', collectionId);
    }
    
    if (productType) {
      queryParams.append('product_type', productType);
    }
    
    if (vendor) {
      queryParams.append('vendor', vendor);
    }
    
    const response = await fetch(`/api/shopify/products?${queryParams.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch Shopify products');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
}

// Convert Shopify products to inventory format
export function convertShopifyProductsToInventory(products: ShopifyProduct[]): {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  variants?: {
    id: string;
    title: string;
    price: number;
    sku: string;
    inventory_quantity: number;
  }[];
}[] {
  return products.map(product => {
    // Get the first variant for price and inventory
    const mainVariant = product.variants[0] || { price: '0', inventory_quantity: 0 };
    
    // Get the first image as the product image
    const mainImage = product.images[0]?.src;
    
    // Calculate total stock across all variants
    const totalStock = product.variants.reduce((sum, variant) => 
      sum + (variant.inventory_quantity || 0), 0);
    
    return {
      id: product.id.toString(),
      name: product.title,
      // Use product_type as category, fallback to vendor if not available
      category: product.product_type || product.vendor || 'Uncategorized',
      // Convert price from string to number
      price: parseFloat(mainVariant.price) || 0,
      // Use total inventory quantity from all variants
      stock: totalStock,
      // Use the product description
      description: product.body_html ? stripHtmlTags(product.body_html) : undefined,
      // Use the first product image
      imageUrl: mainImage
    };
  });
}

// Helper function to strip HTML tags from product descriptions
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
} 