import { createTheme } from '@mui/material/styles';

// FC CENTRO AUTOMOTIVO - Palette baseada na logo
const palette = {
    primary: {
        main: '#FF6B00', // Laranja principal da logo
        light: '#FF8533', // Laranja claro (hover/estados ativos)
        dark: '#CC5500', // Laranja escuro (pressed/darker states)
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#2C2C2C', // Cinza escuro
        light: '#424242',
        dark: '#1a1a1a',
        contrastText: '#ffffff',
    },
    background: {
        default: '#f5f5f5', // Cinza muito claro
        paper: '#ffffff',
    },
    text: {
        primary: '#1a1a1a', // Preto suave
        secondary: '#666666', // Cinza médio
    },
    success: {
        main: '#10b981',
        light: '#d1fae5',
    },
    error: {
        main: '#ef4444',
        light: '#fee2e2',
    },
    warning: {
        main: '#f59e0b',
        light: '#fef3c7',
    },
    info: {
        main: '#FF6B00',
        light: '#FFE5D5',
    },
    divider: 'rgba(255, 107, 0, 0.1)', // Laranja suave
};

export const theme = createTheme({
    palette,
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, letterSpacing: '-0.025em' },
        h2: { fontWeight: 700, letterSpacing: '-0.025em' },
        h3: { fontWeight: 600, letterSpacing: '-0.025em' },
        h4: { fontWeight: 600, letterSpacing: '-0.025em' },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 500 },
        subtitle2: { fontWeight: 500 },
        button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: palette.background.default,
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: '#f5f5f5',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#FF6B00',
                        borderRadius: '4px',
                        '&:hover': {
                            backgroundColor: '#FF8533',
                        },
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                },
                elevation2: {
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                    border: '1px solid rgba(255, 107, 0, 0.15)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    backgroundColor: '#FFF8F3',
                    color: '#2C2C2C',
                    borderBottom: '2px solid #FF6B00',
                },
                root: {
                    borderBottom: '1px solid #f5f5f5',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.3)',
                    borderBottom: '2px solid #FF6B00',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#1a1a1a', // Preto da logo
                    color: '#ffffff',
                    borderRight: '2px solid rgba(255, 107, 0, 0.3)',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    '&.Mui-selected': {
                        backgroundColor: '#FF6B00',
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: '#FF8533',
                        },
                        '& .MuiListItemIcon-root': {
                            color: '#ffffff',
                        },
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(255, 107, 0, 0.1)',
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: '#cccccc', // Cinza claro para ícones
                    minWidth: 40,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
    },
});
