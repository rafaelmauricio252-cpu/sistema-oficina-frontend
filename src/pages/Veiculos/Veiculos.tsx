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
  MenuItem,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { Veiculo, VeiculoFormData, Cliente } from '../../types';
import veiculoService from '../../services/veiculoService';
import clienteService from '../../services/clienteService';

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Estado para proteção de campos
  const [veiculoTemOS, setVeiculoTemOS] = useState(false);
  const [camposProtegidos, setCamposProtegidos] = useState<string[]>([]);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const [formData, setFormData] = useState<VeiculoFormData>({
    cliente_id: 0,
    placa: '',
    marca: '',
    modelo: '',
    ano: undefined,
    cor: '',
    chassi: '',
    km: undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [veiculosData, clientesData] = await Promise.all([
        veiculoService.getAll(),
        clienteService.getAll(),
      ]);
      setVeiculos(veiculosData);
      setClientes(clientesData);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const verificarProtecao = async (id: number) => {
    try {
      const { tem_os, campos_protegidos } = await veiculoService.verificarTemOS(id);
      setVeiculoTemOS(tem_os);
      setCamposProtegidos(campos_protegidos || []);
    } catch (err) {
      console.error('Erro ao verificar proteção do veículo:', err);
      // Em caso de erro, assume sem proteção para não bloquear indevidamente
      setVeiculoTemOS(false);
      setCamposProtegidos([]);
    }
  };

  const handleOpenDialog = async (veiculo?: Veiculo) => {
    if (veiculo) {
      setEditingVeiculo(veiculo);
      // Verificar se tem OS para bloquear campos
      await verificarProtecao(veiculo.id);

      setFormData({
        cliente_id: veiculo.cliente_id,
        placa: veiculo.placa,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        cor: veiculo.cor || '',
        chassi: veiculo.chassi || '',
        km: veiculo.km || undefined,
      });
    } else {
      setEditingVeiculo(null);
      setVeiculoTemOS(false);
      setCamposProtegidos([]);

      setFormData({
        cliente_id: 0,
        placa: '',
        marca: '',
        modelo: '',
        ano: undefined,
        cor: '',
        chassi: '',
        km: undefined,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingVeiculo(null);
    setVeiculoTemOS(false);
    setCamposProtegidos([]);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      let veiculoId: number;

      if (editingVeiculo) {
        console.log('Sending data for update:', formData);
        await veiculoService.update(editingVeiculo.id, formData);
        veiculoId = editingVeiculo.id;
        setSuccess('Veículo atualizado com sucesso!');
      } else {
        console.log('Sending data for create:', formData);
        const response = await veiculoService.create(formData);
        veiculoId = response.id || response.veiculo?.id;
        setSuccess('Veículo criado com sucesso!');
      }

      // Fechar dialog imediatamente
      handleCloseDialog();

      // Recarregar lista
      await loadData();

      // Aplicar highlight
      setHighlightedId(veiculoId);
      setTimeout(() => {
        setHighlightedId(null);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao salvar veículo');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este veículo?')) {
      return;
    }

    try {
      setError(null);
      await veiculoService.delete(id);
      setSuccess('Veículo excluído com sucesso!');
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao excluir veículo');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await veiculoService.search(searchQuery);
      setVeiculos(data);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao buscar veículos');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadData();
  };

  const handleChange = (field: keyof VeiculoFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const getClienteNome = (clienteId: number) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente?.nome || 'N/A';
  };

  const isFieldProtected = (field: string) => {
    return veiculoTemOS && camposProtegidos.includes(field);
  };



  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Veículos</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por Placa, Cliente ou Cor..."
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
            Novo Veículo
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
                <TableCell>Placa</TableCell>
                <TableCell>Marca/Modelo</TableCell>
                <TableCell>Ano</TableCell>
                <TableCell>KM</TableCell>
                <TableCell>Cor</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {veiculos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Nenhum veículo cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                veiculos.map((veiculo) => (
                  <TableRow
                    key={veiculo.id}
                    sx={{
                      backgroundColor: highlightedId === veiculo.id ? '#ffebee' : 'inherit',
                      border: highlightedId === veiculo.id ? '2px solid #f44336' : 'none',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <TableCell>{veiculo.id}</TableCell>
                    <TableCell>{veiculo.placa}</TableCell>
                    <TableCell>{`${veiculo.marca} ${veiculo.modelo}`}</TableCell>
                    <TableCell>{veiculo.ano || '-'}</TableCell>
                    <TableCell>{veiculo.km || '-'}</TableCell>
                    <TableCell>{veiculo.cor || '-'}</TableCell>
                    <TableCell>{getClienteNome(veiculo.cliente_id)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(veiculo)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(veiculo.id)}
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
        )}
      </TableContainer>

      {/* Dialog de Criar/Editar */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingVeiculo ? 'Editar Veículo' : 'Novo Veículo'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

            {veiculoTemOS && (
              <Alert severity="info" sx={{ mb: 1 }}>
                Este veículo possui ordens de serviço vinculadas.
                Placa, Marca, Modelo e Ano não podem ser alterados para manter a integridade fiscal.
              </Alert>
            )}

            <TextField
              select
              label="Cliente"
              value={formData.cliente_id || ''}
              onChange={(e) => handleChange('cliente_id', Number(e.target.value))}
              required
              fullWidth
              disabled={veiculoTemOS}
              helperText={veiculoTemOS ? "Não é possível alterar cliente de veículo com histórico de OS" : ""}
            >
              <MenuItem value="">Selecione um cliente</MenuItem>
              {clientes.map((cliente) => (
                <MenuItem key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Placa"
              value={formData.placa}
              onChange={(e) => handleChange('placa', e.target.value)}
              required
              fullWidth
              disabled={isFieldProtected('placa')}
              helperText={isFieldProtected('placa') ? "Campo protegido (possui OS)" : ""}
            />
            <TextField
              label="Marca"
              value={formData.marca}
              onChange={(e) => handleChange('marca', e.target.value)}
              required
              fullWidth
              disabled={isFieldProtected('marca')}
              helperText={isFieldProtected('marca') ? "Campo protegido (possui OS)" : ""}
            />
            <TextField
              label="Modelo"
              value={formData.modelo}
              onChange={(e) => handleChange('modelo', e.target.value)}
              required
              fullWidth
              disabled={isFieldProtected('modelo')}
              helperText={isFieldProtected('modelo') ? "Campo protegido (possui OS)" : ""}
            />
            <TextField
              label="Ano"
              type="number"
              value={formData.ano || ''}
              onChange={(e) => handleChange('ano', e.target.value ? Number(e.target.value) : undefined)}
              fullWidth
              disabled={isFieldProtected('ano')}
              helperText={isFieldProtected('ano') ? "Campo protegido (possui OS)" : ""}
            />
            <TextField
              label="Cor"
              value={formData.cor}
              onChange={(e) => handleChange('cor', e.target.value)}
              fullWidth
            />
            <TextField
              label="Chassi"
              value={formData.chassi}
              onChange={(e) => handleChange('chassi', e.target.value)}
              fullWidth
            />
            <TextField
              label="KM"
              type="number"
              value={formData.km || ''}
              onChange={(e) => handleChange('km', e.target.value ? Number(e.target.value) : undefined)}
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
