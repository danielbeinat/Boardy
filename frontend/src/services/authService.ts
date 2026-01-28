import type { User } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: Array<{
    msg: string;
    param: string;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem("auth-token");
  }

  // Set token and store in localStorage
  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth-token", token);
  }

  // Get token
  getToken(): string | null {
    return this.token;
  }

  // Clear token
  clearToken() {
    this.token = null;
    localStorage.removeItem("auth-token");
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Get auth headers
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Register user
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        this.setToken(data.data.token);
      }

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  }

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        this.setToken(data.data.token);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        // If token is invalid, clear it
        if (response.status === 401) {
          this.clearToken();
        }
        return {
          success: false,
          message: data.message || "Failed to get user info",
        };
      }

      return data;
    } catch (error) {
      console.error("Get current user error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  }

  // Logout
  async logout(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      // Clear token regardless of response
      this.clearToken();

      return data;
    } catch (error) {
      console.error("Logout error:", error);
      // Clear token even on error
      this.clearToken();
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  }

  // Validate token
  async validateToken(): Promise<boolean> {
    if (!this.token) return false;

    try {
      const response = await this.getCurrentUser();
      return response.success;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }
}

export const authService = new AuthService();
