import api from './api';

// ============================================
// INTERFACES
// ============================================

export interface FiltrosOS {
  data_inicio?: string | null;
  data_fim?: string | null;
  status?: string;
  busca?: string;
}

export interface FiltrosFinanceiro {
  data_inicio?: string | null;
  data_fim?: string | null;
  busca?: string;
}

export interface FiltrosEstoque {
  categoria?: string;
  busca?: string;
  estoque_baixo?: boolean;
}

export interface RelatorioOSRequest {
  campos: string[];
  filtros: FiltrosOS;
}

export interface RelatorioFinanceiroRequest {
  campos: string[];
  filtros: FiltrosFinanceiro;
}

export interface RelatorioEstoqueRequest {
  campos: string[];
  filtros: FiltrosEstoque;
}

export interface TotalizadoresOS {
  total_registros: number;
  total_valor_servicos: number;
  total_valor_pecas: number;
  total_valor_final: number;
}

export interface TotalizadoresFinanceiro {
  total_registros: number;
  total_valor_servicos: number;
  total_valor_pecas: number;
  total_valor_final: number;
}

export interface TotalizadoresEstoque {
  total_itens: number;
  valor_total_custo: number;
  valor_total_venda: number;
}

export interface RelatorioOSResponse {
  sucesso: boolean;
  dados: any[];
  totalizadores: TotalizadoresOS;
}

export interface RelatorioFinanceiroResponse {
  sucesso: boolean;
  dados: any[];
  totalizadores: TotalizadoresFinanceiro;
}

export interface RelatorioEstoqueResponse {
  sucesso: boolean;
  dados: any[];
  totalizadores: TotalizadoresEstoque;
}

// ============================================
// SERVICE
// ============================================

const relatorioService = {
  /**
   * Gera relatório de Ordens de Serviço
   */
  gerarRelatorioOS: async (request: RelatorioOSRequest): Promise<RelatorioOSResponse> => {
    const response = await api.post<RelatorioOSResponse>('/relatorios/os', request);
    return response.data;
  },

  /**
   * Gera relatório Financeiro (apenas OS pagas)
   */
  gerarRelatorioFinanceiro: async (request: RelatorioFinanceiroRequest): Promise<RelatorioFinanceiroResponse> => {
    const response = await api.post<RelatorioFinanceiroResponse>('/relatorios/financeiro', request);
    return response.data;
  },

  /**
   * Gera relatório de Estoque
   */
  gerarRelatorioEstoque: async (request: RelatorioEstoqueRequest): Promise<RelatorioEstoqueResponse> => {
    const response = await api.post<RelatorioEstoqueResponse>('/relatorios/estoque', request);
    return response.data;
  },
};

export default relatorioService;
