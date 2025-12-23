import {
  QueryClient,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { MutationVariables } from 'models';

export default function useTanstackMutation<
  TResponseData,
  TRequestData = Record<string, unknown>,
  TError = AxiosError,
>(
  options?: UseMutationOptions<
    TResponseData,
    TError,
    MutationVariables<TRequestData>
  >,
  queryClient?: QueryClient,
): UseMutationResult<
  TResponseData,
  TError,
  MutationVariables<TRequestData>,
  unknown
> {
  return useMutation<
    TResponseData,
    TError,
    MutationVariables<TRequestData>,
    unknown
  >(options, queryClient);
}
