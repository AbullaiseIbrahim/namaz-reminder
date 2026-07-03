import { createTheme, alpha } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a5276',
      light: '#2471a3',
      dark: '#154360',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d4ac0d',
      light: '#f1c40f',
      dark: '#b7950b',
      contrastText: '#1a2733',
    },
    success:  { main: '#1e8449', light: '#27ae60', dark: '#1a6935' },
    warning:  { main: '#d4860d', light: '#e67e22', dark: '#b7730b' },
    error:    { main: '#c0392b', light: '#e74c3c', dark: '#a93226' },
    info:     { main: '#7d3c98', light: '#9b59b6', dark: '#6c3483' },
    background: {
      default: '#f0f4f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2733',
      secondary: '#7a8794',
    },
    divider: 'rgba(26,82,118,0.08)',
  },
  typography: {
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 13,
    h1: { fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.5px' },
    h2: { fontWeight: 800, fontSize: '1.5rem',  letterSpacing: '-0.4px' },
    h3: { fontWeight: 800, fontSize: '1.3rem',  letterSpacing: '-0.3px' },
    h4: { fontWeight: 800, fontSize: '1.2rem',  letterSpacing: '-0.3px' },
    h5: { fontWeight: 700, fontSize: '1.1rem',  letterSpacing: '-0.2px' },
    h6: { fontWeight: 700, fontSize: '1rem' },
    subtitle1: { fontWeight: 600, fontSize: '0.9rem' },
    subtitle2: { fontWeight: 600, fontSize: '0.8rem' },
    body1:  { fontWeight: 400, fontSize: '0.875rem' },
    body2:  { fontWeight: 400, fontSize: '0.8rem' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0', fontSize: '0.875rem' },
    caption: { fontWeight: 500, fontSize: '0.72rem' },
  },
  shape: { borderRadius: 16 },
  shadows: [
    'none',
    '0 1px 3px rgba(26,82,118,0.06), 0 1px 2px rgba(26,82,118,0.04)',
    '0 2px 8px rgba(26,82,118,0.08), 0 1px 3px rgba(26,82,118,0.05)',
    '0 4px 16px rgba(26,82,118,0.10), 0 2px 6px rgba(26,82,118,0.06)',
    '0 6px 24px rgba(26,82,118,0.12), 0 3px 8px rgba(26,82,118,0.07)',
    '0 8px 32px rgba(26,82,118,0.14)',
    '0 10px 40px rgba(26,82,118,0.16)',
    '0 12px 48px rgba(26,82,118,0.18)',
    '0 14px 56px rgba(26,82,118,0.20)',
    '0 16px 64px rgba(26,82,118,0.22)',
    '0 18px 72px rgba(26,82,118,0.24)',
    '0 20px 80px rgba(26,82,118,0.26)',
    '0 22px 88px rgba(26,82,118,0.28)',
    '0 24px 96px rgba(26,82,118,0.30)',
    '0 26px 104px rgba(26,82,118,0.32)',
    '0 28px 112px rgba(26,82,118,0.34)',
    '0 30px 120px rgba(26,82,118,0.36)',
    '0 32px 128px rgba(26,82,118,0.38)',
    '0 34px 136px rgba(26,82,118,0.40)',
    '0 36px 144px rgba(26,82,118,0.42)',
    '0 38px 152px rgba(26,82,118,0.44)',
    '0 40px 160px rgba(26,82,118,0.46)',
    '0 42px 168px rgba(26,82,118,0.48)',
    '0 44px 176px rgba(26,82,118,0.50)',
    '0 46px 184px rgba(26,82,118,0.52)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          backgroundColor: '#f0f4f8',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(26,82,118,0.08)',
          boxShadow: '0 2px 8px rgba(26,82,118,0.06)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          padding: '10px 20px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1f6f99 0%, #1a5276 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #2471a3 0%, #1f6f99 100%)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 11 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            fontFamily: "'DM Sans', sans-serif",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #154360 0%, #1a5276 60%, #1f6f99 100%)',
          boxShadow: '0 2px 20px rgba(21,67,96,0.3)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 64,
          borderTop: '1px solid rgba(26,82,118,0.08)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: 11,
          '&.Mui-selected': { color: '#1a5276' },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 999, backgroundColor: alpha('#1a5276', 0.1) },
        bar: { borderRadius: 999 },
      },
    },
  },
});
