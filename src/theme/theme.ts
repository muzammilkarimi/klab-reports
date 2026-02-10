import { createTheme, alpha } from '@mui/material/styles';

// Color Palette
const PRIMARY_BLUE = '#1F3A5F';
const ACCENT_GREEN = '#00A859';
const ACCENT_AMBER = '#FFAB00';
const ACCENT_RED = '#D32F2F';
const BG_OFF_WHITE = '#F7F9FC';
const TEXT_DARK = '#2D3748';
const TEXT_SECONDARY = '#718096';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: PRIMARY_BLUE,
      light: alpha(PRIMARY_BLUE, 0.8),
      dark: '#162B47',
    },
    secondary: {
      main: ACCENT_GREEN,
    },
    error: {
      main: ACCENT_RED,
    },
    warning: {
      main: ACCENT_AMBER,
    },
    success: {
      main: ACCENT_GREEN,
    },
    background: {
      default: BG_OFF_WHITE,
      paper: '#FFFFFF',
    },
    text: {
      primary: TEXT_DARK,
      secondary: TEXT_SECONDARY,
    },
  },
  typography: {
    fontFamily: '"Spline Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem', color: PRIMARY_BLUE },
    h2: { fontWeight: 700, fontSize: '2rem', color: PRIMARY_BLUE },
    h3: { fontWeight: 600, fontSize: '1.75rem', color: PRIMARY_BLUE },
    h4: { fontWeight: 600, fontSize: '1.5rem', color: PRIMARY_BLUE },
    h5: { fontWeight: 600, fontSize: '1.25rem', color: PRIMARY_BLUE },
    h6: { fontWeight: 600, fontSize: '1rem', color: PRIMARY_BLUE },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '10px 24px',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(31, 58, 95, 0.15)',
          },
        },
        contained: {
          color: '#fff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
        },
        rounded: {
            borderRadius: 16
        }
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
          backgroundColor: '#fff',
          color: PRIMARY_BLUE,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          backgroundColor: '#fff',
          boxShadow: '2px 0px 20px rgba(0, 0, 0, 0.02)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#F7F9FC',
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&:hover fieldset': {
              borderColor: alpha(PRIMARY_BLUE, 0.2),
            },
            '&.Mui-focused fieldset': {
              borderColor: PRIMARY_BLUE,
            },
          },
        },
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

export default theme;
