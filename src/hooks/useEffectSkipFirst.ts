/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect } from 'react';

export default function useEffectSkipFirst(
  callback: (...args: any[]) => void,
  dependencyList: ReadonlyArray<any>,
) {
  const firstCall = useRef<boolean>(true);
  const callbackRef = useRef<(...args: any[]) => void>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (firstCall.current) {
      firstCall.current = false;
      return;
    }
    callbackRef.current();
  }, dependencyList);
}
