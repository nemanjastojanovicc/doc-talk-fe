/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react';

/**
 *
 * @param callback useEffect body function
 * @param changeDetectionDeps dependencies which change is being listened for calling callback
 * @param callbackDeps all dependencies used in callback to have latest values in callback
 * @param callInitially Initially call like useEffect is calling first time
 */
export default function useChangeDetection(
  callback: (...args: any[]) => void,
  changeDetectionDeps: ReadonlyArray<any>,
  callbackDeps: ReadonlyArray<any>,
  callInitially = true,
) {
  const shouldCall = useRef<boolean>(callInitially);
  const callbackRef = useRef<(...args: any[]) => void>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Set to call only when changeDetectionDeps change
  useEffect(() => {
    return () => {
      shouldCall.current = true;
    };
  }, changeDetectionDeps);

  // Call only when shouldCall is set to true
  useEffect(() => {
    if (!shouldCall.current) return;

    shouldCall.current = false;
    const cleanUpCallback = callbackRef.current();
    return cleanUpCallback;
  }, callbackDeps);
}
