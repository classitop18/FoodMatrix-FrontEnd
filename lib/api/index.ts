import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

interface RetriableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

type RefreshSubscriber = {
  resolve: (token: string) => void;
  reject: (reason?: any) => void;
};

class ApiClient {
  private client: AxiosInstance;
  private refreshClient: AxiosInstance;
  private refreshing = false;
  private refreshSubscribers: RefreshSubscriber[] = [];
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1",
      withCredentials: true,
    });

    // Separate axios instance for refresh token (so it doesn't trigger interceptors)
    this.refreshClient = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1",
      withCredentials: true,
    });

    this.loadTokenFromStorage();
    this.setupInterceptors();
  }

  private loadTokenFromStorage() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
    }
  }

  private saveToken(token: string) {
    this.accessToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  }

  private clearToken() {
    this.accessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("accessToken");
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const isTokenAvailable = localStorage.getItem("accessToken");
        const originalRequest = error.config as RetriableRequestConfig;

        if (
          error.response?.status === 401 &&
          (error.response?.data as any)?.errorCode === "TOKEN_EXPIRED" &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          if (this.refreshing) {
            return new Promise((resolve, reject) => {
              this.refreshSubscribers.push({ resolve, reject });
            });
          }

          this.refreshing = true;
          try {
            const newToken = await this.refreshAccessToken();
            this.processSubscribers(null, newToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

            return this.client(originalRequest);
          } catch (err) {
            this.processSubscribers(err as Error, null);
            this.handleLogout();
            return Promise.reject(err);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private async refreshAccessToken(): Promise<string> {
    const response = await this.refreshClient.post("/auth/refresh-token");

    const newToken = response.data?.data?.accessToken;
    if (!newToken) throw new Error("Invalid refresh response");

    this.saveToken(newToken);
    this.refreshing = false;

    return newToken;
  }

  private processSubscribers(error: Error | null, token: string | null) {
    this.refreshSubscribers.forEach(({ resolve, reject }) => {
      error ? reject(error) : resolve(token!);
    });
    this.refreshSubscribers = [];
  }

  private handleLogout() {
    this.clearToken();
    // Optionally redirect user to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  // Public exposed methods
  public get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config);
  }
  public delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
