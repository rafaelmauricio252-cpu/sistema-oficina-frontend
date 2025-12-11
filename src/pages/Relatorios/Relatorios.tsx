import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import relatorioService from '../../services/relatorioService';
import { gerarPDFRelatorioOS, gerarPDFRelatorioFinanceiro, gerarPDFRelatorioEstoque } from '../../utils/pdfGenerator';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Relatorios() {
  const [tabAtiva, setTabAtiva] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Estado para Relatório de OS
  const [relatorioOS, setRelatorioOS] = useState({
    campos: {
      numero: true,
      data_abertura: true,
      data_fechamento: false,
      cliente_nome: true,
      veiculo_placa: false,
      mecanico_nome: false,
      status: true,
      valor_servicos: false,
      valor_pecas: false,
      valor_final: true
    },
    filtros: {
      data_inicio: null as Date | null,
      data_fim: null as Date | null,
      status: '',
      busca: ''
    }
  });

  // Estado para Relatório Financeiro
  const [relatorioFinanceiro, setRelatorioFinanceiro] = useState({
    campos: {
      numero: true,
      data_fechamento: true,
      cliente_nome: true,
      valor_servicos: true,
      valor_pecas: true,
      valor_final: true
    },
    filtros: {
      data_inicio: null as Date | null,
      data_fim: null as Date | null,
      busca: ''
    },
    resumo: {
      total_servicos: 0,
      total_pecas: 0,
      valor_total_geral: 0
    }
  });

  // Estado para Relatório de Estoque
  const [relatorioEstoque, setRelatorioEstoque] = useState({
    campos: {
      codigo: true,
      nome: true,
      categoria: true,
      quantidade_estoque: true,
      preco_custo: false,
      preco_venda: false,
      valor_total_custo: true,
      valor_total_venda: true,
      margem_lucro: false
    },
    filtros: {
      categoria: '',
      busca: '',
      estoque_baixo: false
    },
    resumo: {
      total_itens: 0,
      valor_total_custo: 0,
      valor_total_venda: 0
    }
  });

  const handleGerarPDF = async (tipo: 'os' | 'financeiro' | 'estoque') => {
    try {
      setLoading(true);

      if (tipo === 'os') {
        // Preparar campos selecionados
        const camposSelecionados = Object.keys(relatorioOS.campos).filter(
          (campo) => relatorioOS.campos[campo as keyof typeof relatorioOS.campos]
        );

        if (camposSelecionados.length === 0) {
          setSnackbar({
            open: true,
            message: 'Selecione pelo menos um campo para o relatório',
            severity: 'error'
          });
          return;
        }

        // Preparar filtros
        const filtros: any = {
          busca: relatorioOS.filtros.busca || undefined,
          status: relatorioOS.filtros.status || undefined
        };

        if (relatorioOS.filtros.data_inicio) {
          filtros.data_inicio = relatorioOS.filtros.data_inicio.toISOString().split('T')[0];
        }
        if (relatorioOS.filtros.data_fim) {
          filtros.data_fim = relatorioOS.filtros.data_fim.toISOString().split('T')[0];
        }

        // Chamar API
        const response = await relatorioService.gerarRelatorioOS({
          campos: camposSelecionados,
          filtros
        });

        // Gerar PDF
        gerarPDFRelatorioOS(camposSelecionados, response, relatorioOS.filtros);

        setSnackbar({
          open: true,
          message: 'Relatório de OS gerado com sucesso!',
          severity: 'success'
        });

      } else if (tipo === 'financeiro') {
        const camposSelecionados = Object.keys(relatorioFinanceiro.campos).filter(
          (campo) => relatorioFinanceiro.campos[campo as keyof typeof relatorioFinanceiro.campos]
        );

        if (camposSelecionados.length === 0) {
          setSnackbar({
            open: true,
            message: 'Selecione pelo menos um campo para o relatório',
            severity: 'error'
          });
          return;
        }

        const filtros: any = {
          busca: relatorioFinanceiro.filtros.busca || undefined
        };

        if (relatorioFinanceiro.filtros.data_inicio) {
          filtros.data_inicio = relatorioFinanceiro.filtros.data_inicio.toISOString().split('T')[0];
        }
        if (relatorioFinanceiro.filtros.data_fim) {
          filtros.data_fim = relatorioFinanceiro.filtros.data_fim.toISOString().split('T')[0];
        }

        const response = await relatorioService.gerarRelatorioFinanceiro({
          campos: camposSelecionados,
          filtros
        });

        // Atualizar resumo
        setRelatorioFinanceiro({
          ...relatorioFinanceiro,
          resumo: {
            total_servicos: response.totalizadores.total_valor_servicos,
            total_pecas: response.totalizadores.total_valor_pecas,
            valor_total_geral: response.totalizadores.total_valor_final
          }
        });

        gerarPDFRelatorioFinanceiro(camposSelecionados, response, relatorioFinanceiro.filtros);

        setSnackbar({
          open: true,
          message: 'Relatório Financeiro gerado com sucesso!',
          severity: 'success'
        });

      } else if (tipo === 'estoque') {
        const camposSelecionados = Object.keys(relatorioEstoque.campos).filter(
          (campo) => relatorioEstoque.campos[campo as keyof typeof relatorioEstoque.campos]
        );

        if (camposSelecionados.length === 0) {
          setSnackbar({
            open: true,
            message: 'Selecione pelo menos um campo para o relatório',
            severity: 'error'
          });
          return;
        }

        const filtros: any = {
          categoria: relatorioEstoque.filtros.categoria || undefined,
          busca: relatorioEstoque.filtros.busca || undefined,
          estoque_baixo: relatorioEstoque.filtros.estoque_baixo
        };

        const response = await relatorioService.gerarRelatorioEstoque({
          campos: camposSelecionados,
          filtros
        });

        // Atualizar resumo
        setRelatorioEstoque({
          ...relatorioEstoque,
          resumo: {
            total_itens: response.totalizadores.total_itens,
            valor_total_custo: response.totalizadores.valor_total_custo,
            valor_total_venda: response.totalizadores.valor_total_venda
          }
        });

        gerarPDFRelatorioEstoque(camposSelecionados, response, relatorioEstoque.filtros);

        setSnackbar({
          open: true,
          message: 'Relatório de Estoque gerado com sucesso!',
          severity: 'success'
        });
      }

    } catch (erro: any) {
      console.error('Erro ao gerar relatório:', erro);
      setSnackbar({
        open: true,
        message: erro.response?.data?.erro || 'Erro ao gerar relatório',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCampoOSChange = (campo: string, checked: boolean) => {
    setRelatorioOS({
      ...relatorioOS,
      campos: {
        ...relatorioOS.campos,
        [campo]: checked
      }
    });
  };

  const handleCampoFinanceiroChange = (campo: string, checked: boolean) => {
    setRelatorioFinanceiro({
      ...relatorioFinanceiro,
      campos: {
        ...relatorioFinanceiro.campos,
        [campo]: checked
      }
    });
  };

  const handleCampoEstoqueChange = (campo: string, checked: boolean) => {
    setRelatorioEstoque({
      ...relatorioEstoque,
      campos: {
        ...relatorioEstoque.campos,
        [campo]: checked
      }
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Relatórios
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Tabs value={tabAtiva} onChange={(e, v) => setTabAtiva(v)}>
            <Tab label="Ordens de Serviço" />
            <Tab label="Financeiro" />
            <Tab label="Estoque" />
          </Tabs>

          {/* ABA 1: Relatório de OS */}
          <TabPanel value={tabAtiva} index={0}>
            {/* Campos do Relatório */}
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Campos do Relatório
              </Typography>
              <FormGroup>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioOS.campos.numero}
                          onChange={(e) => handleCampoOSChange('numero', e.target.checked)}
                        />
                      }
                      label="Número"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioOS.campos.data_abertura}
                          onChange={(e) => handleCampoOSChange('data_abertura', e.target.checked)}
                        />
                      }
                      label="Data Abertura"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioOS.campos.data_fechamento}
                          onChange={(e) => handleCampoOSChange('data_fechamento', e.target.checked)}
                        />
                      }
                      label="Data Fechamento"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioOS.campos.cliente_nome}
                          onChange={(e) => handleCampoOSChange('cliente_nome', e.target.checked)}
                        />
                      }
                      label="Cliente"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioOS.campos.veiculo_placa}
                          onChange={(e) => handleCampoOSChange('veiculo_placa', e.target.checked)}
                        />
                      }
                      label="Placa do Veículo"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioOS.campos.mecanico_nome}
                          onChange={(e) => handleCampoOSChange('mecanico_nome', e.target.checked)}
                        />
                      }
                      label="Mecânico"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioOS.campos.status}
                          onChange={(e) => handleCampoOSChange('status', e.target.checked)}
                        />
                      }
                      label="Status"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioOS.campos.valor_servicos}
                          onChange={(e) => handleCampoOSChange('valor_servicos', e.target.checked)}
                        />
                      }
                      label="Valor Serviços"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioOS.campos.valor_pecas}
                          onChange={(e) => handleCampoOSChange('valor_pecas', e.target.checked)}
                        />
                      }
                      label="Valor Peças"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioOS.campos.valor_final}
                          onChange={(e) => handleCampoOSChange('valor_final', e.target.checked)}
                        />
                      }
                      label="Valor Final"
                    />
                  </Box>
                </Box>
              </FormGroup>
            </Paper>

            {/* Filtros */}
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Filtros
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                <Box>
                  <DatePicker
                    label="Data Início"
                    value={relatorioOS.filtros.data_inicio}
                    onChange={(newValue) =>
                      setRelatorioOS({
                        ...relatorioOS,
                        filtros: { ...relatorioOS.filtros, data_inicio: newValue }
                      })
                    }
                    format="dd/MM/yyyy"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>
                <Box>
                  <DatePicker
                    label="Data Fim"
                    value={relatorioOS.filtros.data_fim}
                    onChange={(newValue) =>
                      setRelatorioOS({
                        ...relatorioOS,
                        filtros: { ...relatorioOS.filtros, data_fim: newValue }
                      })
                    }
                    format="dd/MM/yyyy"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={relatorioOS.filtros.status}
                      label="Status"
                      onChange={(e) =>
                        setRelatorioOS({
                          ...relatorioOS,
                          filtros: { ...relatorioOS.filtros, status: e.target.value }
                        })
                      }
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Agendamento">Agendamento</MenuItem>
                      <MenuItem value="Em andamento">Em andamento</MenuItem>
                      <MenuItem value="Finalizada">Finalizada</MenuItem>
                      <MenuItem value="Pago">Pago</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Busca"
                    placeholder="Cliente, placa, número..."
                    value={relatorioOS.filtros.busca}
                    onChange={(e) =>
                      setRelatorioOS({
                        ...relatorioOS,
                        filtros: { ...relatorioOS.filtros, busca: e.target.value }
                      })
                    }
                  />
                </Box>
              </Box>
            </Paper>

            {/* Botão Gerar PDF */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : undefined}
                onClick={() => handleGerarPDF('os')}
              >
                Gerar PDF
              </Button>
            </Box>
          </TabPanel>

          {/* ABA 2: Relatório Financeiro */}
          <TabPanel value={tabAtiva} index={1}>
            {/* Campos do Relatório */}
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Campos do Relatório
              </Typography>
              <FormGroup>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioFinanceiro.campos.numero}
                          onChange={(e) => handleCampoFinanceiroChange('numero', e.target.checked)}
                        />
                      }
                      label="Número"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioFinanceiro.campos.data_fechamento}
                          onChange={(e) => handleCampoFinanceiroChange('data_fechamento', e.target.checked)}
                        />
                      }
                      label="Data Fechamento"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioFinanceiro.campos.cliente_nome}
                          onChange={(e) => handleCampoFinanceiroChange('cliente_nome', e.target.checked)}
                        />
                      }
                      label="Cliente"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioFinanceiro.campos.valor_servicos}
                          onChange={(e) => handleCampoFinanceiroChange('valor_servicos', e.target.checked)}
                        />
                      }
                      label="Valor Serviços"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioFinanceiro.campos.valor_pecas}
                          onChange={(e) => handleCampoFinanceiroChange('valor_pecas', e.target.checked)}
                        />
                      }
                      label="Valor Peças"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioFinanceiro.campos.valor_final}
                          onChange={(e) => handleCampoFinanceiroChange('valor_final', e.target.checked)}
                        />
                      }
                      label="Valor Final"
                    />
                  </Box>
                </Box>
              </FormGroup>
            </Paper>

            {/* Filtros */}
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Filtros
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Box>
                  <DatePicker
                    label="Data Início"
                    value={relatorioFinanceiro.filtros.data_inicio}
                    onChange={(newValue) =>
                      setRelatorioFinanceiro({
                        ...relatorioFinanceiro,
                        filtros: { ...relatorioFinanceiro.filtros, data_inicio: newValue }
                      })
                    }
                    format="dd/MM/yyyy"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>
                <Box>
                  <DatePicker
                    label="Data Fim"
                    value={relatorioFinanceiro.filtros.data_fim}
                    onChange={(newValue) =>
                      setRelatorioFinanceiro({
                        ...relatorioFinanceiro,
                        filtros: { ...relatorioFinanceiro.filtros, data_fim: newValue }
                      })
                    }
                    format="dd/MM/yyyy"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Busca"
                    placeholder="Cliente, número..."
                    value={relatorioFinanceiro.filtros.busca}
                    onChange={(e) =>
                      setRelatorioFinanceiro({
                        ...relatorioFinanceiro,
                        filtros: { ...relatorioFinanceiro.filtros, busca: e.target.value }
                      })
                    }
                  />
                </Box>
              </Box>
            </Paper>

            {/* Resumo */}
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Resumo
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total em Serviços
                  </Typography>
                  <Typography variant="h6">
                    R$ {relatorioFinanceiro.resumo.total_servicos.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total em Peças
                  </Typography>
                  <Typography variant="h6">
                    R$ {relatorioFinanceiro.resumo.total_pecas.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total Geral
                  </Typography>
                  <Typography variant="h6" color="primary">
                    R$ {relatorioFinanceiro.resumo.valor_total_geral.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Botão Gerar PDF */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : undefined}
                onClick={() => handleGerarPDF('financeiro')}
              >
                Gerar PDF
              </Button>
            </Box>
          </TabPanel>

          {/* ABA 3: Relatório de Estoque */}
          <TabPanel value={tabAtiva} index={2}>
            {/* Campos do Relatório */}
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Campos do Relatório
              </Typography>
              <FormGroup>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioEstoque.campos.codigo}
                          onChange={(e) => handleCampoEstoqueChange('codigo', e.target.checked)}
                        />
                      }
                      label="Código"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioEstoque.campos.nome}
                          onChange={(e) => handleCampoEstoqueChange('nome', e.target.checked)}
                        />
                      }
                      label="Nome"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioEstoque.campos.categoria}
                          onChange={(e) => handleCampoEstoqueChange('categoria', e.target.checked)}
                        />
                      }
                      label="Categoria"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioEstoque.campos.quantidade_estoque}
                          onChange={(e) => handleCampoEstoqueChange('quantidade_estoque', e.target.checked)}
                        />
                      }
                      label="Quantidade em Estoque"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioEstoque.campos.preco_custo}
                          onChange={(e) => handleCampoEstoqueChange('preco_custo', e.target.checked)}
                        />
                      }
                      label="Preço de Custo"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioEstoque.campos.preco_venda}
                          onChange={(e) => handleCampoEstoqueChange('preco_venda', e.target.checked)}
                        />
                      }
                      label="Preço de Venda"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioEstoque.campos.valor_total_custo}
                          onChange={(e) => handleCampoEstoqueChange('valor_total_custo', e.target.checked)}
                        />
                      }
                      label="Valor Total (Custo)"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioEstoque.campos.valor_total_venda}
                          onChange={(e) => handleCampoEstoqueChange('valor_total_venda', e.target.checked)}
                        />
                      }
                      label="Valor Total (Venda)"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={relatorioEstoque.campos.margem_lucro}
                          onChange={(e) => handleCampoEstoqueChange('margem_lucro', e.target.checked)}
                        />
                      }
                      label="Margem de Lucro"
                    />
                  </Box>
                </Box>
              </FormGroup>
            </Paper>

            {/* Filtros */}
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Filtros
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      value={relatorioEstoque.filtros.categoria}
                      label="Categoria"
                      onChange={(e) =>
                        setRelatorioEstoque({
                          ...relatorioEstoque,
                          filtros: { ...relatorioEstoque.filtros, categoria: e.target.value }
                        })
                      }
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {/* Categorias serão carregadas via API futuramente */}
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Busca"
                    placeholder="Código, nome..."
                    value={relatorioEstoque.filtros.busca}
                    onChange={(e) =>
                      setRelatorioEstoque({
                        ...relatorioEstoque,
                        filtros: { ...relatorioEstoque.filtros, busca: e.target.value }
                      })
                    }
                  />
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={relatorioEstoque.filtros.estoque_baixo}
                        onChange={(e) =>
                          setRelatorioEstoque({
                            ...relatorioEstoque,
                            filtros: { ...relatorioEstoque.filtros, estoque_baixo: e.target.checked }
                          })
                        }
                      />
                    }
                    label="Mostrar apenas com estoque baixo"
                  />
                </Box>
              </Box>
            </Paper>

            {/* Resumo */}
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Resumo
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total de Itens
                  </Typography>
                  <Typography variant="h6">
                    {relatorioEstoque.resumo.total_itens}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total em Estoque (Custo)
                  </Typography>
                  <Typography variant="h6">
                    R$ {relatorioEstoque.resumo.valor_total_custo.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total Potencial (Venda)
                  </Typography>
                  <Typography variant="h6" color="primary">
                    R$ {relatorioEstoque.resumo.valor_total_venda.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Botão Gerar PDF */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : undefined}
                onClick={() => handleGerarPDF('estoque')}
              >
                Gerar PDF
              </Button>
            </Box>
          </TabPanel>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}
