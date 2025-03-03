import { NextResponse } from 'next/server';
import { shopifyClient, isShopifyConfigured } from '@/lib/shopify/shopifyConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!isShopifyConfigured()) {
      return NextResponse.json(
        { error: 'Shopify is not configured' },
        { status: 503 }
      );
    }

    const client = shopifyClient.rest;
    const session = shopifyClient.session.customAppSession(
      process.env.SHOPIFY_SHOP_DOMAIN || ''
    );

    const response = await client.get({
      path: 'products',
      session,
    });

    return NextResponse.json(response.body);
  } catch (error: any) {
    console.error('Error fetching Shopify products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 