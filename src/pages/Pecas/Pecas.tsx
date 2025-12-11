import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Snackbar,
  InputAdornment,
  Autocomplete,
  Tooltip,
  TablePagination,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Check as CheckIcon,
  History as HistoryIcon,
  InventoryOutlined as InventoryOutlinedIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import type { Peca, PecaFormData, Movimentacao, Categoria } from '../../types';
import pecaService from '../../services/pecaService';

export default function Pecas() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPeca, setEditingPeca] = useState<Peca | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogEntradaAberto, setDialogEntradaAberto] = useState(false);
  const [pecaSelecionadaEntrada, setPecaSelecionadaEntrada] = useState<Peca | null>(null);
  const [quantidadeEntrada, setQuantidadeEntrada] = useState('');
  const [motivoEntrada, setMotivoEntrada] = useState('');
  const [precoCustoEntrada, setPrecoCustoEntrada] = useState('');
  const [precoVendaEntrada, setPrecoVendaEntrada] = useState('');
  const [loadingEntrada, setLoadingEntrada] = useState(false);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [dialogSaidaAberto, setDialogSaidaAberto] = useState(false);
  const [pecaSelecionadaSaida, setPecaSelecionadaSaida] = useState<Peca | null>(null);
  const [quantidadeSaida, setQuantidadeSaida] = useState('');
  const [motivoSaida, setMotivoSaida] = useState('');
  const [loadingSaida, setLoadingSaida] = useState(false);
  const [dialogHistoricoAberto, setDialogHistoricoAberto] = useState(false);
  const [pecaHistorico, setPecaHistorico] = useState<Peca | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [dialogCategoriaOpen, setDialogCategoriaOpen] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState({ nome: '', descricao: '' });
  const [loadingCategoria, setLoadingCategoria] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState<PecaFormData>({
    nome: '',
    numero_peca: '',
    descricao: '',
    categoria_id: undefined,
    preco_custo: 0,
    preco_venda: 0,
    quantidade_estoque: 0,
    estoque_minimo: 0,
    localizacao: '',
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    loadPecas();
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const data = await pecaService.getCategorias();
      setCategorias(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const loadPecas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pecaService.getAll();
      setPecas(data);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao carregar peças');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPecas();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await pecaService.search(searchQuery);
      setPecas(data);
      setPage(0);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao buscar peças');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
    loadPecas();
  };

  const handleOpenDialog = (peca?: Peca) => {
    if (peca) {
      setEditingPeca(peca);
      setFormData({
        nome: peca.nome,
        numero_peca: peca.numero_peca,
        descricao: peca.descricao || '',
        categoria_id: peca.categoria_id || undefined,
        preco_custo: peca.preco_custo,
        preco_venda: peca.preco_venda,
        quantidade_estoque: peca.quantidade_estoque,
        estoque_minimo: peca.estoque_minimo,
        localizacao: peca.localizacao || '',
      });
    } else {
      setEditingPeca(null);
      setFormData({
        nome: '',
        numero_peca: '',
        descricao: '',
        categoria_id: undefined,
        preco_custo: 0,
        preco_venda: 0,
        quantidade_estoque: 0,
        estoque_minimo: 0,
        localizacao: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      let pecaId: number;

      if (editingPeca) {
        await pecaService.update(editingPeca.id, formData);
        pecaId = editingPeca.id;
        setSuccess('Peça atualizada com sucesso!');
      } else {
        const response = await pecaService.create(formData);
        pecaId = response.id || response.peca?.id;
        setSuccess('Peça criada com sucesso!');
      }

      // Fechar dialog imediatamente
      setDialogOpen(false);

      // Recarregar lista
      await loadPecas();

      // Aplicar highlight
      setHighlightedId(pecaId);
      setTimeout(() => {
        setHighlightedId(null);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao salvar peça');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta peça?')) return;
    try {
      await pecaService.delete(id);
      setSuccess('Peça excluída com sucesso!');
      loadPecas();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao excluir peça');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const isEstoqueBaixo = (peca: Peca) => peca.quantidade_estoque <= peca.estoque_minimo;

  const handleAbrirHistorico = async (peca: Peca) => {
    setPecaHistorico(peca);
    setDialogHistoricoAberto(true);
    setLoadingHistorico(true);

    try {
      const dados = await pecaService.buscarHistorico(peca.id);
      setMovimentacoes(dados.movimentacoes);
    } catch (erro) {
      setError('Erro ao carregar histórico');
      setMovimentacoes([]);
    } finally {
      setLoadingHistorico(false);
    }
  };

  const fecharHistorico = () => {
    setDialogHistoricoAberto(false);
    setPecaHistorico(null);
    setMovimentacoes([]);
  };

  const handleCriarCategoria = async () => {
    if (!novaCategoria.nome.trim()) {
      setError('Nome da categoria é obrigatório');
      return;
    }

    try {
      setLoadingCategoria(true);
      const categoriaCriada = await pecaService.criarCategoria(novaCategoria);

      // Atualizar lista de categorias
      await loadCategorias();

      // Selecionar a categoria recém-criada
      setFormData({ ...formData, categoria_id: categoriaCriada.id });

      // Fechar dialog e limpar form
      setDialogCategoriaOpen(false);
      setNovaCategoria({ nome: '', descricao: '' });
      setSuccess('Categoria criada com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao criar categoria');
    } finally {
      setLoadingCategoria(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Peças e Estoque</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por Nome ou Código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
            sx={{ width: '350px' }}
          />
          {searchQuery && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearSearch}
            >
              Limpar
            </Button>
          )}
          <Button
            variant="contained"
            color="success"
            startIcon={<TrendingUpIcon />}
            onClick={() => setDialogEntradaAberto(true)}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': { backgroundColor: '#45a049' }
            }}
          >
            Dar Entrada
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<TrendingDownIcon />}
            onClick={() => setDialogSaidaAberto(true)}
            sx={{
              backgroundColor: '#f44336',
              '&:hover': { backgroundColor: '#d32f2f' }
            }}
          >
            Dar Saída
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Nova Peça
          </Button>
        </Box>
      </Box>


      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ p: 3 }}>
            {[1, 2, 3, 4, 5].map((index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Skeleton variant="text" width="12%" height={40} />
                <Skeleton variant="text" width="20%" height={40} />
                <Skeleton variant="text" width="12%" height={40} />
                <Skeleton variant="text" width="12%" height={40} />
                <Skeleton variant="rectangular" width={80} height={30} />
                <Skeleton variant="text" width="10%" height={40} />
                <Skeleton variant="text" width="12%" height={40} />
                <Skeleton variant="rectangular" width={120} height={40} />
              </Box>
            ))}
          </Box>
        ) : pecas.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <InventoryOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'Nenhuma peça encontrada' : 'Nenhuma peça cadastrada ainda'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery
                ? 'Tente ajustar os termos de busca ou limpar os filtros'
                : 'Comece adicionando peças ao estoque para gerenciar suas ordens de serviço'}
            </Typography>
            {searchQuery ? (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearSearch}
              >
                Limpar Busca
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Nova Peça
              </Button>
            )}
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nº Peça</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Preço Custo</TableCell>
                <TableCell>Preço Venda</TableCell>
                <TableCell>Estoque</TableCell>
                <TableCell>Estoque Mín.</TableCell>
                <TableCell>Localização</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pecas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((peca) => (
                  <TableRow
                    key={peca.id}
                    sx={{
                      backgroundColor: highlightId === peca.id ? '#fff9c4' :
                                       (highlightedId === peca.id ? '#ffebee' : (isEstoqueBaixo(peca) ? '#fff3e0' : 'inherit')),
                      border: highlightedId === peca.id ? '2px solid #f44336' : 'none',
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    <TableCell>{peca.numero_peca}</TableCell>
                    <TableCell>
                      {peca.nome}
                      {isEstoqueBaixo(peca) && (
                        <Chip icon={<WarningIcon />} label="Estoque Baixo" color="warning" size="small" sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(peca.preco_custo)}</TableCell>
                    <TableCell>{formatCurrency(peca.preco_venda)}</TableCell>
                    <TableCell>
                      <Typography color={isEstoqueBaixo(peca) ? 'error' : 'inherit'} fontWeight={isEstoqueBaixo(peca) ? 'bold' : 'normal'}>
                        {peca.quantidade_estoque}
                      </Typography>
                    </TableCell>
                    <TableCell>{peca.estoque_minimo}</TableCell>
                    <TableCell>{peca.localizacao || '-'}</TableCell>
                    <TableCell>
                      <Tooltip title="Ver histórico de movimentações">
                        <IconButton
                          onClick={() => handleAbrirHistorico(peca)}
                          size="small"
                          color="info"
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" onClick={() => handleOpenDialog(peca)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(peca.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
        <TablePagination
          component="div"
          count={pecas.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingPeca ? 'Editar Peça' : 'Nova Peça'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <TextField
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Número da Peça"
              value={formData.numero_peca}
              onChange={(e) => setFormData({ ...formData, numero_peca: e.target.value })}
              required
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Autocomplete
                options={categorias}
                getOptionLabel={(option) => option.nome}
                value={categorias.find(c => c.id === formData.categoria_id) || null}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, categoria_id: newValue?.id || undefined });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Categoria"
                    placeholder="Selecione uma categoria"
                  />
                )}
                sx={{ flex: 1 }}
              />
              <Tooltip title="Nova Categoria">
                <IconButton
                  color="primary"
                  onClick={() => setDialogCategoriaOpen(true)}
                  sx={{ mt: 1 }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                multiline
                rows={2}
                fullWidth
              />
            </Box>
            <TextField
              label="Preço de Custo"
              type="number"
              value={formData.preco_custo}
              onChange={(e) => setFormData({ ...formData, preco_custo: Number(e.target.value) })}
              required
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              sx={{
                '& input[type=number]': { '-moz-appearance': 'textfield' },
                '& input[type=number]::-webkit-outer-spin-button': { '-webkit-appearance': 'none', margin: 0 },
                '& input[type=number]::-webkit-inner-spin-button': { '-webkit-appearance': 'none', margin: 0 }
              }}
            />
            <TextField
              label="Preço de Venda"
              type="number"
              value={formData.preco_venda}
              onChange={(e) => setFormData({ ...formData, preco_venda: Number(e.target.value) })}
              required
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              sx={{
                '& input[type=number]': { '-moz-appearance': 'textfield' },
                '& input[type=number]::-webkit-outer-spin-button': { '-webkit-appearance': 'none', margin: 0 },
                '& input[type=number]::-webkit-inner-spin-button': { '-webkit-appearance': 'none', margin: 0 }
              }}
            />
            <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
              <TextField
                label="Quantidade em Estoque"
                type="number"
                value={formData.quantidade_estoque}
                onChange={(e) => setFormData({ ...formData, quantidade_estoque: Number(e.target.value) })}
                required={!editingPeca}
                disabled={!!editingPeca}
                fullWidth
                helperText={editingPeca ? 'Use os botões "Dar Entrada" ou "Dar Saída" para movimentar o estoque' : 'Estoque inicial da peça'}
                sx={{
                  '& input[type=number]': { '-moz-appearance': 'textfield' },
                  '& input[type=number]::-webkit-outer-spin-button': { '-webkit-appearance': 'none', margin: 0 },
                  '& input[type=number]::-webkit-inner-spin-button': { '-webkit-appearance': 'none', margin: 0 }
                }}
              />
              <TextField
                label="Estoque Mínimo"
                type="number"
                value={formData.estoque_minimo}
                onChange={(e) => setFormData({ ...formData, estoque_minimo: Number(e.target.value) })}
                required
                fullWidth
                sx={{
                  '& input[type=number]': { '-moz-appearance': 'textfield' },
                  '& input[type=number]::-webkit-outer-spin-button': { '-webkit-appearance': 'none', margin: 0 },
                  '& input[type=number]::-webkit-inner-spin-button': { '-webkit-appearance': 'none', margin: 0 }
                }}
              />
              <TextField
                label="Localização"
                value={formData.localizacao}
                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Histórico de Movimentações */}
      <Dialog
        open={dialogHistoricoAberto}
        onClose={fecharHistorico}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6">
              Histórico de Movimentações - {pecaHistorico?.nome}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Nº Peça: {pecaHistorico?.numero_peca} |
              Estoque Atual: <strong>{pecaHistorico?.quantidade_estoque}</strong> unidades
              {pecaHistorico && pecaHistorico.quantidade_estoque <= pecaHistorico.estoque_minimo &&
                <Chip label="BAIXO" color="warning" size="small" sx={{ ml: 1 }} />
              }
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {loadingHistorico ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : movimentacoes.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography color="text.secondary">
                Nenhuma movimentação registrada para esta peça
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data/Hora</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Quantidade</TableCell>
                    <TableCell align="right">Saldo Anterior</TableCell>
                    <TableCell align="right">Saldo Novo</TableCell>
                    <TableCell>Motivo</TableCell>
                    <TableCell>Usuário</TableCell>
                    <TableCell align="center">OS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movimentacoes.map((mov) => (
                    <TableRow
                      key={mov.id}
                      hover
                      sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                    >
                      <TableCell>
                        {format(new Date(mov.data_movimentacao), 'dd/MM/yyyy HH:mm')}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={mov.tipo_movimentacao}
                          size="small"
                          color={mov.tipo_movimentacao === 'ENTRADA' ? 'success' : 'error'}
                        />
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 'bold',
                          color: mov.quantidade > 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {mov.quantidade > 0 ? '+' : ''}{mov.quantidade}
                      </TableCell>

                      <TableCell align="right">
                        {mov.quantidade_anterior}
                      </TableCell>

                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {mov.quantidade_nova}
                      </TableCell>

                      <TableCell>
                        <Tooltip title={mov.motivo}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                            {mov.motivo}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {mov.usuario_nome || <em>Sistema</em>}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        {mov.os_id ? (
                          <Link
                            to={`/ordem-servico?id=${mov.os_id}`}
                            target="_blank"
                            style={{ textDecoration: 'none' }}
                          >
                            <Chip
                              label={`OS #${mov.os_id}`}
                              size="small"
                              clickable
                              color="primary"
                              variant="outlined"
                            />
                          </Link>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={fecharHistorico}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Entrada de Estoque */}
      <Dialog
        open={dialogEntradaAberto}
        onClose={() => {
          if (!loadingEntrada) {
            setDialogEntradaAberto(false);
            setPecaSelecionadaEntrada(null);
            setQuantidadeEntrada('');
            setMotivoEntrada('');
            setPrecoCustoEntrada('');
            setPrecoVendaEntrada('');
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#4caf50', color: 'white' }}>
          Entrada de Estoque
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Autocomplete
              options={pecas}
              getOptionLabel={(option) => `${option.numero_peca} - ${option.nome}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Peça *"
                  required
                  placeholder="Digite para buscar..."
                />
              )}
              value={pecaSelecionadaEntrada}
              onChange={(_e, newValue) => {
                setPecaSelecionadaEntrada(newValue);
                if (newValue) {
                  setPrecoCustoEntrada(newValue.preco_custo.toString());
                  setPrecoVendaEntrada(newValue.preco_venda.toString());
                } else {
                  setPrecoCustoEntrada('');
                  setPrecoVendaEntrada('');
                }
              }}
              noOptionsText="Nenhuma peça encontrada"
            />

            <TextField
              label="Quantidade *"
              type="number"
              value={quantidadeEntrada}
              onChange={(e) => setQuantidadeEntrada(e.target.value)}
              required
              inputProps={{ min: 1 }}
              helperText="Quantidade de unidades recebidas"
            />

            <TextField
              label="Preço de Custo"
              type="number"
              value={precoCustoEntrada}
              onChange={(e) => setPrecoCustoEntrada(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Deixe em branco para manter o preço atual"
              sx={{
                '& input[type=number]': { '-moz-appearance': 'textfield' },
                '& input[type=number]::-webkit-outer-spin-button': { '-webkit-appearance': 'none', margin: 0 },
                '& input[type=number]::-webkit-inner-spin-button': { '-webkit-appearance': 'none', margin: 0 }
              }}
            />

            <TextField
              label="Preço de Venda"
              type="number"
              value={precoVendaEntrada}
              onChange={(e) => setPrecoVendaEntrada(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Deixe em branco para manter o preço atual"
              sx={{
                '& input[type=number]': { '-moz-appearance': 'textfield' },
                '& input[type=number]::-webkit-outer-spin-button': { '-webkit-appearance': 'none', margin: 0 },
                '& input[type=number]::-webkit-inner-spin-button': { '-webkit-appearance': 'none', margin: 0 }
              }}
            />

            <TextField
              label="Motivo *"
              multiline
              rows={3}
              value={motivoEntrada}
              onChange={(e) => setMotivoEntrada(e.target.value)}
              required
              helperText={`Mínimo 10 caracteres (${motivoEntrada.length}/10). Ex: Compra do fornecedor X, NF 12345`}
              error={motivoEntrada.length > 0 && motivoEntrada.length < 10}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => {
            setDialogEntradaAberto(false);
            setPecaSelecionadaEntrada(null);
            setQuantidadeEntrada('');
            setMotivoEntrada('');
            setPrecoCustoEntrada('');
            setPrecoVendaEntrada('');
          }} disabled={loadingEntrada}>
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              setLoadingEntrada(true);
              try {
                // Preparar dados da entrada
                const dadosEntrada: any = {
                  peca_id: pecaSelecionadaEntrada!.id,
                  quantidade: parseInt(quantidadeEntrada),
                  motivo: motivoEntrada.trim()
                };

                // Adicionar preços apenas se foram modificados
                if (precoCustoEntrada && precoCustoEntrada !== pecaSelecionadaEntrada!.preco_custo.toString()) {
                  dadosEntrada.preco_custo = parseFloat(precoCustoEntrada);
                }
                if (precoVendaEntrada && precoVendaEntrada !== pecaSelecionadaEntrada!.preco_venda.toString()) {
                  dadosEntrada.preco_venda = parseFloat(precoVendaEntrada);
                }

                const resultado = await pecaService.darEntrada(dadosEntrada);

                setSuccess(resultado.mensagem || 'Entrada registrada com sucesso!');

                setDialogEntradaAberto(false);
                setPecaSelecionadaEntrada(null);
                setQuantidadeEntrada('');
                setMotivoEntrada('');
                setPrecoCustoEntrada('');
                setPrecoVendaEntrada('');

                await loadPecas();
                setHighlightId(pecaSelecionadaEntrada!.id);
                setTimeout(() => setHighlightId(null), 2000);

              } catch (erro: any) {
                setError(erro.response?.data?.erro || 'Erro ao registrar entrada');
              } finally {
                setLoadingEntrada(false);
              }
            }}
            variant="contained"
            color="success"
            disabled={
              !pecaSelecionadaEntrada ||
              !quantidadeEntrada ||
              parseInt(quantidadeEntrada) <= 0 ||
              motivoEntrada.trim().length < 10 ||
              (precoCustoEntrada && parseFloat(precoCustoEntrada) <= 0) ||
              (precoVendaEntrada && parseFloat(precoVendaEntrada) <= 0) ||
              loadingEntrada
            }
            startIcon={loadingEntrada ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {loadingEntrada ? 'Processando...' : 'Confirmar Entrada'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Saída de Estoque */}
      <Dialog
        open={dialogSaidaAberto}
        onClose={() => {
          if (!loadingSaida) {
            setDialogSaidaAberto(false);
            setPecaSelecionadaSaida(null);
            setQuantidadeSaida('');
            setMotivoSaida('');
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#f44336', color: 'white' }}>
          Saída de Estoque
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Autocomplete
              options={pecas}
              getOptionLabel={(option) => `${option.numero_peca} - ${option.nome} (Estoque: ${option.quantidade_estoque})`}
              renderInput={(params) => (
                <TextField {...params} label="Peça *" required />
              )}
              value={pecaSelecionadaSaida}
              onChange={(_e, newValue) => {
                setPecaSelecionadaSaida(newValue);
                setQuantidadeSaida('');
              }}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body2">
                      {option.numero_peca} - {option.nome}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={option.quantidade_estoque <= option.estoque_minimo ? 'error' : 'text.secondary'}
                    >
                      Estoque: {option.quantidade_estoque}
                      {option.quantidade_estoque <= option.estoque_minimo && ' ⚠️ BAIXO'}
                    </Typography>
                  </Box>
                </li>
              )}
            />

            {pecaSelecionadaSaida && (
              <Alert
                severity={pecaSelecionadaSaida.quantidade_estoque <= pecaSelecionadaSaida.estoque_minimo ? 'warning' : 'info'}
              >
                Estoque atual: <strong>{pecaSelecionadaSaida.quantidade_estoque}</strong> unidades
                {pecaSelecionadaSaida.quantidade_estoque <= pecaSelecionadaSaida.estoque_minimo &&
                  ' (abaixo do mínimo!)'}
              </Alert>
            )}

            <TextField
              label="Quantidade *"
              type="number"
              value={quantidadeSaida}
              onChange={(e) => setQuantidadeSaida(e.target.value)}
              required
              inputProps={{
                min: 1,
                max: pecaSelecionadaSaida?.quantidade_estoque || 999
              }}
              error={
                !!(pecaSelecionadaSaida &&
                parseInt(quantidadeSaida) > pecaSelecionadaSaida.quantidade_estoque)
              }
              helperText={
                pecaSelecionadaSaida && parseInt(quantidadeSaida) > pecaSelecionadaSaida.quantidade_estoque
                  ? `Quantidade excede o estoque disponível (${pecaSelecionadaSaida.quantidade_estoque})`
                  : 'Quantidade de unidades a dar saída'
              }
            />

            <TextField
              label="Motivo *"
              multiline
              rows={3}
              value={motivoSaida}
              onChange={(e) => setMotivoSaida(e.target.value)}
              required
              helperText={`Mínimo 10 caracteres (${motivoSaida.length}/10). Ex: Teste de compatibilidade, Perda por dano`}
              error={motivoSaida.length > 0 && motivoSaida.length < 10}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => {
            setDialogSaidaAberto(false);
            setPecaSelecionadaSaida(null);
            setQuantidadeSaida('');
            setMotivoSaida('');
          }} disabled={loadingSaida}>
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              setLoadingSaida(true);
              try {
                const resultado = await pecaService.darSaida({
                  peca_id: pecaSelecionadaSaida!.id,
                  quantidade: parseInt(quantidadeSaida),
                  motivo: motivoSaida.trim()
                });

                setSuccess(resultado.mensagem);

                // Alerta de estoque baixo?
                if (resultado.dados?.alerta) {
                  setTimeout(() => {
                    setSuccess(resultado.dados.alerta.mensagem);
                  }, 1000);
                }

                setDialogSaidaAberto(false);
                setPecaSelecionadaSaida(null);
                setQuantidadeSaida('');
                setMotivoSaida('');

                await loadPecas();
                setHighlightId(pecaSelecionadaSaida!.id);
                setTimeout(() => setHighlightId(null), 2000);

              } catch (erro: any) {
                setError(erro.response?.data?.erro || 'Erro ao registrar saída');
              } finally {
                setLoadingSaida(false);
              }
            }}
            variant="contained"
            color="error"
            disabled={
              !pecaSelecionadaSaida ||
              !quantidadeSaida ||
              parseInt(quantidadeSaida) <= 0 ||
              parseInt(quantidadeSaida) > (pecaSelecionadaSaida?.quantidade_estoque || 0) ||
              motivoSaida.trim().length < 10 ||
              loadingSaida
            }
            startIcon={loadingSaida ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {loadingSaida ? 'Processando...' : 'Confirmar Saída'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Nova Categoria */}
      <Dialog
        open={dialogCategoriaOpen}
        onClose={() => {
          setDialogCategoriaOpen(false);
          setNovaCategoria({ nome: '', descricao: '' });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nova Categoria</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nome da Categoria"
              value={novaCategoria.nome}
              onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Descrição"
              value={novaCategoria.descricao}
              onChange={(e) => setNovaCategoria({ ...novaCategoria, descricao: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogCategoriaOpen(false);
              setNovaCategoria({ nome: '', descricao: '' });
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCriarCategoria}
            disabled={loadingCategoria || !novaCategoria.nome.trim()}
          >
            {loadingCategoria ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars para mensagens de erro e sucesso */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

