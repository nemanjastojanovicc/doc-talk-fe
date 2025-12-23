import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import utils from 'utils';

export default function useInfinitePagination<T>(
  makeRequest: (
    currentPage: number,
    searchString: string,
  ) => Promise<{ items: T[]; totalPages: number }>,
  defaultItems: T[] = [],
  customSetItems?: React.Dispatch<React.SetStateAction<T[]>>,
  dependencies: Array<any> = [],
  debounceTime: number = null,
  skipFirst = false,
) {
  const [loading, setLoading] = useState(!skipFirst);
  const [items, setItems] = useState<T[]>(defaultItems);
  const [searchString, setSearchString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lastSearchString = useRef(searchString);
  const first = useRef(true);
  const skipFirstRef = useRef(skipFirst);

  const onContainerScrolled = useCallback(() => {
    if (loading) return;
    if (currentPage < totalPages) {
      setCurrentPage((old) => old + 1);
    }
  }, [loading, currentPage, totalPages]);

  const setItemsFinal = useMemo(
    () => customSetItems || setItems,
    [customSetItems],
  );

  const getLibraryFiles = useMemo(
    () =>
      utils.debounce(
        async (
          currentPage: number,
          searchString: string,
          setItemsFinal: React.Dispatch<React.SetStateAction<T[]>>,
        ) => {
          try {
            setLoading(true);
            const { items, totalPages } = await makeRequest(
              currentPage,
              searchString,
            );
            if (lastSearchString.current !== searchString) {
              lastSearchString.current = searchString;
              setItemsFinal(items);
            } else {
              setItemsFinal((old: T[]) => [...old, ...items]);
            }
            setTotalPages(totalPages);
          } catch (e) {
            utils.toastError(e);
          } finally {
            setLoading(false);
          }
        },
        debounceTime,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debounceTime, ...dependencies],
  );
  useEffect(() => {
    if (skipFirstRef.current && first.current) {
      first.current = false;
      return;
    }

    getLibraryFiles(currentPage, searchString, setItemsFinal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchString, ...dependencies, setItemsFinal]);

  return {
    items,
    loading,
    searchString,
    currentPage,
    totalPages,
    setItems,
    onContainerScrolled,
    setSearchString,
    setCurrentPage,
  };
}
