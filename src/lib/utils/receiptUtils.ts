import { Expense } from './expenseUtils';
import { VeryfiReceiptData } from '../veryfi/veryfiClient';

/**
 * Process receipt data from Veryfi and convert it to our Expense format
 */
export async function processReceipt(receiptData: VeryfiReceiptData): Promise<Partial<Expense>> {
  try {
    // Extract relevant data from the Veryfi response
    const {
      total,
      payment_method,
      date,
      vendor,
      category,
      notes,
      tax,
      items: line_items,
    } = receiptData;

    // Map Veryfi data to our Expense format
    const expenseData: Partial<Expense> = {
      amount: parseFloat(total.toString()) || 0,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      vendorName: vendor?.name || '',
      category: category || 'Uncategorized',
      paymentMethod: payment_method || 'Other',
      notes: notes || '',
      tax: tax ? parseFloat(tax.toString()) : 0,
      items: line_items?.map(item => ({
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: item.unit_price || 0,
        amount: item.total || 0,
      })) || [],
    };

    return expenseData;
  } catch (error) {
    console.error('Error processing receipt data:', error);
    throw new Error('Failed to process receipt data');
  }
} 