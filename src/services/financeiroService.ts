import { api } from './api';
import type { DashboardFinanceiro, ReceitasResponse } from '../types';

export const financeiroService = {
  async getDashboard(): Promise<DashboardFinanceiro> {
    const response = await api.get('/financeiro/dashboard');
    return response.data.dados;
  },

  async getReceitas(filtros?: {
    periodo?: string;
    forma_pagamento?: string;
    busca?: string;
  }): Promise<ReceitasResponse> {
    const response = await api.get('/financeiro/receitas', { params: filtros });
    return response.data;
  }
};

export default financeiroService;
