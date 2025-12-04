import axios from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Criar instância do axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função auxiliar para obter token (evita importação circular)
const obterToken = (): string | null => {
  return localStorage.getItem('token');
};

// Interceptor para requisições (adicionar token)
api.interceptors.request.use(
  (config) => {
    const token = obterToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas (tratar erros de autenticação)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se erro 401, redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Tratamento global de erros
    if (error.response) {
      console.error('Erro na resposta:', error.response.data);
    } else if (error.request) {
      console.error('Erro na requisição:', error.request);
    } else {
      console.error('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
