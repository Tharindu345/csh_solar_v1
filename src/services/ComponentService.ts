import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseService } from './BaseService';
import { Component } from '../types';
import { mockComponents } from '../data/mockData';

class ComponentService extends BaseService<Component> {
  constructor() {
    super();
    // Initialize with mock data
    this.loadAll().subscribe();
  }

  loadAll(): Observable<Component[]> {
    return this.simulateApiCall(mockComponents).pipe(
      map(response => response.data),
      switchMap(components => {
        this.setItems(components);
        return of(components);
      })
    );
  }

  create(componentData: Omit<Component, 'id'>): Observable<Component> {
    const newComponent: Component = {
      id: Date.now().toString(),
      ...componentData,
    };

    return this.simulateApiCall(newComponent).pipe(
      map(response => response.data),
      switchMap(component => {
        const currentItems = this.getCurrentItems();
        this.setItems([...currentItems, component]);
        return of(component);
      })
    );
  }

  update(id: string, componentData: Partial<Component>): Observable<Component> {
    const currentItems = this.getCurrentItems();
    const existingComponent = currentItems.find(c => c.id === id);
    
    if (!existingComponent) {
      throw new Error('Component not found');
    }

    const updatedComponent: Component = {
      ...existingComponent,
      ...componentData,
    };

    return this.simulateApiCall(updatedComponent).pipe(
      map(response => response.data),
      switchMap(component => {
        const updatedItems = currentItems.map(c => c.id === id ? component : c);
        this.setItems(updatedItems);
        return of(component);
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

  filterByType(type: string): Observable<Component[]> {
    return this.items.pipe(
      map(components => 
        type === 'All' 
          ? components 
          : components.filter(component => component.type === type)
      )
    );
  }
}

export const componentService = new ComponentService();