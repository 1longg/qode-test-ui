import axios, { type AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4040";

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isCancel(error)) {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} — ${error.response?.status}`,
        error.message,
      );
    }
    return Promise.reject(error);
  },
);

const axiosExports = { axios, apiInstance };

export default axiosExports;

export { apiInstance, AxiosResponse };
