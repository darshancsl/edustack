import * as React from 'react';
import { Box, Container, Typography, Card, CardActionArea, Stack, Button } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Link as RouterLink } from 'react-router-dom';
import { Course, listCourses } from '../api/courses';
import { useTheme, alpha } from '@mui/material/styles';

export default function CoursesTeaser() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const theme = useTheme();
  React.useEffect(() => {
    (async () => {
      const res = await listCourses({ limit: 3 });
      setCourses(res.items);
    })();
  }, []);

  return (
    <Box
      component="section"
      sx={{ bgcolor: theme.palette.background.default, color: theme.palette.text.primary }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
          Upcoming Courses
        </Typography>
      </Container>
      <Grid container spacing={0} sx={{ minHeight: { xs: 540, md: 420 } }}>
        {courses.map((c) => (
          <Grid key={c.slug} item xs={12} md={4}>
            <Card
              square
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 0,
                border: 'none',
                position: 'relative',
                bgcolor: theme.palette.background.default,
              }}
            >
              <CardActionArea
                component={RouterLink}
                to={`/courses/${c.slug}`}
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover .desc, &:focus-visible .desc': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${c.heroImage || '/media/course-1.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.6)',
                  }}
                />
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(90deg, ${alpha('#000', 0.55)} 0%, ${alpha('#000', 0.25)} 45%, ${alpha('#000', 0.05)} 100%)`,
                  }}
                />
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    p: { xs: 3, md: 4 },
                  }}
                >
                  <Box sx={{ maxWidth: 420 }}>
                    <Typography variant="h5" fontWeight={800} sx={{ whiteSpace: 'pre-line' }}>
                      {c.title}
                    </Typography>
                    {c.subtitle && (
                      <Typography
                        className="desc"
                        variant="body2"
                        sx={{
                          mt: 1,
                          color: theme.palette.text.secondary,
                          opacity: 0,
                          transform: 'translateY(10px)',
                          transition: 'opacity .35s ease, transform .35s ease',
                        }}
                      >
                        {c.subtitle}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
          We Believe in Safety for Everyone
        </Typography>
        <Stack direction="row" justifyContent="center">
          <Button
            component={RouterLink}
            to="/courses"
            variant="outlined"
            sx={{
              px: 3,
              py: 1,
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.secondary.main,
              border: 'none',
              borderRadius: 0.5,
              '&:hover': { borderColor: theme.palette.primaryHover.main },
            }}
          >
            View Our Courses
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
