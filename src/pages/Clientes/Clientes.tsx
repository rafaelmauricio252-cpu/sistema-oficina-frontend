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
  Snackbar,
  TablePagination,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  PersonOffOutlined as PersonOffOutlinedIcon,
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    veiculo: {
      placa: '',
      marca: '',
      modelo: '',
      ano: undefined,
      cor: '',
    },
  });

  const loadClientes = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadClientes();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await clienteService.search(searchQuery);
      setClientes(data);
      setPage(0);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao buscar clientes');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, loadClientes]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [handleSearch]);

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
        veiculo: {
          placa: '',
          marca: '',
          modelo: '',
          ano: undefined,
          cor: '',
        },
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

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
    loadClientes();
  };



  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Clientes</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por nome, CPF ou Placa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
            sx={{ width: '300px' }}
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
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Novo Cliente
          </Button>
        </Box>
      </Box>


      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ p: 3 }}>
            {[1, 2, 3, 4, 5].map((index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Skeleton variant="rectangular" width={60} height={40} />
                <Skeleton variant="text" width="25%" height={40} />
                <Skeleton variant="text" width="20%" height={40} />
                <Skeleton variant="text" width="15%" height={40} />
                <Skeleton variant="text" width="20%" height={40} />
                <Skeleton variant="rectangular" width={100} height={40} />
              </Box>
            ))}
          </Box>
        ) : clientes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonOffOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery
                ? 'Tente ajustar os termos de busca ou limpar os filtros'
                : 'Comece adicionando seu primeiro cliente para gerenciar ordens de serviço'}
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
                Novo Cliente
              </Button>
            )}
          </Box>
        ) : (
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
              {clientes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((cliente) => (
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
                ))}
            </TableBody>
          </Table>
        )}
        <TablePagination
          component="div"
          count={clientes.length}
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

            {!editingCliente && (
              <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Dados do Veículo (Opcional)
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Placa"
                    value={formData.veiculo?.placa || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      veiculo: { ...formData.veiculo!, placa: e.target.value.toUpperCase() }
                    })}
                    fullWidth
                  />
                  <TextField
                    label="Marca"
                    value={formData.veiculo?.marca || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      veiculo: { ...formData.veiculo!, marca: e.target.value }
                    })}
                    fullWidth
                  />
                  <TextField
                    label="Modelo"
                    value={formData.veiculo?.modelo || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      veiculo: { ...formData.veiculo!, modelo: e.target.value }
                    })}
                    fullWidth
                  />
                  <TextField
                    label="Cor"
                    value={formData.veiculo?.cor || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      veiculo: { ...formData.veiculo!, cor: e.target.value }
                    })}
                    fullWidth
                  />
                  <TextField
                    label="Ano"
                    type="number"
                    value={formData.veiculo?.ano || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      veiculo: { ...formData.veiculo!, ano: parseInt(e.target.value) || undefined }
                    })}
                    fullWidth
                  />
                </Box>
              </Box>
            )}
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
      < Snackbar
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
