import { useMemo, useState } from 'react';
import utils from 'utils';

type HookProps<T> = {
  init?: T;
  debounceTime?: number;
};

export default function useDebouncedState<T>({
  init,
  debounceTime = 100,
}: HookProps<T>) {
  const [value, setValue] = useState<T>(init);

  const debouncedSetState = useMemo(
    () => utils.debounce(setValue, debounceTime),
    [debounceTime],
  );

  return [value, debouncedSetState, setValue] as [
    T,
    React.Dispatch<React.SetStateAction<T>>,
    React.Dispatch<React.SetStateAction<T>>,
  ];
}
