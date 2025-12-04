import api from './api';
import type { LoginRequest, LoginResponse, Usuario, TrocarSenhaRequest } from '../types';

export const authService = {
  // Login
  login: async (dados: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', dados);
    return response.data;
  },

  // Buscar dados do usuário logado
  me: async (): Promise<Usuario> => {
    const response = await api.get('/auth/me');
    return response.data.usuario;
  },

  // Trocar senha
  trocarSenha: async (dados: TrocarSenhaRequest): Promise<void> => {
    await api.post('/auth/trocar-senha', dados);
  },

  // Salvar token
  salvarToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  // Obter token
  obterToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Remover token
  removerToken: (): void => {
    localStorage.removeItem('token');
  },

  // Verificar se está autenticado
  estaAutenticado: (): boolean => {
    return !!authService.obterToken();
  }
};

export default authService;
