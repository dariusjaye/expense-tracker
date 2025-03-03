"use client";

import { useState, useEffect } from 'react';
import { 
  fetchShopifyProducts, 
  convertShopifyProductsToInventory,
  ShopifyProduct,
  ShopifyProductVariant
} from '@/lib/utils/shopifyUtils';

// Define types for our data
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  sku: string;
  inventory_quantity: number;
}

interface CategorySummary {
  name: string;
  totalProducts: number;
  totalValue: number;
  products: Product[];
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedVariants, setExpandedVariants] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productsNeedingAttention, setProductsNeedingAttention] = useState<number>(0);
  const [filteredProductsNeedingAttention, setFilteredProductsNeedingAttention] = useState<number>(0);

  // Load products from Shopify API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch products from Shopify API
        const { products: shopifyProducts } = await fetchShopifyProducts({});
        
        // If no products found, use sample data
        if (shopifyProducts.length === 0) {
          console.log('No products found in Shopify, using sample data');
          setProducts(sampleProducts);
          setFilteredProducts(sampleProducts);
          processCategories(sampleProducts);
        } else {
          // Convert Shopify products to our inventory format with variants
          const inventoryProducts = shopifyProducts.map(product => {
            // Get the main product data using the existing conversion function
            const mainProduct = convertShopifyProductsToInventory([product])[0];
            
            // Add variants if they exist
            if (product.variants && product.variants.length > 1) {
              // Get all variants except the first one (which is already used as the main product)
              const additionalVariants = product.variants.slice(1).map(variant => ({
                id: variant.id.toString(),
                title: variant.title,
                price: parseFloat(variant.price) || 0,
                sku: variant.sku,
                inventory_quantity: variant.inventory_quantity || 0
              }));
              
              mainProduct.variants = additionalVariants;
              
              // Update the stock to be the sum of all variants
              const totalStock = product.variants.reduce((sum, variant) => 
                sum + (variant.inventory_quantity || 0), 0);
              
              mainProduct.stock = totalStock;
            }
            
            return mainProduct;
          });
          
          setProducts(inventoryProducts);
          setFilteredProducts(inventoryProducts);
          processCategories(inventoryProducts);
        }
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Using sample data instead.');
        
        // Fall back to sample data if there's an error
        setProducts(sampleProducts);
        setFilteredProducts(sampleProducts);
        processCategories(sampleProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    let filtered = products;
    
    if (searchTerm.trim()) {
      filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
    processCategories(filtered);
    
    // Count products needing attention
    const totalAttentionCount = products.filter(hasNegativeStock).length;
    setProductsNeedingAttention(totalAttentionCount);
    
    // Count filtered products needing attention
    const filteredAttentionCount = filtered.filter(hasNegativeStock).length;
    setFilteredProductsNeedingAttention(filteredAttentionCount);
  }, [searchTerm, products]);

  // Process products into categories
  const processCategories = (products: Product[]) => {
    const categoryMap = new Map<string, CategorySummary>();
    
    products.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, {
          name: product.category,
          totalProducts: 0,
          totalValue: 0,
          products: []
        });
      }
      
      const category = categoryMap.get(product.category)!;
      category.totalProducts += 1;
      category.totalValue += product.price * product.stock;
      category.products.push(product);
    });
    
    // Convert map to array and sort by category name
    const categoriesArray = Array.from(categoryMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    setCategories(categoriesArray);
    
    // Initialize all categories as expanded
    const expanded: Record<string, boolean> = {};
    categoriesArray.forEach(category => {
      expanded[category.name] = true;
    });
    setExpandedCategories(expanded);
  };

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Toggle variant expansion
  const toggleVariants = (productId: string) => {
    setExpandedVariants(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate total inventory value
  const totalInventoryValue = categories.reduce(
    (total, category) => total + category.totalValue, 
    0
  );

  // Check if a product has negative stock in any variant
  const hasNegativeStock = (product: Product): boolean => {
    // Check main product stock
    if (product.stock < 0) return true;
    
    // Check variant stock
    if (product.variants && product.variants.length > 0) {
      return product.variants.some(variant => variant.inventory_quantity < 0);
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Inventory</h1>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="text-lg font-semibold">
          Total Inventory Value: {formatCurrency(totalInventoryValue)}
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="search" 
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Search products by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Attention Required Summary */}
        {productsNeedingAttention > 0 && (
          <div className="mt-3 flex items-center">
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">
                {productsNeedingAttention} {productsNeedingAttention === 1 ? 'product' : 'products'} {' '}
                need attention due to negative stock
                {searchTerm && filteredProductsNeedingAttention > 0 && (
                  <span> ({filteredProductsNeedingAttention} in current view)</span>
                )}
              </span>
              <button 
                className="ml-3 text-sm underline hover:text-red-900 focus:outline-none"
                onClick={() => {
                  // Filter to show only products needing attention
                  const attentionProducts = products.filter(hasNegativeStock);
                  setFilteredProducts(attentionProducts);
                  processCategories(attentionProducts);
                  setSearchTerm('');
                }}
              >
                View only these products
              </button>
              {searchTerm && (
                <button 
                  className="ml-3 text-sm underline hover:text-red-900 focus:outline-none"
                  onClick={() => {
                    // Reset to show all products
                    setSearchTerm('');
                    setFilteredProducts(products);
                    processCategories(products);
                  }}
                >
                  Show all products
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-blue-800">Total Products</h3>
          <p className="text-3xl font-bold">{filteredProducts.length}</p>
          {filteredProductsNeedingAttention > 0 && (
            <p className="text-sm text-red-600 mt-1">
              {filteredProductsNeedingAttention} need attention
            </p>
          )}
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-green-800">Categories</h3>
          <p className="text-3xl font-bold">{categories.length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-purple-800">Total Value</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalInventoryValue)}</p>
        </div>
      </div>

      {/* No Results Message */}
      {filteredProducts.length === 0 && !loading && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">No products found matching &quot;{searchTerm}&quot;. Try a different search term.</p>
            </div>
          </div>
        </div>
      )}

      {/* Categories and Products */}
      <div className="space-y-6">
        {categories.map(category => (
          <div key={category.name} className="border rounded-lg overflow-hidden">
            <div 
              className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleCategory(category.name)}
            >
              <div>
                <h2 className="text-xl font-semibold">{category.name}</h2>
                <p className="text-sm text-gray-600">
                  {category.totalProducts} products • {formatCurrency(category.totalValue)}
                </p>
              </div>
              <div className="text-gray-500">
                {expandedCategories[category.name] ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
            
            {expandedCategories[category.name] && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Value
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {category.products.map(product => (
                      <>
                        <tr key={product.id} className={hasNegativeStock(product) ? "bg-red-50" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {product.imageUrl && (
                                <div className="flex-shrink-0 h-10 w-10 mr-4">
                                  <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt={product.name} />
                                </div>
                              )}
                              <div>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                  {hasNegativeStock(product) && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Needs Attention
                                    </span>
                                  )}
                                </div>
                                {product.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(product.price)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${product.stock < 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {product.stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(product.price * product.stock)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.variants && product.variants.length > 0 && (
                              <button
                                onClick={() => toggleVariants(product.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                {expandedVariants[product.id] ? 'Hide Variants' : 'Show Variants'}
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className={`ml-1 h-4 w-4 transition-transform ${expandedVariants[product.id] ? 'rotate-180' : ''}`} 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                        {/* Variants section */}
                        {expandedVariants[product.id] && product.variants && product.variants.length > 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                              <div className="text-sm font-medium text-gray-900 mb-2">Product Variants</div>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Variant
                                      </th>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        SKU
                                      </th>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                      </th>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {product.variants.map(variant => (
                                      <tr key={variant.id} className={variant.inventory_quantity < 0 ? "bg-red-50" : ""}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                          <div className="flex items-center">
                                            <span>{variant.title}</span>
                                            {variant.inventory_quantity < 0 && (
                                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Needs Attention
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                          {variant.sku}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                          {formatCurrency(variant.price)}
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm ${variant.inventory_quantity < 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                          {variant.inventory_quantity}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Sample products data for fallback
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro X',
    category: 'Electronics',
    price: 1299.99,
    stock: 35, // Sum of main variant (15) and additional variants (8 + 12)
    description: 'High-performance laptop with 16GB RAM and 512GB SSD',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
    variants: [
      {
        id: '1-1',
        title: '32GB RAM / 1TB SSD',
        price: 1599.99,
        sku: 'LAPTOP-PRO-X-32-1TB',
        inventory_quantity: 8
      },
      {
        id: '1-2',
        title: '16GB RAM / 1TB SSD',
        price: 1399.99,
        sku: 'LAPTOP-PRO-X-16-1TB',
        inventory_quantity: 12
      }
    ]
  },
  {
    id: '2',
    name: 'Smartphone Ultra',
    category: 'Electronics',
    price: 899.99,
    stock: -3, // Negative stock to demonstrate the feature
    description: 'Latest smartphone with 5G capability and 128GB storage',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80',
    variants: [
      {
        id: '2-1',
        title: '256GB Storage / Black',
        price: 999.99,
        sku: 'SMARTPHONE-ULTRA-256-BLK',
        inventory_quantity: 5
      },
      {
        id: '2-2',
        title: '128GB Storage / White',
        price: 899.99,
        sku: 'SMARTPHONE-ULTRA-128-WHT',
        inventory_quantity: -8 // Negative variant stock
      }
    ]
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 199.99,
    stock: 40,
    description: 'Noise-cancelling wireless headphones with 30-hour battery life',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '4',
    name: 'Office Desk',
    category: 'Furniture',
    price: 349.99,
    stock: 10,
    description: 'Modern office desk with cable management system',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1335&q=80'
  },
  {
    id: '5',
    name: 'Ergonomic Chair',
    category: 'Furniture',
    price: 249.99,
    stock: 12,
    description: 'Adjustable ergonomic office chair with lumbar support',
    imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
  },
  {
    id: '6',
    name: 'Bookshelf',
    category: 'Furniture',
    price: 179.99,
    stock: 8,
    description: 'Modern 5-tier bookshelf with metal frame',
    imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1139&q=80'
  },
  {
    id: '7',
    name: 'Cotton T-Shirt',
    category: 'Clothing',
    price: 19.99,
    stock: 100,
    description: 'Premium cotton t-shirt, available in multiple colors',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80'
  },
  {
    id: '8',
    name: 'Denim Jeans',
    category: 'Clothing',
    price: 49.99,
    stock: 75,
    description: 'Classic denim jeans with straight fit',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1026&q=80'
  },
  {
    id: '9',
    name: 'Winter Jacket',
    category: 'Clothing',
    price: 129.99,
    stock: 30,
    description: 'Waterproof winter jacket with thermal lining',
    imageUrl: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
  },
  {
    id: '10',
    name: 'Stainless Steel Pot Set',
    category: 'Kitchen',
    price: 89.99,
    stock: 20,
    description: '5-piece stainless steel pot and pan set',
    imageUrl: 'https://images.unsplash.com/photo-1584990347449-a5d9f800a783?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '11',
    name: 'Chef\'s Knife',
    category: 'Kitchen',
    price: 59.99,
    stock: 35,
    description: 'Professional 8-inch chef\'s knife',
    imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '12',
    name: 'Coffee Maker',
    category: 'Kitchen',
    price: 79.99,
    stock: 15,
    description: 'Programmable coffee maker with 12-cup capacity',
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  }
]; 