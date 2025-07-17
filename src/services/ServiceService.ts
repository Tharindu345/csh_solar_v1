import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseService } from './BaseService';
import { Service } from '../types';
import { mockServices } from '../data/mockData';

class ServiceService extends BaseService<Service> {
  constructor() {
    super();
    // Initialize with mock data
    this.loadAll().subscribe();
  }

  loadAll(): Observable<Service[]> {
    return this.simulateApiCall(mockServices).pipe(
      map(response => response.data),
      switchMap(services => {
        this.setItems(services);
        return of(services);
      })
    );
  }

  create(serviceData: Omit<Service, 'id'>): Observable<Service> {
    const newService: Service = {
      id: Date.now().toString(),
      ...serviceData,
    };

    return this.simulateApiCall(newService).pipe(
      map(response => response.data),
      switchMap(service => {
        const currentItems = this.getCurrentItems();
        this.setItems([...currentItems, service]);
        return of(service);
      })
    );
  }

  update(id: string, serviceData: Partial<Service>): Observable<Service> {
    const currentItems = this.getCurrentItems();
    const existingService = currentItems.find(s => s.id === id);
    
    if (!existingService) {
      throw new Error('Service not found');
    }

    const updatedService: Service = {
      ...existingService,
      ...serviceData,
    };

    return this.simulateApiCall(updatedService).pipe(
      map(response => response.data),
      switchMap(service => {
        const updatedItems = currentItems.map(s => s.id === id ? service : s);
        this.setItems(updatedItems);
        return of(service);
      })
    );
  }

  delete(id: string): Observable<boolean> {
    return this.simulateApiCall(true).pipe(
      map(response => response.data),
      switchMap(success => {
        if (success) {
          const currentItems = this.getCurrentItems();
          const filteredItems = currentItems.filter(s => s.id !== id);
          this.setItems(filteredItems);
        }
        return of(success);
      })
    );
  }

  filterByStatus(status: string): Observable<Service[]> {
    return this.items.pipe(
      map(services => 
        status === 'All' 
          ? services 
          : services.filter(service => service.status === status)
      )
    );
  }

  filterByType(type: string): Observable<Service[]> {
    return this.items.pipe(
      map(services => 
        type === 'All' 
          ? services 
          : services.filter(service => service.type === type)
      )
    );
  }

  getServiceCounts(): Observable<{ scheduled: number; inProgress: number; completed: number }> {
    return this.items.pipe(
      map(services => ({
        scheduled: services.filter(s => s.status === 'Scheduled').length,
        inProgress: services.filter(s => s.status === 'In Progress').length,
        completed: services.filter(s => s.status === 'Completed').length,
      }))
    );
  }
}

export const serviceService = new ServiceService();