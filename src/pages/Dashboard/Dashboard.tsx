import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
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
  Skeleton,
} from '@mui/material';
import {
  People as PeopleIcon,
  DirectionsCar as DirectionsCarIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Paid as PaidIcon,
} from '@mui/icons-material';
import type { DashboardStats } from '../../types';
import dashboardService from '../../services/dashboardService';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.JSX.Element;
  color: string;
  onClick?: () => void;
  clickable?: boolean;
}

function StatCard({ title, value, icon, color, onClick, clickable }: StatCardProps) {
  return (
    <Card
      elevation={3}
      onClick={onClick}
      sx={{
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': clickable ? {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        } : {},
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">
              {value}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {title}
            </Typography>
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao carregar dashboard');
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Dashboard
        </Typography>

        {/* Skeleton para OS por Status */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </Box>
                  <Skeleton variant="circular" width={56} height={56} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Skeleton para Cards de Estatísticas */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </Box>
                  <Skeleton variant="circular" width={56} height={56} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Skeleton para Tabelas */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          {[1, 2].map((index) => (
            <Paper key={index} elevation={3} sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
              {[1, 2, 3, 4, 5].map((row) => (
                <Box key={row} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="20%" height={24} />
                </Box>
              ))}
            </Paper>
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        Nenhum dado disponível
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* Cards de OS por Status - NO TOPO */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="OS Agendadas"
          value={stats.os_agendadas}
          icon={<ScheduleIcon sx={{ fontSize: 32 }} />}
          color="#ff9800"
          onClick={() => navigate('/ordem-servico?status=Agendamento')}
          clickable={true}
        />
        <StatCard
          title="OS Em Andamento"
          value={stats.os_em_andamento}
          icon={<BuildIcon sx={{ fontSize: 32 }} />}
          color="#2196f3"
          onClick={() => navigate('/ordem-servico?status=Em Andamento')}
          clickable={true}
        />
        <StatCard
          title="OS Finalizadas"
          value={stats.os_finalizadas}
          icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
          color="#4caf50"
          onClick={() => navigate('/ordem-servico?status=Finalizada')}
          clickable={true}
        />
        <StatCard
          title="OS Pagas"
          value={stats.os_pagas}
          icon={<PaidIcon sx={{ fontSize: 32 }} />}
          color="#9c27b0"
          onClick={() => navigate('/ordem-servico?status=Pago')}
          clickable={true}
        />
      </Box>

      {/* Cards de estatísticas principais */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Total de Clientes"
          value={stats.total_clientes}
          icon={<PeopleIcon sx={{ fontSize: 40 }} />}
          color="#1976d2"
          onClick={() => navigate('/clientes')}
          clickable={true}
        />
        <StatCard
          title="Total de Veículos"
          value={stats.total_veiculos}
          icon={<DirectionsCarIcon sx={{ fontSize: 40 }} />}
          color="#2e7d32"
          onClick={() => navigate('/veiculos')}
          clickable={true}
        />
        <StatCard
          title="Total de Mecânicos"
          value={stats.total_mecanicos}
          icon={<BuildIcon sx={{ fontSize: 40 }} />}
          color="#ed6c02"
          onClick={() => navigate('/mecanicos')}
          clickable={true}
        />
        <StatCard
          title="OS do Mês"
          value={stats.os_mes_atual.total}
          icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
          color="#9c27b0"
          onClick={() => navigate('/ordem-servico?mes=atual')}
          clickable={true}
        />
      </Box>

      {/* Top 5 Serviços e Peças */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Top 5 Serviços Mais Pedidos
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Serviço</TableCell>
                  <TableCell align="right">Qtd. Pedidos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.top_servicos?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell align="right">{item.total}</TableCell>
                  </TableRow>
                ))}
                {(!stats.top_servicos || stats.top_servicos.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">Nenhum dado disponível</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Top 5 Peças Mais Utilizadas
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Peça</TableCell>
                  <TableCell align="right">Qtd. Utilizada</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.top_pecas?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell align="right">{item.total}</TableCell>
                  </TableRow>
                ))}
                {(!stats.top_pecas || stats.top_pecas.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">Nenhum dado disponível</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Ranking de mecânicos */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >


        {/* Peças com estoque baixo */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Peças com Estoque Baixo
          </Typography>
          {Array.isArray(stats.pecas_estoque_baixo) && stats.pecas_estoque_baixo.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Peça</TableCell>
                    <TableCell align="right">Estoque</TableCell>
                    <TableCell align="right">Mínimo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.pecas_estoque_baixo.map((peca: any) => (
                    <TableRow key={peca.numero_peca}>
                      <TableCell>
                        <Typography variant="body2">{peca.nome}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {peca.numero_peca}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="error">{peca.quantidade_estoque}</Typography>
                      </TableCell>
                      <TableCell align="right">{peca.estoque_minimo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="textSecondary">Nenhuma peça com estoque baixo</Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

