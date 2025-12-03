import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import type { ReceitasResponse } from '../../types';
import financeiroService from '../../services/financeiroService';

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function formatarData(data: string | null): string {
  if (!data) return '-';
  const dataObj = new Date(data);
  if (isNaN(dataObj.getTime())) return '-';
  return dataObj.toLocaleDateString('pt-BR');
}

export default function FinanceiroReceitas() {
  const [dados, setDados] = useState<ReceitasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Filtros
  const [periodo, setPeriodo] = useState('mes_atual');
  const [formaPagamento, setFormaPagamento] = useState('todas');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarDados();
  }, [periodo, formaPagamento, busca]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro('');
      const filtros: any = {};

      if (periodo !== 'todos') filtros.periodo = periodo;
      if (formaPagamento !== 'todas') filtros.forma_pagamento = formaPagamento;
      if (busca.trim()) filtros.busca = busca.trim();

      const data = await financeiroService.getReceitas(filtros);
      setDados(data);
    } catch (error: any) {
      console.error('Erro ao carregar receitas:', error);
      setErro('Erro ao carregar receitas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Receitas
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                value={periodo}
                label="Período"
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <MenuItem value="mes_atual">Mês Atual</MenuItem>
                <MenuItem value="mes_anterior">Mês Anterior</MenuItem>
                <MenuItem value="ultimos_3_meses">Últimos 3 Meses</MenuItem>
                <MenuItem value="ultimos_6_meses">Últimos 6 Meses</MenuItem>
                <MenuItem value="ano_atual">Ano Atual</MenuItem>
                <MenuItem value="todos">Todos os Períodos</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Forma de Pagamento</InputLabel>
              <Select
                value={formaPagamento}
                label="Forma de Pagamento"
                onChange={(e) => setFormaPagamento(e.target.value)}
              >
                <MenuItem value="todas">Todas</MenuItem>
                <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                <MenuItem value="Débito">Débito</MenuItem>
                <MenuItem value="Crédito">Crédito</MenuItem>
                <MenuItem value="PIX">PIX</MenuItem>
                <MenuItem value="Transferência">Transferência</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Buscar Cliente/Placa/Mecânico"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite para buscar..."
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Erro */}
      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      {/* Totalizadores */}
      {dados && !loading && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Total de OS
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {dados.totalizadores.total_os}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Total de Receitas
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {formatarMoeda(dados.totalizadores.total_receita)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Total de Descontos
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="error">
                    {formatarMoeda(dados.totalizadores.total_desconto)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Ticket Médio
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {formatarMoeda(dados.totalizadores.ticket_medio)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabela de Receitas */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>OS</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Veículo</TableCell>
                    <TableCell>Mecânico</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Forma Pgto</TableCell>
                    <TableCell align="right">Desconto</TableCell>
                    <TableCell align="right">Valor Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dados.receitas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="textSecondary" p={2}>
                          Nenhuma receita encontrada com os filtros selecionados.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dados.receitas.map((receita) => (
                      <TableRow key={receita.id} hover>
                        <TableCell>#{receita.id}</TableCell>
                        <TableCell>{receita.cliente_nome}</TableCell>
                        <TableCell>
                          {receita.veiculo_placa}
                          <Typography variant="caption" display="block" color="textSecondary">
                            {receita.veiculo_modelo}
                          </Typography>
                        </TableCell>
                        <TableCell>{receita.mecanico_nome || 'Não informado'}</TableCell>
                        <TableCell>{formatarData(receita.data_conclusao)}</TableCell>
                        <TableCell>{receita.forma_pagamento}</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {receita.desconto > 0 ? formatarMoeda(receita.desconto) : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatarMoeda(receita.valor_total)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}
