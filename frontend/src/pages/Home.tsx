import * as React from 'react';
import { Box } from '@mui/material';
import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import CoursesTeaser from '../components/CoursesTeaser';

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>
      <NavBar />
      <Hero imageUrl="/media/hero.jpg" />
      <CoursesTeaser />
      {/* next sections will follow here: Testimonials, Courses teaser, About teaser, Contact, ... */}
    </Box>
  );
}
