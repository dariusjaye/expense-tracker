import { NextRequest, NextResponse } from 'next/server';

// Remove dynamic export and add edge runtime
export const runtime = 'edge';

// Helper function to parse Link header for pagination
function parseLinkHeader(linkHeader: string | null): { next?: string } {
  if (!linkHeader) return {};
  
  const links: { [key: string]: string } = {};
  const parts = linkHeader.split(',');
  
  for (const part of parts) {
    const section = part.split(';');
    if (section.length !== 2) continue;
    
    const url = section[0].trim().replace(/<(.*)>/, '$1');
    const name = section[1].trim().replace(/rel="(.*)"/, '$1');
    
    links[name] = url;
  }
  
  return {
    next: links['next']
  };
}

// Extract cursor from URL
function extractCursor(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.get('page_info');
  } catch (error) {
    console.error('Error parsing cursor URL:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if Shopify credentials are configured
    const shopifyStoreUrl = process.env.SHOPIFY_STORE_URL;
    const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    
    if (!shopifyStoreUrl || !shopifyAccessToken) {
      return NextResponse.json(
        { error: 'Shopify API credentials not configured' },
        { status: 500 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit') || '50';
    const cursor = searchParams.get('cursor');
    const status = searchParams.get('status'); // Add status parameter for archived orders
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    
    // If cursor is present, we can't use date filters or status according to Shopify API rules
    if (cursor) {
      queryParams.append('page_info', cursor);
      
      // We can't include date filters or status with cursor
      // But we need to remember the original request parameters for the frontend
      // So we'll pass them back in the response
    } else {
      // Only add date filters and status if no cursor is present
      if (startDate) {
        queryParams.append('created_at_min', new Date(startDate).toISOString());
      }
      
      if (endDate) {
        queryParams.append('created_at_max', new Date(endDate).toISOString());
      }
      
      // Add status filter if provided (for archived orders)
      if (status) {
        queryParams.append('status', status);
      }
    }
    
    // Construct the API URL
    const apiUrl = `${shopifyStoreUrl}/admin/api/2023-01/orders.json?${queryParams.toString()}`;
    
    // Make the request to Shopify
    const response = await fetch(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': shopifyAccessToken,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', errorText);
      return NextResponse.json(
        { error: `Shopify API error: ${errorText}` },
        { status: response.status }
      );
    }
    
    // Parse the response
    const data = await response.json();
    
    // Extract pagination info from Link header
    const linkHeader = response.headers.get('Link');
    const { next } = parseLinkHeader(linkHeader);
    const nextCursor = next ? extractCursor(next) : null;
    
    // Return the orders, pagination info, and original request parameters
    return NextResponse.json({
      orders: data.orders,
      nextCursor,
      // Include original parameters so the client can use them for filtering
      originalParams: {
        startDate,
        endDate,
        status
      }
    });
  } catch (error) {
    console.error('Error fetching Shopify orders:', error);
    return NextResponse.json(
      { error: `Error fetching Shopify orders: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 