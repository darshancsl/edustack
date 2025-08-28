import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// --- Design tokens you’ll tweak when “re-skinning” ---
const tokens = {
  mode: 'dark' as const,

  // Core colors
  primary: '#00a1ff',
  secondary: '#ef4136',
  primaryHover: '#006ec6',
  secondaryHover: '#AE0008',

  // Backgrounds
  bg: '#000000',
  paper: '#111111',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#efefef',

  // Borders / dividers
  divider: '#dcdcdc',
  softBorder: '#111111',

  // Gradients
  gradientPrimary: 'linear-gradient(90deg, #2d388a 0%, #00aeef 100%)',

  // Radii
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
};

// --- Optional: module augmentation so TS knows our custom palette fields ---
declare module '@mui/material/styles' {
  interface Palette {
    gradient: {
      primary: string;
    };
    surface: {
      sunken: string; // deepest bg
      elevated: string; // cards
      border: string; // soft borders
    };
  }
  interface PaletteOptions {
    gradient?: { primary?: string };
    surface?: { sunken?: string; elevated?: string; border?: string };
  }
}

const baseTheme: ThemeOptions = {
  palette: {
    mode: tokens.mode,
    primary: { main: tokens.primary },
    secondary: { main: tokens.secondary },
    primaryHover: { main: tokens.primaryHover },
    secondaryHover: { main: tokens.secondaryHover },
    background: {
      default: tokens.bg,
      paper: tokens.paper,
    },
    text: {
      primary: tokens.textPrimary,
      secondary: tokens.textSecondary,
    },
    divider: tokens.divider,
    // custom buckets
    gradient: { primary: tokens.gradientPrimary },
    surface: {
      sunken: tokens.bg,
      elevated: tokens.paper,
      border: tokens.softBorder,
    },
  },
  shape: {
    borderRadius: tokens.radiusMd,
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
    h1: { fontWeight: 900 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (themeParam) => ({
        body: { backgroundColor: themeParam.palette.background.default },
        '*::-webkit-scrollbar-thumb': {
          background: alpha('#fff', 0.2),
          borderRadius: 8,
        },
      }),
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: tokens.radiusSm },
      },
      variants: [
        // handy gradient button you can reuse
        {
          props: { variant: 'contained', color: 'primary' },
          style: { background: tokens.gradientPrimary },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radiusLg,
          backgroundColor: tokens.paper,
          border: `1px solid ${tokens.softBorder}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
};

export const theme = createTheme(baseTheme);
