import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Clientes from './pages/Clientes/Clientes';
import Veiculos from './pages/Veiculos/Veiculos';
import Mecanicos from './pages/Mecanicos/Mecanicos';
import Servicos from './pages/Servicos/Servicos';
import Pecas from './pages/Pecas/Pecas';
import OrdemServico from './pages/OrdemServico/OrdemServico';
import FinanceiroDashboard from './pages/Financeiro/Dashboard';
import FinanceiroReceitas from './pages/Financeiro/Receitas';
import Usuarios from './pages/Usuarios/Usuarios';
import Relatorios from './pages/Relatorios/Relatorios';

import { theme } from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="veiculos" element={<Veiculos />} />
              <Route path="mecanicos" element={<Mecanicos />} />
              <Route path="servicos" element={<Servicos />} />
              <Route path="pecas" element={<Pecas />} />
              <Route path="ordem-servico" element={<OrdemServico />} />
              <Route path="financeiro/dashboard" element={<FinanceiroDashboard />} />
              <Route path="financeiro/receitas" element={<FinanceiroReceitas />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="relatorios" element={<Relatorios />} />
            </Route>

            {/* Rota padrão */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
