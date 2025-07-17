import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseService } from './BaseService';
import { Customer } from '../types';
import { mockCustomers } from '../data/mockData';

class CustomerService extends BaseService<Customer> {
  constructor() {
    super();
    // Initialize with mock data
    this.loadAll().subscribe();
  }

  loadAll(): Observable<Customer[]> {
    return this.simulateApiCall(mockCustomers).pipe(
      map(response => response.data),
      switchMap(customers => {
        this.setItems(customers);
        return of(customers);
      })
    );
  }

  create(customerData: Omit<Customer, 'id'>): Observable<Customer> {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...customerData,
      createdAt: new Date().toISOString().split('T')[0],
      projects: [],
    };

    return this.simulateApiCall(newCustomer).pipe(
      map(response => response.data),
      switchMap(customer => {
        const currentItems = this.getCurrentItems();
        this.setItems([...currentItems, customer]);
        return of(customer);
      })
    );
  }

  update(id: string, customerData: Partial<Customer>): Observable<Customer> {
    const currentItems = this.getCurrentItems();
    const existingCustomer = currentItems.find(c => c.id === id);
    
    if (!existingCustomer) {
      throw new Error('Customer not found');
    }

    const updatedCustomer: Customer = {
      ...existingCustomer,
      ...customerData,
    };

    return this.simulateApiCall(updatedCustomer).pipe(
      map(response => response.data),
      switchMap(customer => {
        const updatedItems = currentItems.map(c => c.id === id ? customer : c);
        this.setItems(updatedItems);
        return of(customer);
      })
    );
  }

  delete(id: string): Observable<boolean> {
    return this.simulateApiCall(true).pipe(
      map(response => response.data),
      switchMap(success => {
        if (success) {
          const currentItems = this.getCurrentItems();
          const filteredItems = currentItems.filter(c => c.id !== id);
          this.setItems(filteredItems);
        }
        return of(success);
      })
    );
  }

  searchCustomers(searchTerm: string): Observable<Customer[]> {
    return this.items.pipe(
      map(customers => 
        customers.filter(customer =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  filterByStatus(status: string): Observable<Customer[]> {
    return this.items.pipe(
      map(customers => 
        status === 'All' 
          ? customers 
          : customers.filter(customer => customer.status === status)
      )
    );
  }
}

export const customerService = new CustomerService();