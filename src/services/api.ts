const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface RegisterUserData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface ConfirmEmailData {
  email: string;
  verificationCode: string;
}

export interface ConfirmEmailResponse {
  message: string;
  success: boolean;
}

export interface ResendVerificationData {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

class ApiService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('basurapp-token');
  }

  private setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('basurapp-token', token);
  }

  private removeAuthToken(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem('basurapp-token');
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as ApiError;
        const message = Array.isArray(error.message)
          ? error.message.join(', ')
          : error.message;
        throw new Error(message || 'Error en la petición');
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  }

  async registerUser(data: RegisterUserData): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmEmail(data: ConfirmEmailData): Promise<ConfirmEmailResponse> {
    return this.request<ConfirmEmailResponse>('/users/confirm-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Guardar el token
    this.setAuthToken(response.accessToken);

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Remover token incluso si la petición falla
      this.removeAuthToken();
    }
  }

  async resendVerification(data: ResendVerificationData): Promise<ResendVerificationResponse> {
    return this.request<ResendVerificationResponse>('/users/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
