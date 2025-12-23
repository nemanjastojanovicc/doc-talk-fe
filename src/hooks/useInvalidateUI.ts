import { useEffect, useRef, useState } from 'react';

export default function useInvalidateUI() {
  const [invalidate, setInvalidate] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const timeout = useRef<NodeJS.Timeout | number>();

  useEffect(() => {
    const toggle = () => {
      clearTimeout(timeout.current as number);
      setInvalidate((old) => !old);
      setIsResizing(true);
      timeout.current = setTimeout(() => setIsResizing(false), 200);
    };
    window.addEventListener('resize', toggle);
    return () => {
      return window.removeEventListener('resize', toggle);
    };
  });

  return { invalidate, isResizing };
}
