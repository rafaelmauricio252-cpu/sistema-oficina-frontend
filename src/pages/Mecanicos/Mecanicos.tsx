import { useState, useEffect, useCallback } from 'react';
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
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { Mecanico, MecanicoFormData } from '../../types';
import mecanicoService from '../../services/mecanicoService';

export default function Mecanicos() {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMecanico, setEditingMecanico] = useState<Mecanico | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<MecanicoFormData>({
    nome: '',
    cpf: '',
    especialidade: '',
    telefone: '',
    email: '',
  });

  const loadMecanicos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mecanicoService.getAll();
      setMecanicos(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { erro?: string } } };
      setError(error.response?.data?.erro || 'Erro ao carregar mecânicos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMecanicos();
  }, [loadMecanicos]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadMecanicos();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await mecanicoService.search(searchQuery);
      setMecanicos(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { erro?: string } } };
      setError(error.response?.data?.erro || 'Erro ao buscar mecânicos');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, loadMecanicos]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [handleSearch]);

  const handleClearSearch = () => {
    setSearchQuery('');
    loadMecanicos();
  };

  const handleOpenDialog = (mecanico?: Mecanico) => {
    if (mecanico) {
      setEditingMecanico(mecanico);
      setFormData({
        nome: mecanico.nome,
        cpf: mecanico.cpf || '',
        especialidade: mecanico.especialidade,
        telefone: mecanico.telefone,
        email: mecanico.email || '',
      });
    } else {
      setEditingMecanico(null);
      setFormData({ nome: '', cpf: '', especialidade: '', telefone: '', email: '' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      let mecanicoId: number;

      if (editingMecanico) {
        await mecanicoService.update(editingMecanico.id, formData);
        mecanicoId = editingMecanico.id;
        setSuccess('Mecânico atualizado com sucesso!');
      } else {
        const response = await mecanicoService.create(formData);
        mecanicoId = response.id || response.mecanico?.id;
        setSuccess('Mecânico criado com sucesso!');
      }

      // Fechar dialog imediatamente
      setDialogOpen(false);

      // Recarregar lista
      await loadMecanicos();

      // Aplicar highlight
      setHighlightedId(mecanicoId);
      setTimeout(() => {
        setHighlightedId(null);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao salvar mecânico');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este mecânico?')) return;
    try {
      await mecanicoService.delete(id);
      setSuccess('Mecânico excluído com sucesso!');
      loadMecanicos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao excluir mecânico');
    }
  };



  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Mecânicos</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por Nome, CPF ou Especialidade..."
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
            Novo Mecânico
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
                <TableCell>CPF</TableCell>
                <TableCell>Especialidade</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mecanicos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Nenhum mecânico cadastrado</TableCell>
                </TableRow>
              ) : (
                mecanicos.map((mecanico) => (
                  <TableRow
                    key={mecanico.id}
                    sx={{
                      backgroundColor: highlightedId === mecanico.id ? '#ffebee' : 'inherit',
                      border: highlightedId === mecanico.id ? '2px solid #f44336' : 'none',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <TableCell>{mecanico.id}</TableCell>
                    <TableCell>{mecanico.nome}</TableCell>
                    <TableCell>{mecanico.cpf || '-'}</TableCell>
                    <TableCell>{mecanico.especialidade}</TableCell>
                    <TableCell>{mecanico.telefone}</TableCell>
                    <TableCell>{mecanico.email || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(mecanico)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(mecanico.id)} color="error">
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
        <DialogTitle>{editingMecanico ? 'Editar Mecânico' : 'Novo Mecânico'}</DialogTitle>
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
              label="CPF"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              required
              fullWidth
              helperText="Apenas números"
            />
            <TextField
              label="Especialidade"
              value={formData.especialidade}
              onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
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
