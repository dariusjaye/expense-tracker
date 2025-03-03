import { Expense, ExpenseFilter, Payee, EXPENSE_CATEGORIES } from '../utils/expenseUtils';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp,
  DocumentReference,
  DocumentData,
  startAfter,
  limit as firestoreLimit,
  limit,
  Query,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { Vendor } from '@/lib/utils/expenseUtils';

// Vendor functions
export async function addVendor(userId: string, vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendor> {
  if (!userId) {
    throw new Error('User ID is required to add a vendor');
  }
  
  const vendorData = {
    ...vendor,
    userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  try {
    const docRef = await addDoc(collection(db, 'vendors'), vendorData);
    
    return {
      id: docRef.id,
      ...vendor,
      createdAt: vendorData.createdAt,
      updatedAt: vendorData.updatedAt,
    };
  } catch (error) {
    console.error('Error adding vendor:', error);
    throw error;
  }
}

export async function getVendors(userId: string): Promise<Vendor[]> {
  console.log('getVendors called with userId:', userId);
  
  if (!userId) {
    console.error('getVendors called with empty userId');
    return [];
  }
  
  try {
    // Always include userId filter and limit for security rules compliance
    const vendorsQuery = query(
      collection(db, 'vendors'),
      where('userId', '==', userId),
      limit(1000)
    );
    
    console.log('Executing vendors query with filter userId ==', userId);
    const snapshot = await getDocs(vendorsQuery);
    
    // Check if snapshot is valid
    if (!snapshot || !snapshot.docs) {
      console.error('Invalid snapshot returned from Firestore');
      return [];
    }
    
    console.log('Query executed, docs count:', snapshot.docs.length);
    
    // Ensure we're returning an array
    const vendors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Vendor));
    
    console.log('Processed vendors count:', vendors.length);
    return Array.isArray(vendors) ? vendors : [];
    
  } catch (error) {
    console.error('Error in getVendors:', error);
    
    // Check if this is a missing index error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('index') || errorMessage.includes('Index')) {
      console.warn('Missing index for vendors query. Please create the required index in Firebase console.');
      console.log('Index error details:', errorMessage);
    }
    
    // Return empty array but log the error
    return [];
  }
}

