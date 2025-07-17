import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { map, catchError, delay, tap } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export abstract class BaseService<T> {
  protected items$ = new BehaviorSubject<T[]>([]);
  protected loading$ = new BehaviorSubject<boolean>(false);
  protected error$ = new BehaviorSubject<string | null>(null);

  // Public observables
  public readonly items: Observable<T[]> = this.items$.asObservable();
  public readonly loading: Observable<boolean> = this.loading$.asObservable();
  public readonly error: Observable<string | null> = this.error$.asObservable();

  protected setLoading(loading: boolean): void {
    this.loading$.next(loading);
  }

  protected setError(error: string | null): void {
    this.error$.next(error);
  }

  protected setItems(items: T[]): void {
    this.items$.next(items);
  }

  protected getCurrentItems(): T[] {
    return this.items$.value;
  }

  // Simulate API call with delay
  protected simulateApiCall<R>(data: R, delay_ms: number = 500): Observable<ApiResponse<R>> {
    this.setLoading(true);
    this.setError(null);
    
    return new Observable<ApiResponse<R>>(observer => {
      setTimeout(() => {
        // Simulate occasional errors (5% chance)
        if (Math.random() < 0.05) {
          observer.error(new Error('Simulated API error'));
        } else {
          observer.next({
            data,
            success: true,
            message: 'Operation successful'
          });
          observer.complete();
        }
      }, delay_ms);
    }).pipe(
      tap(() => this.setLoading(false)),
      catchError(error => {
        this.setLoading(false);
        this.setError(error.message);
        return throwError(() => error);
      })
    );
  }

  abstract loadAll(): Observable<T[]>;
  abstract create(item: Omit<T, 'id'>): Observable<T>;
  abstract update(id: string, item: Partial<T>): Observable<T>;
  abstract delete(id: string): Observable<boolean>;
}