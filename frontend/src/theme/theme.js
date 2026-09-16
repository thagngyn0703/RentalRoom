import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1000, xl: 1200 } },
  palette: {
    primary: { main: '#087f72', light: '#37a795', dark: '#075b51', contrastText: '#fff' },
    secondary: { main: '#b76536', light: '#efbd96', dark: '#824723', contrastText: '#fff' },
    background: { default: '#f6f8f5', paper: '#ffffff' },
    text: { primary: '#193b34', secondary: '#64756f' },
    divider: '#e1e9e3',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.12 },
    h2: { fontWeight: 800, letterSpacing: '-0.035em' },
    h3: { fontWeight: 750, letterSpacing: '-0.03em' },
    h4: { fontSize: '1.65rem', fontWeight: 750, letterSpacing: '-0.025em' },
    h5: { fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontSize: '1.1rem', fontWeight: 700 },
    body1: { fontSize: '0.95rem', lineHeight: 1.7 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 650 },
  },
  components: {
    MuiCssBaseline: { styleOverrides: {
      body: { backgroundColor: '#f6f8f5' },
      '::selection': { background: '#c6eadc', color: '#193b34' },
      ':focus-visible': { outline: '3px solid #b76536', outlineOffset: 3 },
    } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: {
      root: { borderRadius: 12, padding: '10px 20px', transition: 'background-color .18s, box-shadow .18s' },
      outlined: { borderColor: '#cbded5' },
    } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' }, rounded: { borderRadius: 16 }, elevation1: { boxShadow: '0 4px 20px rgba(25,59,52,.045)' } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #e1e9e3', boxShadow: '0 6px 24px rgba(25,59,52,.04)' } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12, background: '#fff' }, notchedOutline: { borderColor: '#d6e1da' } } },
    MuiInputLabel: { styleOverrides: { root: { color: '#64756f' } } },
    MuiTableCell: { styleOverrides: {
      root: { borderBottom: '1px solid #edf1ed', padding: '16px', fontSize: '.875rem' },
      head: { background: '#eff5f0', color: '#52665d', fontWeight: 700, whiteSpace: 'nowrap' },
    } },
    MuiTableRow: { styleOverrides: { root: { '&.MuiTableRow-hover:hover': { background: '#f5faf7' } } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20, boxShadow: '0 24px 80px rgba(16,48,39,.18)' } } },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 750, padding: '24px 24px 16px' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 650, minHeight: 52 } } },
    MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: 3 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: '#193b34', borderRadius: 8, fontSize: '.8rem' } } },
    MuiDrawer: { styleOverrides: { paper: { borderRadius: 0, boxShadow: 'none' } } },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: 10, '&.Mui-selected': { backgroundColor: '#e2f2e9', color: '#075b51' } } } },
  },
});

theme.palette.tertiary = theme.palette.augmentColor({
  color: { main: '#e1e9e3', light: '#f3f6f2', dark: '#adbdb3' }, name: 'tertiary',
});
theme.palette.sidebar = {
  main: '#087f72', dark: '#075b51',
  gradient: 'linear-gradient(160deg, #087f72 0%, #193b34 100%)',
  shadow: 'rgba(25,59,52,.08)',
};
theme.palette.formSections = Object.fromEntries(
  ['interests', 'habits', 'dislikes'].map(key => [key, {
    background: '#f6faf7', shadow: 'rgba(25,59,52,.04)', shadowHover: 'rgba(25,59,52,.08)',
  }])
);
export default theme;
