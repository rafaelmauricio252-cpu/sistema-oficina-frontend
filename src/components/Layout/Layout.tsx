import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Collapse,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  DirectionsCar as DirectionsCarIcon,
  Build as BuildIcon,
  HomeRepairService as HomeRepairServiceIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  ExpandLess,
  ExpandMore,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  ManageAccounts as ManageAccountsIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import TrocarSenhaDialog from '../TrocarSenhaDialog/TrocarSenhaDialog';

const drawerWidth = 260;

interface MenuItem {
  text: string;
  icon: React.JSX.Element;
  path?: string;
  modulo?: string | null;
  subItems?: { text: string; icon: React.JSX.Element; path: string }[];
}

const todosMenuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', modulo: null },
  { text: 'Ordem de Serviço', icon: <AssignmentIcon />, path: '/ordem-servico', modulo: 'ordem_servico' },
  { text: 'Peças', icon: <InventoryIcon />, path: '/pecas', modulo: 'pecas' },
  { text: 'Serviços', icon: <HomeRepairServiceIcon />, path: '/servicos', modulo: 'servicos' },
  { text: 'Veículos', icon: <DirectionsCarIcon />, path: '/veiculos', modulo: 'veiculos' },
  { text: 'Mecânicos', icon: <BuildIcon />, path: '/mecanicos', modulo: 'mecanicos' },
  { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes', modulo: 'clientes' },
  {
    text: 'Financeiro',
    icon: <AttachMoneyIcon />,
    modulo: 'financeiro',
    subItems: [
      { text: 'Dashboard', icon: <TrendingUpIcon />, path: '/financeiro/dashboard' },
      { text: 'Receitas', icon: <ReceiptIcon />, path: '/financeiro/receitas' },
    ]
  },
  { text: 'Relatórios', icon: <AssessmentIcon />, path: '/relatorios', modulo: null },
  { text: 'Usuários', icon: <ManageAccountsIcon />, path: '/usuarios', modulo: 'admin' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [financeiroOpen, setFinanceiroOpen] = useState(true);
  const [dialogSenhaOpen, setDialogSenhaOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { usuario, logout, temPermissao, eAdmin } = useAuth();

  // Verificar se deve trocar senha
  useEffect(() => {
    if (usuario?.deve_trocar_senha) {
      setDialogSenhaOpen(true);
    }
  }, [usuario]);

  // Filtrar menu baseado em permissões
  const menuItems = todosMenuItems.filter(item => {
    if (!item.modulo) return true; // Dashboard sempre visível
    if (item.modulo === 'admin') return eAdmin; // Usuários apenas para admin
    return temPermissao(item.modulo);
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ bgcolor: 'transparent', color: 'white', px: 2 }}>
        <BuildIcon sx={{ mr: 2, color: 'primary.main' }} /> {/* Using primary color for logo accent if needed, or keep white */}
        <Box>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            OFICINA PRO
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 2 }}>
            ENTERPRISE
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {menuItems.map((item) => (
          <div key={item.text}>
            {/* Item com submenu */}
            {item.subItems ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => setFinanceiroOpen(!financeiroOpen)}
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.main',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {financeiroOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={financeiroOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.path}
                        selected={location.pathname === subItem.path}
                        onClick={() => handleMenuClick(subItem.path)}
                        sx={{
                          pl: 4,
                          '&.Mui-selected': {
                            bgcolor: 'primary.light',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.main',
                            },
                            '& .MuiListItemIcon-root': {
                              color: 'white',
                            },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: location.pathname === subItem.path ? 'white' : 'inherit',
                          }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              /* Item normal sem submenu */
              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleMenuClick(item.path!)}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.main',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? 'white' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )}
          </div>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            Sistema de Gestão
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2">
              {usuario?.nome}
            </Typography>
            <Button color="inherit" onClick={logout}>
              Sair
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      <TrocarSenhaDialog
        open={dialogSenhaOpen}
        obrigatorio={usuario?.deve_trocar_senha}
        onClose={() => setDialogSenhaOpen(false)}
      />
    </Box>
  );
}
