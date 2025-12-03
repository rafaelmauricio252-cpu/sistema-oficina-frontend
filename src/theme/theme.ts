import { createTheme, alpha } from '@mui/material/styles';

// Enterprise Professional Palette
const palette = {
    primary: {
        main: '#0f172a', // Navy Blue (Slate 900)
        light: '#334155', // Slate 700
        dark: '#020617', // Slate 950
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#3b82f6', // Bright Blue (for accents)
        light: '#60a5fa',
        dark: '#2563eb',
        contrastText: '#ffffff',
    },
    background: {
        default: '#f1f5f9', // Slate 100
        paper: '#ffffff',
    },
    text: {
        primary: '#1e293b', // Slate 800
        secondary: '#64748b', // Slate 500
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
        main: '#3b82f6',
        light: '#dbeafe',
    },
    divider: '#e2e8f0', // Slate 200
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
                        backgroundColor: '#f1f5f9',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#cbd5e1',
                        borderRadius: '4px',
                        '&:hover': {
                            backgroundColor: '#94a3b8',
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
                    border: '1px solid #e2e8f0',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    borderBottom: '1px solid #e2e8f0',
                },
                root: {
                    borderBottom: '1px solid #f1f5f9',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                    borderBottom: '1px solid #e2e8f0',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#0f172a', // Dark Sidebar
                    color: '#f8fafc',
                    borderRight: 'none',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    '&.Mui-selected': {
                        backgroundColor: alpha('#3b82f6', 0.15),
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: alpha('#3b82f6', 0.25),
                        },
                        '& .MuiListItemIcon-root': {
                            color: '#3b82f6', // Accent color for icon
                        },
                    },
                    '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.05),
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: '#94a3b8', // Muted icon color
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
