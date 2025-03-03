import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { restResources } from '@shopify/shopify-api/rest/admin/2024-01';

export const shopifyConfig = {
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY || '',
  scopes: ['read_products', 'write_products', 'read_orders', 'write_orders'],
  hostName: process.env.SHOPIFY_APP_URL || 'localhost:3000',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  restResources,
};

// Initialize Shopify API client
export const shopifyClient = shopifyApi({
  ...shopifyConfig,
  isCustomStoreApp: false,
  adminApiAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,
});

// Helper function to check if Shopify is properly configured
export const isShopifyConfigured = () => {
  return Boolean(
    shopifyConfig.apiKey &&
    shopifyConfig.apiSecretKey &&
    process.env.SHOPIFY_ACCESS_TOKEN
  );
};

// Types for Shopify data
export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  vendor: string;
  productType: string;
  createdAt: string;
  updatedAt: string;
  variants: ShopifyVariant[];
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventoryQuantity: number;
}

export interface ShopifyOrder {
  id: string;
  orderNumber: number;
  totalPrice: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  lineItems: {
    title: string;
    quantity: number;
    price: string;
  }[];
} 