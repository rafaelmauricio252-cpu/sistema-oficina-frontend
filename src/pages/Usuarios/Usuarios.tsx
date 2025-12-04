import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  Tooltip,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as KeyIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import usuarioService from '../../services/usuarioService';
import type { Usuario } from '../../types';

const MODULOS = [
  { value: 'clientes', label: 'Clientes' },
  { value: 'veiculos', label: 'Veículos' },
  { value: 'mecanicos', label: 'Mecânicos' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'pecas', label: 'Peças' },
  { value: 'ordem_servico', label: 'Ordem de Serviço' },
];

const Usuarios: React.FC = () => {
  const { usuario: usuarioLogado } = useAuth();

  // Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState<Partial<Usuario>>({
    nome: '',
    email: '',
    tipo: 'comum',
    ativo: true,
    permissoes: [],
  });
  const [senha, setSenha] = useState('');
  const [highlightId, setHighlightId] = useState<number | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  // Dialog reset senha
  const [dialogResetOpen, setDialogResetOpen] = useState(false);
  const [senhaTemporaria, setSenhaTemporaria] = useState('');

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const dados = await usuarioService.listar();
      setUsuarios(dados);
    } catch (erro: any) {
      mostrarSnackbar(erro.response?.data?.erro || 'Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleNovo = () => {
    setUsuarioAtual({
      nome: '',
      email: '',
      tipo: 'comum',
      ativo: true,
      permissoes: [],
    });
    setSenha('');
    setModoEdicao(false);
    setDialogOpen(true);
  };

  const handleEditar = (usuario: Usuario) => {
    setUsuarioAtual(usuario);
    setSenha('');
    setModoEdicao(true);
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    try {
      setLoading(true);

      // Validações
      if (!usuarioAtual.nome || !usuarioAtual.email) {
        mostrarSnackbar('Nome e email são obrigatórios', 'error');
        return;
      }

      if (!modoEdicao && !senha) {
        mostrarSnackbar('Senha é obrigatória para novo usuário', 'error');
        return;
      }

      if (!modoEdicao && senha.length < 6) {
        mostrarSnackbar('Senha deve ter no mínimo 6 caracteres', 'error');
        return;
      }

      let usuarioSalvo: Usuario;

      if (modoEdicao && usuarioAtual.id) {
        // Atualizar dados básicos
        usuarioSalvo = await usuarioService.atualizar(usuarioAtual.id, {
          nome: usuarioAtual.nome,
          email: usuarioAtual.email,
          tipo: usuarioAtual.tipo,
          ativo: usuarioAtual.ativo,
        });

        // Atualizar permissões (se não for admin)
        if (usuarioAtual.tipo === 'comum') {
          await usuarioService.atualizarPermissoes(
            usuarioAtual.id,
            usuarioAtual.permissoes || []
          );
        }

        mostrarSnackbar('Usuário atualizado com sucesso', 'success');
      } else {
        // Criar novo
        usuarioSalvo = await usuarioService.criar({
          nome: usuarioAtual.nome,
          email: usuarioAtual.email,
          senha: senha,
          tipo: usuarioAtual.tipo || 'comum',
          permissoes: usuarioAtual.tipo === 'comum' ? usuarioAtual.permissoes : undefined,
        });

        mostrarSnackbar('Usuário criado com sucesso', 'success');

        // Highlight temporário
        setHighlightId(usuarioSalvo.id);
        setTimeout(() => setHighlightId(null), 2000);
      }

      setDialogOpen(false);
      carregarUsuarios();
    } catch (erro: any) {
      mostrarSnackbar(erro.response?.data?.erro || 'Erro ao salvar usuário', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetarSenha = async (usuario: Usuario) => {
    if (!confirm(`Resetar senha de ${usuario.nome}?`)) return;

    try {
      setLoading(true);
      const resposta = await usuarioService.resetarSenha(usuario.id);
      setSenhaTemporaria(resposta.senha_temporaria);
      setDialogResetOpen(true);
      mostrarSnackbar('Senha resetada com sucesso', 'success');
      carregarUsuarios();
    } catch (erro: any) {
      mostrarSnackbar(erro.response?.data?.erro || 'Erro ao resetar senha', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDesativar = async (usuario: Usuario) => {
    if (usuario.id === usuarioLogado?.id) {
      mostrarSnackbar('Você não pode desativar sua própria conta', 'error');
      return;
    }

    if (!confirm(`Desativar usuário ${usuario.nome}?`)) return;

    try {
      setLoading(true);
      await usuarioService.desativar(usuario.id);
      mostrarSnackbar('Usuário desativado com sucesso', 'success');
      carregarUsuarios();
    } catch (erro: any) {
      mostrarSnackbar(erro.response?.data?.erro || 'Erro ao desativar usuário', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissaoChange = (modulo: string, checked: boolean) => {
    const permissoesAtuais = usuarioAtual.permissoes || [];
    let novasPermissoes: string[];

    if (checked) {
      novasPermissoes = [...permissoesAtuais, modulo];
    } else {
      novasPermissoes = permissoesAtuais.filter(p => p !== modulo);
    }

    setUsuarioAtual({ ...usuarioAtual, permissoes: novasPermissoes });
  };

  const copiarSenha = () => {
    navigator.clipboard.writeText(senhaTemporaria);
    mostrarSnackbar('Senha copiada para a área de transferência', 'success');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Gestão de Usuários</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNovo}>
          Novo Usuário
        </Button>
      </Box>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Permissões</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow
                key={usuario.id}
                sx={{
                  backgroundColor: highlightId === usuario.id ? '#ffebee' : 'inherit',
                  border: highlightId === usuario.id ? '2px solid #f44336' : 'none',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <TableCell>{usuario.nome}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Chip
                    label={usuario.tipo === 'admin' ? 'Admin' : 'Comum'}
                    color={usuario.tipo === 'admin' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={usuario.ativo ? 'Ativo' : 'Inativo'}
                    color={usuario.ativo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {usuario.tipo === 'admin' ? (
                    <Chip label="Acesso Total" color="primary" size="small" />
                  ) : usuario.permissoes && usuario.permissoes.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {usuario.permissoes.slice(0, 2).map(perm => (
                        <Chip key={perm} label={perm} size="small" variant="outlined" />
                      ))}
                      {usuario.permissoes.length > 2 && (
                        <Chip label={`+${usuario.permissoes.length - 2}`} size="small" />
                      )}
                    </Box>
                  ) : (
                    <Chip label="Sem permissões" size="small" color="warning" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleEditar(usuario)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Resetar Senha">
                    <IconButton onClick={() => handleResetarSenha(usuario)} size="small">
                      <KeyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Desativar">
                    <IconButton
                      onClick={() => handleDesativar(usuario)}
                      size="small"
                      color="error"
                      disabled={usuario.id === usuarioLogado?.id}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Criar/Editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{modoEdicao ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nome"
              value={usuarioAtual.nome || ''}
              onChange={(e) => setUsuarioAtual({ ...usuarioAtual, nome: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Email"
              type="email"
              value={usuarioAtual.email || ''}
              onChange={(e) => setUsuarioAtual({ ...usuarioAtual, email: e.target.value })}
              fullWidth
              required
            />

            {!modoEdicao && (
              <TextField
                label="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                fullWidth
                required
                helperText="Mínimo 6 caracteres. Usuário será forçado a trocar no primeiro login."
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Tipo de Usuário</InputLabel>
              <Select
                value={usuarioAtual.tipo || 'comum'}
                onChange={(e) =>
                  setUsuarioAtual({
                    ...usuarioAtual,
                    tipo: e.target.value as 'admin' | 'comum',
                  })
                }
                label="Tipo de Usuário"
              >
                <MenuItem value="comum">Comum</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>

            {modoEdicao && (
              <FormControlLabel
                control={
                  <Switch
                    checked={usuarioAtual.ativo}
                    onChange={(e) =>
                      setUsuarioAtual({ ...usuarioAtual, ativo: e.target.checked })
                    }
                  />
                }
                label="Usuário Ativo"
              />
            )}

            {/* Permissões (apenas para usuário comum) */}
            {usuarioAtual.tipo === 'comum' && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Permissões de Acesso
                </Typography>
                <FormGroup>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                      gap: 1,
                    }}
                  >
                    {MODULOS.map((modulo) => (
                      <FormControlLabel
                        key={modulo.value}
                        control={
                          <Checkbox
                            checked={usuarioAtual.permissoes?.includes(modulo.value) || false}
                            onChange={(e) =>
                              handlePermissaoChange(modulo.value, e.target.checked)
                            }
                          />
                        }
                        label={modulo.label}
                      />
                    ))}
                  </Box>
                </FormGroup>
              </Box>
            )}

            {usuarioAtual.tipo === 'admin' && (
              <Alert severity="info">
                Administradores têm acesso total a todos os módulos do sistema.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSalvar} variant="contained" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Senha Resetada */}
      <Dialog open={dialogResetOpen} onClose={() => setDialogResetOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Senha Resetada com Sucesso</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            A senha foi resetada. Informe esta senha temporária ao usuário:
          </Alert>
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6" fontFamily="monospace">
              {senhaTemporaria}
            </Typography>
            <IconButton onClick={copiarSenha} color="primary">
              <CopyIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            O usuário será forçado a trocar a senha no próximo login.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogResetOpen(false)} variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'error' ? 6000 : 4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Usuarios;
