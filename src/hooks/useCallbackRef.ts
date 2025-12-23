import { useCallback, useState } from 'react';

export default function useCallbackRef<T = Record<string, any>>(init?: T) {
  const [ref, setRef] = useState<T | undefined>(init);

  const refCallback = useCallback((element: T) => {
    if (element !== null) {
      setRef(element);
    }
  }, []);

  return [ref, refCallback] as [T, (element: T) => void];
}
