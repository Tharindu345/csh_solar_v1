import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseService } from './BaseService';
import { Package } from '../types';
import { mockPackages } from '../data/mockData';

class PackageService extends BaseService<Package> {
  constructor() {
    super();
    // Initialize with mock data
    this.loadAll().subscribe();
  }

  loadAll(): Observable<Package[]> {
    return this.simulateApiCall(mockPackages).pipe(
      map(response => response.data),
      switchMap(packages => {
        this.setItems(packages);
        return of(packages);
      })
    );
  }

  create(packageData: Omit<Package, 'id'>): Observable<Package> {
    const newPackage: Package = {
      id: Date.now().toString(),
      ...packageData,
    };

    return this.simulateApiCall(newPackage).pipe(
      map(response => response.data),
      switchMap(pkg => {
        const currentItems = this.getCurrentItems();
        this.setItems([...currentItems, pkg]);
        return of(pkg);
      })
    );
  }

  update(id: string, packageData: Partial<Package>): Observable<Package> {
    const currentItems = this.getCurrentItems();
    const existingPackage = currentItems.find(p => p.id === id);
    
    if (!existingPackage) {
      throw new Error('Package not found');
    }

    const updatedPackage: Package = {
      ...existingPackage,
      ...packageData,
    };

    return this.simulateApiCall(updatedPackage).pipe(
      map(response => response.data),
      switchMap(pkg => {
        const updatedItems = currentItems.map(p => p.id === id ? pkg : p);
        this.setItems(updatedItems);
        return of(pkg);
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

  filterByType(type: string): Observable<Package[]> {
    return this.items.pipe(
      map(packages => 
        type === 'All' 
          ? packages 
          : packages.filter(pkg => pkg.type === type)
      )
    );
  }
}

export const packageService = new PackageService();