export async function getVendorById(vendorId: string): Promise<Vendor | null> {
  if (!vendorId) {
    console.error('getVendorById called with empty vendorId');
    return null;
  }
  
  try {
    const docRef = doc(db, 'vendors', vendorId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Vendor;
  } catch (error) {
    console.error('Error getting vendor by ID:', error);
    return null;
  }
}

export async function updateVendor(vendorId: string, vendorData: Partial<Vendor>): Promise<void> {
  if (!vendorId) {
    throw new Error('Vendor ID is required to update a vendor');
  }
  
  try {
    const docRef = doc(db, 'vendors', vendorId);
    
    // Remove id, createdAt, and updatedAt from the update data
    const { id, createdAt, updatedAt, ...updateData } = vendorData as any;
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    throw error;
  }
}

export async function deleteVendor(vendorId: string): Promise<void> {
  if (!vendorId) {
    throw new Error('Vendor ID is required to delete a vendor');
  }
  
  try {
    const docRef = doc(db, 'vendors', vendorId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
}

// For backward compatibility
export const addPayee = addVendor;
export const getPayees = getVendors;
export const getPayeeById = getVendorById;
export const updatePayee = updateVendor;
export const deletePayee = deleteVendor;

// Expense functions
export async function addExpense(userId: string, expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
  if (!userId) {
    throw new Error('User ID is required to add an expense');
  }
  
  // Use client-side timestamps for better performance
  const now = Date.now();
  
  const expenseData = {
    ...expense,
    userId,
    createdAt: now,
    updatedAt: now
  };
  
  try {
    const docRef = await addDoc(collection(db, 'expenses'), expenseData);
    
    // Return the expense with the new ID without waiting for server response
    return {
      id: docRef.id,
      ...expense,
      createdAt: now,
      updatedAt: now
    } as Expense;
  } catch (error) {
    console.error('Error adding expense to Firestore:', error);
    throw error;
  }
}

export async function getExpenses(
  userId: string, 
  filter?: ExpenseFilter, 
  limitCount: number = 50, 
  lastDoc?: any
): Promise<{ expenses: Expense[], lastDoc: any }> {
  console.log('getExpenses called with userId:', userId, 'limitCount:', limitCount);
  
  if (!userId) {
    console.error('getExpenses called with empty userId');
    return { expenses: [], lastDoc: null };
  }
  
  try {
    // Create an array of query constraints
    const constraints: QueryConstraint[] = [
      // Always include userId filter first for security rules compliance
      where('userId', '==', userId),
      limit(limitCount)
    ];
    
    // Apply pagination if lastDoc is provided
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
      console.log('Applied pagination with lastDoc');
    }
    
    // Create the query with all constraints
    const expensesQuery = query(collection(db, 'expenses'), ...constraints);
    console.log('Executing expenses query with filter userId ==', userId);
    
    const snapshot = await getDocs(expensesQuery);
    
    // Check if snapshot is valid
    if (!snapshot || !snapshot.docs) {
      console.error('Invalid snapshot returned from Firestore');
      return { expenses: [], lastDoc: null };
    }
    
    console.log('Query executed, docs count:', snapshot.docs.length);
    
    // Get the last document for pagination
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    
    // Ensure we have an array of expenses
    let expenses: Expense[] = [];
    
    if (snapshot.docs && Array.isArray(snapshot.docs)) {
      expenses = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          vendorId: data.vendorId || data.payeeId,
          vendorName: data.vendorName || data.payeeName,
          date: data.date,
          amount: data.amount,
          currency: data.currency,
          category: data.category,
          subcategory: data.subcategory,
          paymentMethod: data.paymentMethod,
          receiptUrl: data.receiptUrl,
          notes: data.notes,
          items: data.items,
          tax: data.tax,
          isRecurring: data.isRecurring,
          recurringFrequency: data.recurringFrequency,
          tags: data.tags,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt || Date.now(),
          updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt || Date.now()
        } as Expense;
      });
    } else {
      console.error('Snapshot docs is not an array:', snapshot.docs);
    }
    
    // Ensure expenses is always an array before applying filters
    if (!Array.isArray(expenses)) {
      console.error('Expenses is not an array after mapping:', expenses);
      expenses = [];
    }
    
    // Apply in-memory filters if needed
    if (filter && expenses.length > 0) {
      let originalCount = expenses.length;
      
      // Date range filter
      if (filter.startDate && filter.endDate) {
        expenses = expenses.filter(expense => 
          expense.date >= filter.startDate! && expense.date <= filter.endDate!
        );
        console.log(`Applied date range filter: ${originalCount} -> ${expenses.length}`);
        originalCount = expenses.length;
      }
      
      // Categories filter
      if (filter.categories && filter.categories.length > 0) {
        expenses = expenses.filter(expense => 
          filter.categories!.includes(expense.category)
        );
        console.log(`Applied categories filter: ${originalCount} -> ${expenses.length}`);
        originalCount = expenses.length;
      }
      
      // Vendor IDs filter
      if (filter.vendorIds && filter.vendorIds.length > 0) {
        expenses = expenses.filter(expense => 
          filter.vendorIds!.includes(expense.vendorId)
        );
        console.log(`Applied vendorIds filter: ${originalCount} -> ${expenses.length}`);
        originalCount = expenses.length;
      }
      
      // Amount filters
      if (filter.minAmount !== undefined) {
        expenses = expenses.filter(expense => expense.amount >= filter.minAmount!);
        console.log(`Applied minAmount filter: ${originalCount} -> ${expenses.length}`);
        originalCount = expenses.length;
      }
      
      if (filter.maxAmount !== undefined) {
        expenses = expenses.filter(expense => expense.amount <= filter.maxAmount!);
        console.log(`Applied maxAmount filter: ${originalCount} -> ${expenses.length}`);
        originalCount = expenses.length;
      }
      
      // Search term filter
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        expenses = expenses.filter(expense => 
          expense.vendorName?.toLowerCase().includes(searchLower) ||
          expense.notes?.toLowerCase().includes(searchLower) ||
          expense.category?.toLowerCase().includes(searchLower)
        );
        console.log(`Applied searchTerm filter: ${originalCount} -> ${expenses.length}`);
        originalCount = expenses.length;
      }
      
      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        expenses = expenses.filter(expense => 
          expense.tags && expense.tags.some(tag => filter.tags!.includes(tag))
        );
        console.log(`Applied tags filter: ${originalCount} -> ${expenses.length}`);
      }
    }
    
    console.log('Returning expenses count:', expenses.length);
    return { expenses: Array.isArray(expenses) ? expenses : [], lastDoc: lastVisible };
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return { expenses: [], lastDoc: null };
  }
}

export async function getExpenseById(expenseId: string): Promise<Expense | null> {
  if (!expenseId) {
    console.error('getExpenseById called with empty expenseId');
    return null;
  }
  
  try {
    const docRef = doc(db, 'expenses', expenseId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      vendorId: data.vendorId || data.payeeId,
      vendorName: data.vendorName || data.payeeName,
      date: data.date,
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      subcategory: data.subcategory,
      paymentMethod: data.paymentMethod,
      receiptUrl: data.receiptUrl,
      notes: data.notes,
      items: data.items,
      tax: data.tax,
      isRecurring: data.isRecurring,
      recurringFrequency: data.recurringFrequency,
      tags: data.tags,
      createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt || Date.now(),
      updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt || Date.now()
    } as Expense;
  } catch (error) {
    console.error('Error getting expense by ID:', error);
    return null;
  }
}

export async function updateExpense(expenseId: string, expenseData: Partial<Expense>): Promise<void> {
  if (!expenseId) {
    throw new Error('Expense ID is required to update an expense');
  }
  
  try {
    const docRef = doc(db, 'expenses', expenseId);
    
    // Remove id, createdAt, and updatedAt from the update data
    const { id, createdAt, updatedAt, ...updateData } = expenseData as any;
    
    // Use client-side timestamp for better performance
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
}

export async function deleteExpense(expenseId: string): Promise<void> {
  if (!expenseId) {
    throw new Error('Expense ID is required to delete an expense');
  }
  
  try {
    const docRef = doc(db, 'expenses', expenseId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
} 