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

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
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
}

export const apiService = new ApiService();
