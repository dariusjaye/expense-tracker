"use client";

import { useState, useEffect } from 'react';
import { Expense, Vendor } from '@/lib/utils/expenseUtils';

export interface ExpenseFormProps {
  initialData?: Partial<Expense>;
  vendors: Vendor[];
  onSave: (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ExpenseForm({
  initialData,
  vendors,
  onSave,
  onCancel,
  isSubmitting
}: ExpenseFormProps) {
  // Form state
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [vendorId, setVendorId] = useState<string>('');
  const [vendorName, setVendorName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [tax, setTax] = useState<number>(0);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually'>('monthly');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      if (initialData.amount !== undefined) setAmount(initialData.amount);
      if (initialData.date) setDate(new Date(initialData.date).toISOString().split('T')[0]);
      if (initialData.vendorId) setVendorId(initialData.vendorId);
      if (initialData.vendorName) setVendorName(initialData.vendorName);
      if (initialData.category) setCategory(initialData.category);
      if (initialData.subcategory) setSubcategory(initialData.subcategory);
      if (initialData.paymentMethod) setPaymentMethod(initialData.paymentMethod);
      if (initialData.notes) setNotes(initialData.notes);
      if (initialData.receiptUrl) setReceiptUrl(initialData.receiptUrl);
      if (initialData.tax !== undefined) setTax(initialData.tax);
      if (initialData.isRecurring !== undefined) setIsRecurring(initialData.isRecurring);
      if (initialData.recurringFrequency) {
        setRecurringFrequency(initialData.recurringFrequency);
      }
      if (initialData.tags) setTags(initialData.tags);
      if (initialData.currency) setCurrency(initialData.currency);
      
      // If we have a vendorId, find the matching vendor to set the vendor name
      if (initialData.vendorId && vendors.length > 0) {
        const vendor = vendors.find(p => p.id === initialData.vendorId);
        if (vendor) {
          setVendorName(vendor.name);
        }
      }
    }
  }, [initialData, vendors]);

  // Handle vendor selection
  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVendorId = e.target.value;
    setVendorId(selectedVendorId);
    
    if (selectedVendorId) {
      const vendor = vendors.find(p => p.id === selectedVendorId);
      if (vendor) {
        setVendorName(vendor.name);
      }
    } else {
      setVendorName('');
    }
  };

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!amount || !date) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!vendorId && !vendorName) {
      alert('Please select or enter a vendor');
      return;
    }
    
    // Prepare expense data
    const expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
      amount,
      date,
      vendorId,
      vendorName,
      currency,
      category: category || 'Uncategorized',
      subcategory: subcategory || '',
      paymentMethod: paymentMethod || 'Other',
      notes: notes || '',
      receiptUrl: receiptUrl || '',
      tax: tax || 0,
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      tags: tags || [],
      items: initialData?.items || [],
    };
    
    onSave(expenseData);
  };

  // Category options
  const categories = [
    'Advertising',
    'Meals and Entertainment',
    'Office Supplies',
    'Rent',
    'Salaries',
    'Software',
    'Travel',
    'Utilities',
    'Other'
  ];

  // Payment method options
  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Check',
    'PayPal',
    'Other'
  ];

  // Recurring frequency options
  const frequencies = [
    'Daily',
    'Weekly',
    'Bi-Weekly',
    'Monthly',
    'Quarterly',
    'Annually'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {/* Vendor */}
        <div>
          <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">
            Vendor *
          </label>
          <select
            id="vendor"
            value={vendorId}
            onChange={handleVendorChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
            <option value="new">+ Add New Vendor</option>
          </select>
        </div>

        {/* New Vendor Name (shown only when "Add New Vendor" is selected) */}
        {vendorId === 'new' && (
          <div>
            <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700 mb-1">
              New Vendor Name *
            </label>
            <input
              type="text"
              id="vendorName"
              required={vendorId === 'new'}
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter vendor name"
            />
          </div>
        )}

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div>
          <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory
          </label>
          <input
            type="text"
            id="subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter subcategory"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {/* Tax */}
        <div>
          <label htmlFor="tax" className="block text-sm font-medium text-gray-700 mb-1">
            Tax
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="tax"
              step="0.01"
              min="0"
              value={tax}
              onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
              className="block w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Recurring Expense */}
      <div>
        <div className="flex items-center">
          <input
            id="isRecurring"
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
            This is a recurring expense
          </label>
        </div>
        
        {isRecurring && (
          <div className="mt-3 ml-6">
            <label htmlFor="recurringFrequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              id="recurringFrequency"
              value={recurringFrequency}
              onChange={(e) => setRecurringFrequency(e.target.value.toLowerCase() as 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select frequency</option>
              {frequencies.map((freq) => (
                <option key={freq} value={freq.toLowerCase()}>
                  {freq}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex items-center">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Add tags"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
        
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:text-blue-500 focus:outline-none"
                >
                  <span className="sr-only">Remove tag {tag}</span>
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Add any additional notes"
        />
      </div>

      {/* Receipt URL */}
      <div>
        <label htmlFor="receiptUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Receipt URL
        </label>
        <input
          type="text"
          id="receiptUrl"
          value={receiptUrl}
          onChange={(e) => setReceiptUrl(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter receipt URL"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Expense'}
        </button>
      </div>
    </form>
  );
} 