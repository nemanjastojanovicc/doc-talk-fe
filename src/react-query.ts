import {
  MutationFunction,
  QueryClient,
  QueryFunction,
} from '@tanstack/react-query';

import httpClient from 'api/httpClient';
import { MutationVariables } from 'models';

const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const [path, params] = queryKey as [string, Record<string, string>];

  const { data } = await httpClient.get(path, { params });

  return data;
};

const defaultMutationFn = async ({ method, path, body }: MutationVariables) => {
  const { data } = await httpClient({
    method,
    url: path,
    data: body,
  });

  return data;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
    mutations: {
      mutationFn: defaultMutationFn as MutationFunction<unknown, unknown>,
    },
  },
});
