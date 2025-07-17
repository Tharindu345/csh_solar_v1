import { useState, useEffect } from 'react';
import { Subject, Observable, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';

export interface FilterOptions {
  search?: string;
  status?: string;
  type?: string;
  stage?: string;
}

export function useFilter<T>(
  filterFunction: (options: FilterOptions) => Observable<T[]>,
  debounceMs: number = 300
): {
  filters: FilterOptions;
  setFilter: (key: keyof FilterOptions, value: string) => void;
  results: T[];
  loading: boolean;
} {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterSubject] = useState(() => new Subject<FilterOptions>());

  useEffect(() => {
    const subscription = filterSubject.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      switchMap(filterOptions => {
        setLoading(true);
        return filterFunction(filterOptions);
      })
    ).subscribe({
      next: (data) => {
        setResults(data);
        setLoading(false);
      },
      error: (error) => {
        console.error('Filter error:', error);
        setLoading(false);
      }
    });

    // Initial load
    filterSubject.next(filters);

    return () => subscription.unsubscribe();
  }, [filterFunction, debounceMs, filterSubject]);

  const setFilter = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    filterSubject.next(newFilters);
  };

  return {
    filters,
    setFilter,
    results,
    loading
  };
}