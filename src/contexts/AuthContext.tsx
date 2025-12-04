import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Usuario } from '../types';
import authService from '../services/authService';

interface AuthContextData {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  atualizarUsuario: () => Promise<void>;
  temPermissao: (modulo: string) => boolean;
  eAdmin: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Verificar autenticação ao carregar
  useEffect(() => {
    verificarAutenticacao();
  }, []);

  const verificarAutenticacao = async () => {
    try {
      if (authService.estaAutenticado()) {
        const usuarioData = await authService.me();
        setUsuario(usuarioData);
      }
    } catch (erro) {
      console.error('Erro ao verificar autenticação:', erro);
      authService.removerToken();
    } finally {
      setCarregando(false);
    }
  };

  const login = async (email: string, senha: string) => {
    const resposta = await authService.login({ email, senha });
    authService.salvarToken(resposta.token);
    setUsuario(resposta.usuario);
  };

  const logout = () => {
    authService.removerToken();
    setUsuario(null);
    window.location.href = '/login';
  };

  const atualizarUsuario = async () => {
    const usuarioData = await authService.me();
    setUsuario(usuarioData);
  };

  const temPermissao = (modulo: string): boolean => {
    if (!usuario) return false;
    if (usuario.tipo === 'admin') return true;
    return usuario.permissoes.includes(modulo);
  };

  const eAdmin = usuario?.tipo === 'admin';

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        login,
        logout,
        atualizarUsuario,
        temPermissao,
        eAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
