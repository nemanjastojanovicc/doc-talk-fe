/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function updateURLSearchParamsWithObject(
  usp: URLSearchParams,
  params: Record<string, any>,
) {
  Object.entries(params).forEach(([key, value]) =>
    value === null ? usp.delete(key) : usp.set(key, value),
  );
}
const getParamsObj = (urlParams: URLSearchParams) => {
  const res: { [key: string]: string } = {};
  urlParams.forEach((value, key) => (res[key] = value));
  return res;
};

const generateSearch = (urlParams: URLSearchParams) =>
  `?${urlParams.toString()}`;

export default function useQParamsActions<
  Params extends { [K in keyof Params]?: string } = Record<string, string>,
>() {
  const { search } = useLocation();
  const navigate = useNavigate();

  const getUrlSearchParams = useCallback(
    () => new URLSearchParams(window.location.search),
    [],
  );

  const paramsObj = useMemo(
    () => getParamsObj(new URLSearchParams(search)) as Params,
    [search],
  );

  const setQueryParam = useCallback(
    (key: keyof Params, value: string | number, replace = false) => {
      const urlSP = getUrlSearchParams();
      if (urlSP.get(key as string) === value.toString()) return;
      urlSP.set(key as string, value.toString());
      navigate(
        {
          search: generateSearch(urlSP),
        },
        { replace },
      );
    },
    [getUrlSearchParams, navigate],
  );

  const setMultipleQueryParams = useCallback(
    (
      params: Partial<Record<keyof Params, string | number | null>>,
      replace = false,
    ) => {
      const urlSP = getUrlSearchParams();
      updateURLSearchParamsWithObject(urlSP, params);
      navigate(
        {
          search: generateSearch(urlSP),
        },
        { replace },
      );
    },
    [navigate, getUrlSearchParams],
  );

  const removeQueryParam = useCallback(
    (key: keyof Params, replace = false) => {
      const urlSP = getUrlSearchParams();

      urlSP.delete(key as string);
      navigate(
        {
          search: generateSearch(urlSP),
        },
        { replace },
      );
    },
    [navigate, getUrlSearchParams],
  );

  const removeSeveralQueryParams = useCallback(
    (keys: (keyof Params)[], replace = false) => {
      const urlSP = getUrlSearchParams();

      Object.keys(paramsObj).forEach((key) => {
        if (keys.includes(key as keyof Params)) {
          urlSP.delete(key as string);
          navigate(
            {
              search: generateSearch(urlSP),
            },
            { replace },
          );
        }
      });
    },
    [getUrlSearchParams, navigate, paramsObj],
  );

  return {
    params: paramsObj,
    setQueryParam,
    removeQueryParam,
    setMultipleQueryParams,
    removeSeveralQueryParams,
  };
}
