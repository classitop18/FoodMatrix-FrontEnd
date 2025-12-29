import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { toast } from "@/hooks/use-toast";

interface RetriableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _silentRefresh?: boolean; // Flag to suppress toast on automatic refresh
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

        // Handle token expiration
        if (
          error.response?.status === 401 &&
          (error.response?.data as any)?.errorCode === "TOKEN_EXPIRED" &&
          !originalRequest._retry &&
          isTokenAvailable
        ) {
          originalRequest._retry = true;

          // If already refreshing, queue this request
          if (this.refreshing) {
            return new Promise((resolve, reject) => {
              this.refreshSubscribers.push({
                resolve: (token: string) => {
                  originalRequest.headers = originalRequest.headers || {};
                  originalRequest.headers["Authorization"] = `Bearer ${token}`;
                  resolve(this.client(originalRequest));
                },
                reject,
              });
            });
          }

          this.refreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.processSubscribers(null, newToken);

            // Show success toast only if not a silent refresh
            if (
              !originalRequest._silentRefresh &&
              typeof window !== "undefined"
            ) {
              toast({
                variant: "success",
                title: "Session Refreshed",
                description: "Session refreshed successfully",
              });
            }

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

            return this.client(originalRequest);
          } catch (err) {
            this.processSubscribers(err as Error, null);
            this.handleLogout();
            return Promise.reject(err);
          }
        }

        // Handle other 401 errors (invalid token, no refresh token, etc.)
        if (error.response?.status === 401 && isTokenAvailable) {
          const errorCode = (error.response?.data as any)?.errorCode;
          const errorMessage = (error.response?.data as any)?.message;

          if (
            errorCode === "REFRESH_TOKEN_MISSING" ||
            errorCode === "SESSION_EXPIRED"
          ) {
            toast({
              variant: "destructive",
              title: "Session Expired",

              description: "Your session has expired. Please login again.",
            });
            this.handleLogout();
          } else if (
            errorCode === "INVALID_REFRESH_TOKEN" ||
            errorCode === "SESSION_INVALID"
          ) {
            toast({
              variant: "destructive",
              title: "Invalid Session",

              description: "Invalid session. Please login again.",
            });
            this.handleLogout();
          } else if (errorMessage) {
            toast({
              variant: "destructive",
              title: "Something went wrong",

              description: errorMessage,
            });
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private async refreshAccessToken(): Promise<string> {
    try {
      const response = await this.refreshClient.post("/auth/refresh-token");

      const newToken = response.data?.data?.accessToken;
      if (!newToken) {
        throw new Error("Invalid refresh response");
      }

      this.saveToken(newToken);
      this.refreshing = false;

      return newToken;
    } catch (error: any) {
      this.refreshing = false;

      // Handle specific refresh token errors
      const errorCode = error.response?.data?.errorCode;
      const errorMessage = error.response?.data?.message;

      if (errorCode === "REFRESH_TOKEN_MISSING") {
        toast({
          variant: "destructive",
          title: "Session Expired",

          description: "Your session has expired. Please login again.",
        });
      } else if (errorCode === "SESSION_EXPIRED") {
        toast({
          variant: "destructive",
          title: "Session Expired",

          description: "Your session has expired. Please login again.",
        });
      } else if (errorCode === "INVALID_REFRESH_TOKEN") {
        toast({
          variant: "destructive",
          title: "Invalid Session",

          description: "Invalid session. Please login again.",
        });
      } else if (errorMessage) {
        toast({
          variant: "destructive",
          title: "Something went wrong",

          description: errorMessage,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Something went wrong",

          description: "Failed to refresh session. Please login again.",
        });
      }

      throw error;
    }
  }

  private processSubscribers(error: Error | null, token: string | null) {
    this.refreshSubscribers.forEach(({ resolve, reject }) => {
      error ? reject(error) : resolve(token!);
    });
    this.refreshSubscribers = [];
  }

  private handleLogout() {
    this.clearToken();

    // Show logout toast
    if (typeof window !== "undefined") {
      toast({
        variant: "info",
        title: "Logged out",
        description: "You have been logged out. Redirecting to login...",
      });

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
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

  // Manual refresh token method (can be called explicitly)
  public async manualRefreshToken(): Promise<string> {
    try {
      const newToken = await this.refreshAccessToken();
      toast({
        variant: "success",
        title: "Session Refreshed",
        description: "Session refreshed successfully",
      });
      return newToken;
    } catch (error) {
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
