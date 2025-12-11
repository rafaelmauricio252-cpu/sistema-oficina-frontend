// ============================================
// TIPOS DE ENTIDADES
// ============================================

export interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email?: string;
  endereco?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Veiculo {
  id: number;
  cliente_id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano?: number;
  cor?: string;
  chassi?: string;
  km?: number;
  criado_em: string;
  atualizado_em: string;
  cliente?: Cliente;
}

export interface Mecanico {
  id: number;
  nome: string;
  cpf: string;
  especialidade: string;
  telefone: string;
  email?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Servico {
  id: number;
  nome: string;
  descricao?: string;
  preco_padrao: number;
  tempo_estimado?: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Peca {
  id: number;
  nome: string;
  numero_peca: string;
  descricao?: string;
  categoria_id?: number;
  preco_custo: number;
  preco_venda: number;
  quantidade_estoque: number;
  estoque_minimo: number;
  localizacao?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface OrdemServico {
  id: number;
  cliente_id: number;
  veiculo_id: number;
  mecanico_id: number;
  data_abertura: string;
  data_conclusao?: string;
  data_agendamento?: string | null;
  status: 'Aguardando' | 'Em Andamento' | 'Concluído' | 'Pago';
  descricao_problema?: string;
  observacoes?: string;
  forma_pagamento?: string;
  desconto: number;
  valor_total: number;
  criado_em: string;
  atualizado_em: string;

  // Relacionamentos
  cliente?: Cliente;
  veiculo?: Veiculo;
  mecanico?: Mecanico;
  servicos?: OSServico[];
  pecas?: OSPeca[];
  fotos?: OSFoto[];
}

export interface OSServico {
  id: number;
  os_id: number;
  servico_id: number;
  preco_servico: number;
  quantidade: number;
  servico?: Servico;
}

export interface OSPeca {
  id: number;
  os_id: number;
  peca_id: number;
  quantidade: number;
  preco_unitario: number;
  peca?: Peca;
}

export interface OSFoto {
  id: number;
  os_id: number;
  caminho_arquivo: string;
  descricao?: string;
  criado_em: string;
  url: string; // URL completa retornada pelo backend
}

// ============================================
// TIPOS DE DASHBOARD
// ============================================

export interface DashboardStats {
  total_clientes: number;
  total_veiculos: number;
  os_por_status: Array<{
    status: string;
    total: string;
    valor_total: number;
  }>;
  os_mes_atual: {
    total: string;
    faturamento: number;
  };
  total_mecanicos: number;
  mecanicos_ranking: Array<{
    nome: string;
    total_os: string;
    valor_total: number;
  }>;
  pecas_estoque_baixo: number;
  os_agendadas: number;
  os_em_andamento: number;
  os_finalizadas: number;
  os_pagas: number;
  top_servicos: Array<{
    nome: string;
    total: number;
  }>;
  top_pecas: Array<{
    nome: string;
    total: number;
  }>;
}

// ============================================
// TIPOS DE REQUISIÇÃO/RESPOSTA
// ============================================

export interface ApiResponse<_T> {
  sucesso: boolean;
  mensagem?: string;
  erro?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  sucesso: boolean;
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

// ============================================
// TIPOS DE FORMULÁRIO
// ============================================

export interface ClienteFormData {
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email?: string;
  endereco?: string;
  veiculo?: {
    placa: string;
    marca: string;
    modelo: string;
    ano?: number;
    cor?: string;
  };
}

export interface VeiculoFormData {
  cliente_id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano?: number;
  cor?: string;
  chassi?: string;
  km?: number;
}

export interface MecanicoFormData {
  nome: string;
  cpf: string;
  especialidade: string;
  telefone: string;
  email?: string;
}

export interface ServicoFormData {
  nome: string;
  descricao?: string;
  preco_padrao: number;
  tempo_estimado?: number;
  ativo: boolean;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
}

export interface PecaFormData {
  nome: string;
  numero_peca: string;
  descricao?: string;
  categoria_id?: number;
  preco_custo: number;
  preco_venda: number;
  quantidade_estoque: number;
  estoque_minimo: number;
  localizacao?: string;
}

export interface OSFormData {
  cliente_id: number;
  veiculo_id: number;
  mecanico_id: number;
  data_abertura: string;
  data_conclusao?: string;
  data_agendamento?: string | null;
  status: string;
  descricao_problema?: string;
  observacoes?: string;
  forma_pagamento?: string;
  desconto?: number;
  servicos?: Array<{
    servico_id: number;
    preco_unitario: number;
    quantidade: number;
  }>;
  pecas?: Array<{
    peca_id: number;
    quantidade: number;
    preco_unitario: number;
  }>;
}

// ============================================
// TIPOS FINANCEIRO
// ============================================

export interface DashboardFinanceiro {
  receitas_mes_atual: number;
  receitas_mes_anterior: number;
  variacao_percentual: number;
  ticket_medio: number;
  total_receitas: number;
  total_os_pagas: number;
  evolucao_mensal: Array<{
    mes: string;
    valor: number;
  }>;
  receitas_por_forma_pagamento: Array<{
    forma: string;
    valor: number;
  }>;
  top_servicos: Array<{
    servico: string;
    quantidade: number;
    valor: number;
  }>;
  ultimas_receitas: Array<{
    id: number;
    valor_total: number;
    forma_pagamento: string;
    data_conclusao: string | null;
    cliente_nome: string;
    veiculo_placa: string;
  }>;
}

export interface Receita {
  id: number;
  valor_total: number;
  forma_pagamento: string;
  data_conclusao: string | null;
  desconto: number;
  cliente_nome: string;
  veiculo_placa: string;
  veiculo_modelo: string;
  mecanico_nome: string | null;
}

export interface TotalizadoresReceita {
  total_os: number;
  total_receita: number;
  total_desconto: number;
  ticket_medio: number;
}

export interface ReceitasResponse {
  sucesso: boolean;
  receitas: Receita[];
  totalizadores: TotalizadoresReceita;
}

// ============= AUTENTICAÇÃO =============
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'comum';
  ativo: boolean;
  deve_trocar_senha: boolean;
  permissoes: string[];
  criado_em?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  sucesso: boolean;
  token: string;
  usuario: Usuario;
}

export interface TrocarSenhaRequest {
  senha_atual?: string;
  senha_nova: string;
}

// ============= USUÁRIOS (CRUD Admin) =============
export interface CriarUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  tipo: 'admin' | 'comum';
  permissoes?: string[];
}

export interface AtualizarUsuarioRequest {
  nome?: string;
  email?: string;
  tipo?: 'admin' | 'comum';
  ativo?: boolean;
}

export interface ResetarSenhaResponse {
  sucesso: boolean;
  mensagem: string;
  senha_temporaria: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface Movimentacao {
  id: number;
  peca_id: number;
  os_id: number | null;
  usuario_id: number | null;
  tipo_movimentacao: 'ENTRADA' | 'SAIDA';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_nova: number;
  motivo: string;
  data_movimentacao: string;
  usuario_nome?: string;
}
