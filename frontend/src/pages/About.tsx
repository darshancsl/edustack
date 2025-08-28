import * as React from 'react';
import { Box, Typography } from '@mui/material';
import NavBar from '../components/NavBar';

export default function About() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0b0b12' }}>
      <NavBar />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
        <Typography variant="h4" color="white" fontWeight={800}>
          About Us
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.75)" sx={{ mt: 2 }}>
          This is a placeholder for the About Us page. Share information about your mission, values,
          and the team behind EduStack here.
        </Typography>
      </Box>
    </Box>
  );
}
