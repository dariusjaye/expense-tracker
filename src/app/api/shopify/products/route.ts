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
    const limit = searchParams.get('limit') || '250';
    const cursor = searchParams.get('cursor');
    const collectionId = searchParams.get('collection_id');
    const productType = searchParams.get('product_type');
    const vendor = searchParams.get('vendor');
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    
    // Add cursor for pagination if present
    if (cursor) {
      queryParams.append('page_info', cursor);
    } else {
      // Add filters if no cursor is present
      if (collectionId) {
        queryParams.append('collection_id', collectionId);
      }
      
      if (productType) {
        queryParams.append('product_type', productType);
      }
      
      if (vendor) {
        queryParams.append('vendor', vendor);
      }
    }
    
    // Construct the API URL
    const apiUrl = `${shopifyStoreUrl}/admin/api/2023-01/products.json?${queryParams.toString()}`;
    
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
    
    // Return the products and pagination info
    return NextResponse.json({
      products: data.products,
      nextCursor,
      // Include original parameters for filtering
      originalParams: {
        collectionId,
        productType,
        vendor
      }
    });
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return NextResponse.json(
      { error: `Error fetching Shopify products: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 