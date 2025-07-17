import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseService } from './BaseService';
import { Payment } from '../types';
import { mockPayments } from '../data/mockData';

class PaymentService extends BaseService<Payment> {
  constructor() {
    super();
    // Initialize with mock data
    this.loadAll().subscribe();
  }

  loadAll(): Observable<Payment[]> {
    return this.simulateApiCall(mockPayments).pipe(
      map(response => response.data),
      switchMap(payments => {
        this.setItems(payments);
        return of(payments);
      })
    );
  }

  create(paymentData: Omit<Payment, 'id'>): Observable<Payment> {
    const newPayment: Payment = {
      id: Date.now().toString(),
      ...paymentData,
    };

    return this.simulateApiCall(newPayment).pipe(
      map(response => response.data),
      switchMap(payment => {
        const currentItems = this.getCurrentItems();
        this.setItems([...currentItems, payment]);
        return of(payment);
      })
    );
  }

  update(id: string, paymentData: Partial<Payment>): Observable<Payment> {
    const currentItems = this.getCurrentItems();
    const existingPayment = currentItems.find(p => p.id === id);
    
    if (!existingPayment) {
      throw new Error('Payment not found');
    }

    const updatedPayment: Payment = {
      ...existingPayment,
      ...paymentData,
    };

    return this.simulateApiCall(updatedPayment).pipe(
      map(response => response.data),
      switchMap(payment => {
        const updatedItems = currentItems.map(p => p.id === id ? payment : p);
        this.setItems(updatedItems);
        return of(payment);
      })
    );
  }

  delete(id: string): Observable<boolean> {
    return this.simulateApiCall(true).pipe(
      map(response => response.data),
      switchMap(success => {
        if (success) {
          const currentItems = this.getCurrentItems();
          const filteredItems = currentItems.filter(p => p.id !== id);
          this.setItems(filteredItems);
        }
        return of(success);
      })
    );
  }

  getPaymentsByProject(projectId: string): Observable<Payment[]> {
    return this.items.pipe(
      map(payments => payments.filter(payment => payment.projectId === projectId))
    );
  }

  filterByStatus(status: string): Observable<Payment[]> {
    return this.items.pipe(
      map(payments => 
        status === 'All' 
          ? payments 
          : payments.filter(payment => payment.status === status)
      )
    );
  }

  filterByStage(stage: string): Observable<Payment[]> {
    return this.items.pipe(
      map(payments => 
        stage === 'All' 
          ? payments 
          : payments.filter(payment => payment.stage === stage)
      )
    );
  }

  getTotalsByStatus(): Observable<{ paid: number; pending: number; overdue: number }> {
    return this.items.pipe(
      map(payments => ({
        paid: payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0),
        pending: payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0),
        overdue: payments.filter(p => p.status === 'Overdue').reduce((sum, p) => sum + p.amount, 0),
      }))
    );
  }
}

export const paymentService = new PaymentService();