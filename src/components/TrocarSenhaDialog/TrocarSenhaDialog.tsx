import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

interface TrocarSenhaDialogProps {
  open: boolean;
  obrigatorio?: boolean;
  onClose: () => void;
}

const TrocarSenhaDialog: React.FC<TrocarSenhaDialogProps> = ({
  open,
  obrigatorio = false,
  onClose,
}) => {
  const { atualizarUsuario } = useAuth();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    // Validações
    if (!obrigatorio && !senhaAtual) {
      setErro('Senha atual é obrigatória');
      return;
    }

    if (!senhaNova || senhaNova.length < 6) {
      setErro('Nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (senhaNova !== senhaConfirmacao) {
      setErro('Senhas não conferem');
      return;
    }

    try {
      setCarregando(true);

      await authService.trocarSenha({
        senha_atual: obrigatorio ? undefined : senhaAtual,
        senha_nova: senhaNova,
      });

      // Atualizar dados do usuário
      await atualizarUsuario();

      setSucesso('Senha alterada com sucesso!');
      setTimeout(() => {
        onClose();
        // Limpar campos
        setSenhaAtual('');
        setSenhaNova('');
        setSenhaConfirmacao('');
      }, 1500);
    } catch (erro: any) {
      console.error('Erro ao trocar senha:', erro);
      setErro(erro.response?.data?.erro || 'Erro ao trocar senha');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={obrigatorio ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={obrigatorio}
    >
      <DialogTitle>
        {obrigatorio ? 'Troca de Senha Obrigatória' : 'Trocar Senha'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {obrigatorio && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Por segurança, você precisa trocar sua senha antes de continuar.
            </Alert>
          )}

          {erro && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erro}
            </Alert>
          )}

          {sucesso && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {sucesso}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!obrigatorio && (
              <TextField
                label="Senha Atual"
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                fullWidth
                required
                disabled={carregando}
              />
            )}

            <TextField
              label="Nova Senha"
              type="password"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              fullWidth
              required
              disabled={carregando}
              helperText="Mínimo 6 caracteres"
            />

            <TextField
              label="Confirmar Nova Senha"
              type="password"
              value={senhaConfirmacao}
              onChange={(e) => setSenhaConfirmacao(e.target.value)}
              fullWidth
              required
              disabled={carregando}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          {!obrigatorio && (
            <Button onClick={onClose} disabled={carregando}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={carregando}>
            {carregando ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TrocarSenhaDialog;
