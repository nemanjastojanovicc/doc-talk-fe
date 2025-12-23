import { API_PATHS } from 'api';
import httpClient from 'api/httpClient';
import { AuthBody } from 'models';
import bus, { EventName } from 'modules/bus';

import storageService, { STORAGE_KEYS } from './storageService';

type OnUpdateCallback = (data: { event: EventName }) => void;

let refreshTokenPromise: Promise<string> = null;
let isPendingRefreshToken = false;

export default {
  get authBody() {
    return storageService.getItem<AuthBody>(STORAGE_KEYS.AUTH);
  },

  get account() {
    return storageService.getItem<AuthBody>(STORAGE_KEYS.AUTH)?.account;
  },

  get accessToken(): string {
    return storageService.getItem<AuthBody>(STORAGE_KEYS.AUTH)?.accessToken;
  },

  get refreshToken(): string {
    return storageService.getItem<AuthBody>(STORAGE_KEYS.AUTH)?.refreshToken;
  },

  _broadcastUpdateEvent() {
    bus.broadcastEvent(EventName.CREDENTIALS_UPDATE);
  },

  saveAuthBody(authBody: Partial<AuthBody>) {
    storageService.setItem(STORAGE_KEYS.AUTH, {
      ...(this.authBody || {}),
      ...authBody,
    });
    this._broadcastUpdateEvent();
  },

  removeAuthBody() {
    storageService.removeItem(STORAGE_KEYS.AUTH);
    this._broadcastUpdateEvent();
  },

  refreshAccessToken() {
    if (!isPendingRefreshToken) {
      isPendingRefreshToken = true;

      refreshTokenPromise = httpClient
        .post<Omit<AuthBody, 'account'>>(API_PATHS.auth.refreshToken())
        .then(({ data }) => {
          this.saveAuthBody(data);
          return data.accessToken;
        })
        .catch((err) => {
          throw err;
        })
        .finally(() => {
          isPendingRefreshToken = false;
        });
    }

    return refreshTokenPromise;
  },

  onUpdate(callback: OnUpdateCallback) {
    bus.addEventListener(EventName.CREDENTIALS_UPDATE, callback);
  },

  removeOnUpdate(callback: OnUpdateCallback) {
    bus.removeEventListener(EventName.CREDENTIALS_UPDATE, callback);
  },
};
