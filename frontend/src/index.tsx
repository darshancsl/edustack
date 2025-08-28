import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* applies background + resets */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
