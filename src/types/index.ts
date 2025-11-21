// ============================================
     2 // TIPOS DE ENTIDADES
     3 // ============================================
     4
     5 export interface Cliente {
     6   id: number;
     7   nome: string;
     8   cpf_cnpj: string;
     9   telefone: string;
    10   email?: string;
    11   endereco?: string;
    12   criado_em: string;
    13   atualizado_em: string;
    14 }
    15
    16 export interface Veiculo {
    17   id: number;
    18   cliente_id: number;
    19   placa: string;
    20   marca: string;
    21   modelo: string;
    22   ano?: number;
    23   cor?: string;
    24   chassi?: string;
    25   km?: number;
    26   criado_em: string;
    27   atualizado_em: string;
    28   cliente?: Cliente;
    29 }
    30
    31 export interface Mecanico {
    32   id: number;
    33   nome: string;
    34   especialidade: string;
    35   telefone: string;
    36   email?: string;
    37   criado_em: string;
    38   atualizado_em: string;
    39 }
    40
    41 export interface Servico {
    42   id: number;
    43   nome: string;
    44   descricao?: string;
    45   preco_padrao: number;
    46   tempo_estimado?: number;
    47   ativo: boolean;
    48   criado_em: string;
    49   atualizado_em: string;
    50 }
    51
    52 export interface Peca {
    53   id: number;
    54   nome: string;
    55   numero_peca: string;
    56   descricao?: string;
    57   categoria_id?: number;
    58   preco_custo: number;
    59   preco_venda: number;
    60   quantidade_estoque: number;
    61   estoque_minimo: number;
    62   localizacao?: string;
    63   criado_em: string;
    64   atualizado_em: string;
    65 }
    66
    67 export interface OrdemServico {
    68   id: number;
    69   cliente_id: number;
    70   veiculo_id: number;
    71   mecanico_id: number;
    72   data_abertura: string;
    73   data_conclusao?: string;
    74   status: 'Aguardando' | 'Em Andamento' | 'Concluido' | 'Pago';
    75   descricao_problema?: string;
    76   observacoes?: string;
    77   forma_pagamento?: string;
    78   desconto: number;
    79   valor_total: number;
    80   criado_em: string;
    81   atualizado_em: string;
    82
    83   // Relacionamentos
    84   cliente?: Cliente;
    85   veiculo?: Veiculo;
    86   mecanico?: Mecanico;
    87   servicos?: OSServico[];
    88   pecas?: OSPeca[];
    89   fotos?: OSFoto[];
    90 }
    91
    92 export interface OSServico {
    93   id: number;
    94   os_id: number;
    95   servico_id: number;
    96   preco_servico: number;
    97   quantidade: number;
    98   servico?: Servico;
    99 }
   100
   101 export interface OSPeca {
   102   id: number;
   103   os_id: number;
   104   peca_id: number;
   105   quantidade: number;
   106   preco_unitario: number;
   107   peca?: Peca;
   108 }
   109
   110 export interface OSFoto {
   111   id: number;
   112   os_id: number;
   113   caminho_arquivo: string;
   114   descricao?: string;
   115   criado_em: string;
   116 }
   117
   118 // ============================================
   119 // TIPOS DE DASHBOARD
   120 // ============================================
   121
   122 export interface DashboardStats {
   123   total_clientes: number;
   124   total_veiculos: number;
   125   total_mecanicos: number;
   126   os_por_status: Array<{
   127     status: string;
   128     total: number;
   129     valor_total: number;
   130   }>;
   131   os_mes_atual: {
   132     total: number;
   133     faturamento: number;
   134   };
   135   mecanicos_ranking: Array<{
   136     nome: string;
   137     total_os: number;
   138     valor_total: number;
   139   }>;
   140   pecas_estoque_baixo: Array<{
   141     id: number;
   142     nome: string;
   143     numero_peca: string;
   144     quantidade_estoque: number;
   145     estoque_minimo: number;
   146   }>;
   147 }
   148
   149 // ============================================
   150 // TIPOS DE REQUISIÇÃO/RESPOSTA
   151 // ============================================
   152
   153 export interface ApiResponse<_T> {
   154   sucesso: boolean;
   155   mensagem?: string;
   156   erro?: string;
   157   [key: string]: any;
   158 }
   159
   160 export interface PaginatedResponse<T> {
   161   sucesso: boolean;
   162   data: T[];
   163   total: number;
   164   page: number;
   165   per_page: number;
   166 }
   167
   168 // ============================================
   169 // TIPOS DE FORMULÁRIO
   170 // ============================================
   171
   172 export interface ClienteFormData {
   173   nome: string;
   174   cpf_cnpj: string;
   175   telefone: string;
   176   email?: string;
   177   endereco?: string;
   178 }
   179
   180 export interface VeiculoFormData {
   181   cliente_id: number;
   182   placa: string;
   183   marca: string;
   184   modelo: string;
   185   ano?: number;
   186   cor?: string;
   187   chassi?: string;
   188   km?: number;
   189 }
   190
   191 export interface MecanicoFormData {
   192   nome: string;
   193   especialidade: string;
   194   telefone: string;
   195   email?: string;
   196 }
   197
   198 export interface ServicoFormData {
   199   nome: string;
   200   descricao?: string;
   201   preco_padrao: number;
   202   tempo_estimado?: number;
   203   ativo: boolean;
   204 }
   205
   206 export interface PecaFormData {
   207   nome: string;
   208   numero_peca: string;
   209   descricao?: string;
   210   categoria_id?: number;
   211   preco_custo: number;
   212   preco_venda: number;
   213   quantidade_estoque: number;
   214   estoque_minimo: number;
   215   localizacao?: string;
   216 }
   217
   218 export interface OSFormData {
   219   cliente_id: number;
   220   veiculo_id: number;
   221   mecanico_id: number;
   222   data_abertura: string;
   223   data_conclusao?: string;
   224   status: string;
   225   descricao_problema?: string;
   226   observacoes?: string;
   227   forma_pagamento?: string;
   228   desconto?: number;
   229   servicos?: Array<{
   230     servico_id: number;
   231     preco_unitario: number;
   232     quantidade: number;
   233   }>;
   234   pecas?: Array<{
   235     peca_id: number;
   236     quantidade: number;
   237     preco_unitario: number;
   238   }>;
   239 }