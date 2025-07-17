import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../../types';
import { mockCustomers } from '../../data/mockData';
import { RootState } from '../index';

interface CustomersState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
}

const initialState: CustomersState = {
  customers: mockCustomers,
  loading: false,
  error: null,
  searchTerm: '',
  statusFilter: 'All',
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customers = action.payload;
    },
    addCustomer: (state, action: PayloadAction<Omit<Customer, 'id'>>) => {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...action.payload,
        projects: [],
        createdAt: new Date().toISOString().split('T')[0],
      };
      state.customers.push(newCustomer);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
  },
});

// Selectors
export const selectCustomersState = (state: RootState) => state.customers;

export const selectFilteredCustomers = createSelector(
  [selectCustomersState],
  (customersState) => {
    const { customers, searchTerm, statusFilter } = customersState;
    
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }
);

export const selectCustomerById = createSelector(
  [selectCustomersState, (state: RootState, customerId: string) => customerId],
  (customersState, customerId) => 
    customersState.customers.find(customer => customer.id === customerId)
);

export const {
  setLoading,
  setError,
  setCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setSearchTerm,
  setStatusFilter,
} = customersSlice.actions;

export default customersSlice.reducer;