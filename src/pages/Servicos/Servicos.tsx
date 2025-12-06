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
  Switch,
  FormControlLabel,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { Servico, ServicoFormData } from '../../types';
import servicoService from '../../services/servicoService';

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<ServicoFormData>({
    nome: '',
    descricao: '',
    preco_padrao: 0,
    tempo_estimado: undefined,
    ativo: true,
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    loadServicos();
  }, []);

  const loadServicos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await servicoService.getAll();
      setServicos(data);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadServicos();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await servicoService.search(searchQuery);
      setServicos(data);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao buscar serviços');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadServicos();
  };

  const handleOpenDialog = (servico?: Servico) => {
    if (servico) {
      setEditingServico(servico);
      setFormData({
        nome: servico.nome,
        descricao: servico.descricao || '',
        preco_padrao: servico.preco_padrao,
        tempo_estimado: servico.tempo_estimado,
        ativo: servico.ativo,
      });
    } else {
      setEditingServico(null);
      setFormData({ nome: '', descricao: '', preco_padrao: 0, tempo_estimado: undefined, ativo: true });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      let servicoId: number;

      if (editingServico) {
        await servicoService.update(editingServico.id, formData);
        servicoId = editingServico.id;
        setSuccess('Serviço atualizado com sucesso!');
      } else {
        const response = await servicoService.create(formData);
        servicoId = response.id || response.servico?.id;
        setSuccess('Serviço criado com sucesso!');
      }

      // Fechar dialog imediatamente
      setDialogOpen(false);

      // Recarregar lista
      await loadServicos();

      // Aplicar highlight
      setHighlightedId(servicoId);
      setTimeout(() => {
        setHighlightedId(null);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao salvar serviço');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
      await servicoService.delete(id);
      setSuccess('Serviço excluído com sucesso!');
      loadServicos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao excluir serviço');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);



  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Serviços</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por Nome ou Descrição..."
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
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Novo Serviço
          </Button>
        </Box>
      </Box>


      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Preço Padrão</TableCell>
                <TableCell>Tempo Estimado (min)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Nenhum serviço cadastrado</TableCell>
                </TableRow>
              ) : (
                servicos.map((servico) => (
                  <TableRow
                    key={servico.id}
                    sx={{
                      backgroundColor: highlightedId === servico.id ? '#ffebee' : 'inherit',
                      border: highlightedId === servico.id ? '2px solid #f44336' : 'none',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <TableCell>{servico.id}</TableCell>
                    <TableCell>{servico.nome}</TableCell>
                    <TableCell>{formatCurrency(servico.preco_padrao)}</TableCell>
                    <TableCell>{servico.tempo_estimado || '-'}</TableCell>
                    <TableCell>
                      <Chip label={servico.ativo ? 'Ativo' : 'Inativo'} color={servico.ativo ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(servico)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(servico.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingServico ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="Preço Padrão"
              type="number"
              value={formData.preco_padrao}
              onChange={(e) => setFormData({ ...formData, preco_padrao: parseFloat(e.target.value) || 0 })}
              required
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              sx={{
                '& input[type=number]': {
                  '-moz-appearance': 'textfield'
                },
                '& input[type=number]::-webkit-outer-spin-button': {
                  '-webkit-appearance': 'none',
                  margin: 0
                },
                '& input[type=number]::-webkit-inner-spin-button': {
                  '-webkit-appearance': 'none',
                  margin: 0
                }
              }}
            />
            <TextField
              label="Tempo Estimado (minutos)"
              type="number"
              value={formData.tempo_estimado || ''}
              onChange={(e) => setFormData({ ...formData, tempo_estimado: e.target.value ? parseInt(e.target.value) : undefined })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(formData.ativo)}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                />
              }
              label="Serviço Ativo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Salvar</Button>
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
