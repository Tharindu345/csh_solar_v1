import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

export function useObservable<T>(
  observable: Observable<T>,
  initialValue: T
): T {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const subscription = observable.subscribe({
      next: setValue,
      error: (error) => console.error('Observable error:', error),
    });

    return () => subscription.unsubscribe();
  }, [observable]);

  return value;
}

export function useObservableWithLoading<T>(
  observable: Observable<T>,
  initialValue: T
): [T, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const subscription = observable.subscribe({
      next: (data) => {
        setValue(data);
        setLoading(false);
      },
      error: (error) => {
        console.error('Observable error:', error);
        setLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [observable]);

  return [value, loading];
}