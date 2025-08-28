import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getCourseBySlug } from '../data/courses';
import NavBar from '../components/NavBar';
import { getCourse } from '../api/courses';
import { hasEnrollment } from '../api/enrollments';

export default function CourseDetail() {
  const theme = useTheme();
  const { slug = '' } = useParams();
  const [course, setCourse] = React.useState<ReturnType<typeof Object> | any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [owned, setOwned] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      try { setOwned(await hasEnrollment(slug)); } catch { }
    })();
  }, [slug]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCourse(slug);
        setCourse(data);
      } catch (e: any) {
        setError(e?.response?.data?.msg || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0b0b12', color: 'white' }}>
        <NavBar />
        <Container sx={{ py: 8 }}>
          <Typography>Loading…</Typography>
        </Container>
      </Box>
    );
  }
  if (error || !course) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0b0b12', color: 'white' }}>
        <NavBar />
        <Container sx={{ py: 8 }}>
          <Typography variant="h4" fontWeight={800}>
            Course not found
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
          <Button component={RouterLink} to="/courses" sx={{ mt: 2 }} variant="contained">
            Back to Courses
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <NavBar />

      {/* Hero header */}
      <Box
        sx={{
          backgroundImage: `url(${course.heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4)',
          position: 'relative',
        }}
      >
        <Box sx={{ backdropFilter: 'brightness(0.75)' }}>
          <Container sx={{ py: { xs: 6, md: 8 } }}>
            <Typography variant="h3" fontWeight={900} sx={{ color: theme.palette.text.primary }}>
              {course.title}
            </Typography>
            {course.subtitle && (
              <Typography variant="h6" color={theme.palette.text.secondary} sx={{ mt: 1 }}>
                {course.subtitle}
              </Typography>
            )}
            <Stack direction="row" spacing={1.5} sx={{ mt: 2, flexWrap: 'wrap' }}>
              {course.level && <Chip label={course.level} />}
              {course.language && <Chip label={course.language} />}
              {course.lastUpdated && <Chip label={`Updated ${course.lastUpdated}`} />}
            </Stack>
          </Container>
        </Box>
      </Box>

      {/* Main content */}
      <Container sx={{ py: { xs: 4, md: 8 } }}>
        <Grid container spacing={3} alignItems="flex-start" justifyContent="space-between">
          {/* Left: description + learn + TOC */}
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                bgcolor: (t) => t.palette.surface.elevated,
                border: (t) => `1px solid ${t.palette.surface.border}`,
                borderRadius: 0.5,
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ color: theme.palette.text.primary }}
                >
                  What you’ll learn
                </Typography>
                <List dense sx={{ listStyleType: 'disc', pl: 3, pt: 1 }}>
                  {course.whatYouWillLearn.map((li: any) => (
                    <ListItem key={li} sx={{ display: 'list-item' }}>
                      <ListItemText primary={li} />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h5" fontWeight={800}>
                  Description
                </Typography>
                <Typography sx={{ mt: 1.5, color: theme.palette.text.primary }}>
                  {course.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h5" fontWeight={800}>
                  Course content
                </Typography>
                <Stack sx={{ mt: 1.5 }} spacing={1.5}>
                  {course.toc.map((section: any) => (
                    <Card
                      key={section.id}
                      sx={{
                        bgcolor: (t) => t.palette.surface.elevated,
                        border: (t) => `1px solid ${t.palette.surface.border}`,
                        borderRadius: 0.5,
                      }}
                    >
                      <CardContent>
                        <Typography fontWeight={700}>{section.title}</Typography>
                        <List dense>
                          {section.items.map((l: any) => (
                            <ListItem key={l.id} disableGutters>
                              <ListItemText
                                primary={l.title}
                                secondary={l.duration ? `${l.duration}` : undefined}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right: sticky purchase card */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 0.5 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={900}>
                    Buy this course
                  </Typography>

                  <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
                    {course.salePrice ? (
                      <>
                        <Typography variant="h4" fontWeight={900}>
                          ₹{course.salePrice.toFixed(2)}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ textDecoration: 'line-through', opacity: 0.7 }}
                        >
                          ₹{course.price.toFixed(2)}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="h4" fontWeight={900}>
                        ₹{course.price.toFixed(2)}
                      </Typography>
                    )}
                  </Stack>

                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Typography variant="body2">• {course.accessPeriod === 'lifetime'
                      ? 'Lifetime access'
                      : course.accessPeriod === '30d' ? '30 days access'
                        : course.accessPeriod === '90d' ? '90 days access'
                          : course.accessPeriod === '180d' ? '180 days access'
                            : course.accessPeriod === '365d' ? '365 days access'
                              : 'Course access included'}
                    </Typography>
                    <Typography variant="body2">• Certificate of completion</Typography>
                    <Typography variant="body2">• Self‑paced, on demand</Typography>
                  </Stack>

                  {
                    owned ? (
                      <Button component={RouterLink} to={`/courses/${course.slug}`} variant="contained" fullWidth sx={{ mt: 2 }}>
                        Continue learning
                      </Button>
                    ) : (
                      <Button component={RouterLink} to={`/checkout?course=${course.slug}`} variant="contained" fullWidth sx={{ mt: 2 }}>
                        Buy Now
                      </Button>
                    )
                  }

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 1,
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
                    Add to Cart
                  </Button>

                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={2}>
                    <Button
                      component={RouterLink}
                      to="/courses"
                      size="small"
                      variant="text"
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
                      Back to Courses
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/contact"
                      size="small"
                      variant="text"
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
                      Need help?
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
