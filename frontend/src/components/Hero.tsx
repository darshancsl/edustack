import * as React from 'react';
import { Box, Container, Stack, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';

// If you placed the image in src/assets:
// import heroImg from "../assets/hero.jpg";

type Props = {
  imageUrl?: string; // optional override
};

export default function Hero({ imageUrl }: Props) {
  // Default: public folder path (no bundler import)
  const bg =
    'https://static.wixstatic.com/media/86cb94_6ab1580969514b4b93088e479756c31e~mv2_d_5120_3413_s_4_2.jpg/v1/fill/w_1418,h_660,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/86cb94_6ab1580969514b4b93088e479756c31e~mv2_d_5120_3413_s_4_2.jpg'; // or use: heroImg
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        height: { xs: 520, md: 640 },
        color: 'white',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Background image */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: 'scale(1.02)', // subtle zoom to avoid edges on resize
          filter: 'brightness(0.4)', // darken for text contrast
        }}
      />

      {/* Gradient overlay (adds depth; optional) */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${alpha('#000', 0.35)} 0%, ${alpha('#000', 0.55)} 60%, ${alpha('#000', 0.65)} 100%)`,
        }}
      />

      {/* Foreground content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={2} sx={{ maxWidth: 900 }}>
          <Typography
            variant="h2"
            fontWeight={900}
            lineHeight={1.1}
            sx={{ fontSize: { xs: 36, sm: 44, md: 56 } }}
          >
            YOU CAN CREATE
            <br />
            <Box component="span" sx={{ display: 'block' }}>
              YOUR OWN WEBSITE
            </Box>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              maxWidth: 760,
              fontWeight: 400,
            }}
          >
            The concept behind the creation of most multipurpose themes is to produce a single
            website template that would suit any type of company.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ pt: 1, flexWrap: 'wrap' }}>
            <Button
              component={RouterLink}
              to="/about"
              size="large"
              variant="contained"
              sx={{
                px: 3.5,
                py: 1.2,
                borderRadius: 0.5,
                textTransform: 'none',
                fontWeight: 700,
                background: theme.palette.primary.main,
                color: theme.palette.text.primary,
                '&:hover': {
                  background: theme.palette.primaryHover.main,
                },
              }}
            >
              Know more
            </Button>
            <Button
              component={RouterLink}
              to="/courses"
              size="large"
              variant="outlined"
              sx={{
                px: 3.5,
                py: 1.2,
                borderRadius: 0.5,
                textTransform: 'none',
                fontWeight: 700,
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                '&:hover': { borderColor: theme.palette.text.primary },
              }}
            >
              Certifications & Courses
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
