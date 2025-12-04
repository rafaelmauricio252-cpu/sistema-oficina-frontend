import api from './api';
import type { Usuario, CriarUsuarioRequest, AtualizarUsuarioRequest, ResetarSenhaResponse } from '../types';

export const usuarioService = {
  // Listar todos os usuários
  listar: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  // Buscar usuário por ID
  buscarPorId: async (id: number): Promise<Usuario> => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Criar novo usuário
  criar: async (dados: CriarUsuarioRequest): Promise<Usuario> => {
    const response = await api.post('/usuarios', dados);
    return response.data;
  },

  // Atualizar usuário
  atualizar: async (id: number, dados: AtualizarUsuarioRequest): Promise<Usuario> => {
    const response = await api.put(`/usuarios/${id}`, dados);
    return response.data;
  },

  // Atualizar permissões
  atualizarPermissoes: async (id: number, permissoes: string[]): Promise<void> => {
    await api.patch(`/usuarios/${id}/permissoes`, { permissoes });
  },

  // Resetar senha
  resetarSenha: async (id: number): Promise<ResetarSenhaResponse> => {
    const response = await api.post(`/usuarios/${id}/resetar-senha`);
    return response.data;
  },

  // Desativar usuário
  desativar: async (id: number): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  }
};

export default usuarioService;
