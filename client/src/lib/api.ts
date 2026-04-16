import axios, { AxiosInstance, AxiosError } from 'axios';

// Configurar base URL do backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Criar instância do axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para tratar erros
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

// ============ AUTH ENDPOINTS ============

export const authAPI = {
  // Iniciar login com Google
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/api/v1/auth/google`;
  },

  // Verificar saúde do serviço
  health: async () => {
    return apiClient.get('/api/v1/auth/health');
  },
};

// ============ USERS ENDPOINTS ============

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface UpdateUserDto {
  name?: string;
  avatar?: string;
  bio?: string;
}

export const usersAPI = {
  // Obter todos os usuários
  getAll: async (page: number = 1, limit: number = 10) => {
    return apiClient.get<{ data: User[]; total: number }>('/api/v1/users', {
      params: { page, limit },
    });
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    return apiClient.get<User>('/api/v1/users/me');
  },

  // Obter usuário por ID
  getById: async (id: string) => {
    return apiClient.get<User>(`/api/v1/users/${id}`);
  },

  // Criar novo usuário
  create: async (data: CreateUserDto) => {
    return apiClient.post<User>('/api/v1/users', data);
  },

  // Atualizar usuário
  update: async (id: string, data: UpdateUserDto) => {
    return apiClient.put<User>(`/api/v1/users/${id}`, data);
  },

  // Deletar usuário
  delete: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/api/v1/users/${id}`);
  },
};

// ============ UTILITY FUNCTIONS ============

export const getStoredToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const getStoredUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setStoredToken = (token: string) => {
  localStorage.setItem('access_token', token);
};

export const setStoredUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
};
