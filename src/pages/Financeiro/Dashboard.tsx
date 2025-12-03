import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DashboardFinanceiro } from '../../types';
import financeiroService from '../../services/financeiroService';

// Cores para os gráficos
const CORES_PIZZA = ['#1976d2', '#2e7d32', '#ff9800', '#9c27b0', '#f44336'];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.JSX.Element;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  display: 'block',
                  color: subtitle.startsWith('+') ? 'success.main' : 'error.main',
                  fontWeight: 'bold',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: color,
              color: 'white',
              p: 2,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

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

function formatarPercentual(valor: number): string {
  return `${valor > 0 ? '+' : ''}${valor.toFixed(1)}%`;
}

export default function FinanceiroDashboard() {
  const [dados, setDados] = useState<DashboardFinanceiro | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro('');
      const data = await financeiroService.getDashboard();
      setDados(data);
    } catch (error: any) {
      console.error('Erro ao carregar dashboard financeiro:', error);
      setErro('Erro ao carregar dados financeiros. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (erro) {
    return (
      <Box p={3}>
        <Alert severity="error">{erro}</Alert>
      </Box>
    );
  }

  if (!dados) {
    return null;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Financeiro
      </Typography>

      {/* Cards de Indicadores */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Receitas Mês Atual"
            value={formatarMoeda(dados.receitas_mes_atual)}
            icon={<AttachMoneyIcon />}
            color="#1976d2"
            subtitle={formatarPercentual(dados.variacao_percentual)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Crescimento Mensal"
            value={formatarPercentual(dados.variacao_percentual)}
            icon={<TrendingUpIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ticket Médio"
            value={formatarMoeda(dados.ticket_medio)}
            icon={<AssessmentIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Receitas"
            value={formatarMoeda(dados.total_receitas)}
            icon={<AccountBalanceIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Evolução Mensal */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evolução Mensal de Receitas
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dados.evolucao_mensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="#1976d2"
                  strokeWidth={2}
                  name="Receita"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Formas de Pagamento */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Receitas por Forma de Pagamento
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dados.receitas_por_forma_pagamento}
                  dataKey="valor"
                  nameKey="forma"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.forma}: ${formatarMoeda(entry.valor)}`}
                >
                  {dados.receitas_por_forma_pagamento.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top 5 Serviços */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top 5 Serviços Mais Lucrativos
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados.top_servicos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="servico" />
                <YAxis />
                <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                <Legend />
                <Bar dataKey="valor" fill="#1976d2" name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabela de Últimas Receitas */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Últimas 10 Receitas
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>OS</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Veículo</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Forma Pagamento</TableCell>
                <TableCell align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dados.ultimas_receitas.map((receita) => (
                <TableRow key={receita.id}>
                  <TableCell>#{receita.id}</TableCell>
                  <TableCell>{receita.cliente_nome}</TableCell>
                  <TableCell>{receita.veiculo_placa}</TableCell>
                  <TableCell>{formatarData(receita.data_conclusao)}</TableCell>
                  <TableCell>{receita.forma_pagamento}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatarMoeda(receita.valor_total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
