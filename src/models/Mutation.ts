export type MutationVariables<T = Record<string, any>> = {
  method: 'post' | 'put' | 'patch' | 'delete';
  path: string;
  body?: T;
};
