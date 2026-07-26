import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1000,  // Custom breakpoint ở 1000px
      xl: 1200,
    },
  },
  palette: {
    primary: {
      main: '#667eea', // Purple gradient start
      light: '#8b9aff',
      dark: '#5568d3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2', // Purple gradient end
      light: '#9568c4',
      dark: '#5e3c82',
      contrastText: '#ffffff',
    },
    tertiary: {
      main: '#f5f7fa',
      light: '#ffffff',
      dark: '#e1e4e8',
      contrastText: '#1a202c',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.95rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Extend theme với tertiary color - Facebook Gray
theme.palette.tertiary = theme.palette.augmentColor({
  color: {
    main: '#E4E6EB', // Facebook Gray
    light: '#F0F2F5',
    dark: '#BCC0C4',
  },
  name: 'tertiary',
});

// Extend theme với sidebar colors - Purple gradient
theme.palette.sidebar = {
  main: '#667eea',
  dark: '#5568d3',
  gradient: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
  shadow: 'rgba(102, 126, 234, 0.15)',
};

// Extend theme với form section colors - Purple gradient
theme.palette.formSections = {
  interests: {
    background: 'rgba(102, 126, 234, 0.05)',
    shadow: 'rgba(102, 126, 234, 0.1)',
    shadowHover: 'rgba(102, 126, 234, 0.15)',
  },
  habits: {
    background: 'rgba(118, 75, 162, 0.05)',
    shadow: 'rgba(118, 75, 162, 0.1)',
    shadowHover: 'rgba(118, 75, 162, 0.15)',
  },
  dislikes: {
    background: 'rgba(139, 154, 255, 0.05)',
    shadow: 'rgba(139, 154, 255, 0.1)',
    shadowHover: 'rgba(139, 154, 255, 0.15)',
  },
};

export default theme;