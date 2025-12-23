import { API_PATHS } from 'api';
import Axios, { AxiosError } from 'axios';
import env from 'env';

import credentialsService from 'services/credentialsService';

declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const refreshTokenRoutes = [
  API_PATHS.auth.logout(),
  API_PATHS.auth.refreshToken(),
];

const httpClient = Axios.create({
  baseURL: env.SERVER_ENDPOINT,
  headers: {
    'ngrok-skip-browser-warning': true,
  },
});

httpClient.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    // If the header does not contain the token and the url not public, redirect to login

    const { accessToken, refreshToken } = credentialsService;
    const useRefreshToken = refreshTokenRoutes.includes(config.url);

    const token = useRefreshToken ? refreshToken : accessToken;

    if (token && config.method !== 'OPTIONS') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

httpClient.interceptors.response.use(null, async (error: AxiosError) => {
  const originalRequest = error.config;

  if (
    error.response?.status === 401 &&
    !originalRequest._retry &&
    credentialsService.refreshToken
  ) {
    originalRequest._retry = true;

    try {
      const newToken = await credentialsService.refreshAccessToken();
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

      return httpClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(
        (refreshError as AxiosError)?.response?.data || refreshError,
      );
    }
  }

  return Promise.reject(error?.response?.data || error);
});

export default httpClient;
