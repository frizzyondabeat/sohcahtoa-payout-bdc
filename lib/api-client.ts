/**
 * Axios API client with 401 interceptor and token refresh.
 * Refresh token is in an HTTP-only cookie (sent automatically with withCredentials).
 * Access token is also in an HTTP-only cookie; no Bearer header needed.
 * On 401: POST refresh (cookie sent) → server sets new cookies → retry with new cookies.
 */

import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { getSignInUrlWithRedirect } from '@/lib/utils';

const REFRESH_URL = '/api/auth/refresh';
const LOGOUT_URL = '/api/auth/logout';

/** Callbacks for requests queued during refresh - retry with current cookies */
type RefreshSubscriber = () => void;

function createApiClient(baseURL = ''): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });

  let isRefreshing = false;
  const refreshSubscribers: RefreshSubscriber[] = [];

  const subscribeTokenRefresh = (callback: RefreshSubscriber) => {
    refreshSubscribers.push(callback);
  };

  const onRefreshed = () => {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers.length = 0;
  };

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
      const status = error.response?.status;
      const url = originalRequest.url ?? '';

      if (
        status === 401 &&
        !originalRequest._retry &&
        !url.includes(REFRESH_URL) &&
        !url.includes(LOGOUT_URL)
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh(() => {
              client(originalRequest)
                .then((response) => resolve(response))
                .catch((err) => reject(err));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await client.post(REFRESH_URL);

          onRefreshed();

          return client(originalRequest);
        } catch (refreshError) {
          try {
            await axios.post(LOGOUT_URL, {}, { withCredentials: true });
          } finally {
            const fromPath =
              typeof window !== 'undefined'
                ? window.location.pathname + window.location.search
                : '';
            window.location.href = getSignInUrlWithRedirect(fromPath);
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

/** Pre-configured client for app API routes (cookie-based auth) */
export const apiClient = createApiClient();
