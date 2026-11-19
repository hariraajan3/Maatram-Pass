import axios from "axios";

export const getBaseUrl = () => {
  let url = import.meta.env.BACKEND_URL || 'http://localhost:4000';
  if (!url.endsWith('/api')) url += '/api';
  return url;
};

const BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const api = apiClient;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED"
    ) {
      localStorage.removeItem("kk_session");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
