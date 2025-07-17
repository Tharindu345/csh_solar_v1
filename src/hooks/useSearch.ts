import { useState, useEffect } from 'react';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

export function useSearch<T>(
  searchFunction: (term: string) => Observable<T[]>,
  debounceMs: number = 300
): {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  results: T[];
  loading: boolean;
} {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchSubject] = useState(() => new Subject<string>());

  useEffect(() => {
    const subscription = searchSubject.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged(),
      switchMap(term => {
        setLoading(true);
        return searchFunction(term);
      })
    ).subscribe({
      next: (data) => {
        setResults(data);
        setLoading(false);
      },
      error: (error) => {
        console.error('Search error:', error);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [searchFunction, debounceMs, searchSubject]);

  const handleSetSearchTerm = (term: string) => {
    setSearchTerm(term);
    searchSubject.next(term);
  };

  return {
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    results,
    loading
  };
}