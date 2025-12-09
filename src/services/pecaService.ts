import { api } from './api';
import type { Peca, PecaFormData, ApiResponse } from '../types';

export const pecaService = {
  async getAll(): Promise<Peca[]> {
    const response = await api.get<{ pecas: Peca[] }>('/pecas');
    return response.data.pecas;
  },

  async getById(id: number): Promise<Peca> {
    const response = await api.get<{ peca: Peca }>(`/pecas/${id}`);
    return response.data.peca;
  },

  async create(data: PecaFormData): Promise<ApiResponse<Peca>> {
    const response = await api.post('/pecas', data);
    return response.data;
  },

  async update(id: number, data: PecaFormData): Promise<ApiResponse<Peca>> {
    const response = await api.put(`/pecas/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/pecas/${id}`);
    return response.data;
  },

  async search(query: string): Promise<Peca[]> {
    const response = await api.get<{ pecas: Peca[] }>('/pecas/buscar', {
      params: { q: query }
    });
    return response.data.pecas;
  },

  async darEntrada(dados: { peca_id: number; quantidade: number; motivo: string }) {
    const response = await api.post('/pecas/entrada', dados);
    return response.data;
  },

  async darSaida(dados: { peca_id: number; quantidade: number; motivo: string }) {
    const response = await api.post('/pecas/saida', dados);
    return response.data;
  },

  async buscarHistorico(peca_id: number) {
    const response = await api.get(`/pecas/${peca_id}/historico`);
    return response.data;
  }
};

export default pecaService;
