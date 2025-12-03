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
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { Cliente, ClienteFormData } from '../../types';
import clienteService from '../../services/clienteService';

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clienteTemOS, setClienteTemOS] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clienteService.getAll();
      setClientes(data);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = async (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nome: cliente.nome,
        cpf_cnpj: cliente.cpf_cnpj,
        telefone: cliente.telefone,
        email: cliente.email || '',
        endereco: cliente.endereco || '',
      });

      // Verificar se cliente tem OS
      try {
        const temOS = await clienteService.verificarTemOS(cliente.id);
        setClienteTemOS(temOS);
      } catch (err) {
        console.error('Erro ao verificar OS:', err);
        setClienteTemOS(false);
      }
    } else {
      setEditingCliente(null);
      setClienteTemOS(false);
      setFormData({
        nome: '',
        cpf_cnpj: '',
        telefone: '',
        email: '',
        endereco: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCliente(null);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      let clienteId: number;

      if (editingCliente) {
        await clienteService.update(editingCliente.id, formData);
        clienteId = editingCliente.id;
        setSuccess('Cliente atualizado com sucesso!');
      } else {
        const response = await clienteService.create(formData);
        clienteId = response.id || response.cliente?.id;
        setSuccess('Cliente criado com sucesso!');
      }

      // Fechar dialog imediatamente
      handleCloseDialog();

      // Recarregar lista
      await loadClientes();

      // Aplicar highlight
      setHighlightedId(clienteId);
      setTimeout(() => {
        setHighlightedId(null);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao salvar cliente');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      setError(null);
      await clienteService.delete(id);
      setSuccess('Cliente excluído com sucesso!');
      loadClientes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao excluir cliente');
    }
  };

  const handleChange = (field: keyof ClienteFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadClientes();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await clienteService.search(searchQuery);
      setClientes(data);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao buscar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadClientes();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Clientes</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
            sx={{ width: '300px' }}
          />
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            Buscar
          </Button>
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
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Novo Cliente
          </Button>
        </Box>
      </Box>


      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>CPF/CNPJ</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhum cliente cadastrado
                </TableCell>
              </TableRow>
            ) : (
              clientes.map((cliente) => (
                <TableRow
                  key={cliente.id}
                  sx={{
                    backgroundColor: highlightedId === cliente.id ? '#ffebee' : 'inherit',
                    border: highlightedId === cliente.id ? '2px solid #f44336' : 'none',
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <TableCell>{cliente.id}</TableCell>
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>{cliente.cpf_cnpj}</TableCell>
                  <TableCell>{cliente.telefone}</TableCell>
                  <TableCell>{cliente.email || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(cliente)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(cliente.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Criar/Editar */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {clienteTemOS && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Este cliente possui ordens de serviço. Nome e CPF/CNPJ não podem ser alterados.
              </Alert>
            )}
            <TextField
              label="Nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              required
              fullWidth
              disabled={clienteTemOS}
            />
            <TextField
              label="CPF/CNPJ"
              value={formData.cpf_cnpj}
              onChange={(e) => handleChange('cpf_cnpj', e.target.value)}
              required
              fullWidth
              disabled={clienteTemOS}
            />
            <TextField
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              fullWidth
            />
            <TextField
              label="Endereço"
              value={formData.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
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
