import * as React from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  Stack,
} from '@mui/material';
import NavBar from '../components/NavBar';
import { listCourses, Course } from '../api/courses';
import { Link as RouterLink } from 'react-router-dom';

export default function CoursesIndex() {
  const [items, setItems] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');

  const fetchData = async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCourses({ q: query, limit: 30 });
      setItems(res.items);
    } catch (e: any) {
      setError(e?.response?.data?.msg || e.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0b0b12', color: 'white' }}>
      <NavBar />
      <Container sx={{ py: 6 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
        >
          <Typography variant="h4" fontWeight={900}>
            Courses & Certifications
          </Typography>
          <TextField
            size="small"
            placeholder="Search courses…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData(q)}
            sx={{ minWidth: 260 }}
          />
        </Stack>

        {loading && (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {items.map((c) => (
              <Grid key={c.slug} item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.04)' }}>
                  <CardActionArea component={RouterLink} to={`/courses/${c.slug}`}>
                    <Box
                      sx={{
                        height: 160,
                        backgroundImage: `url(${c.heroImage || '/media/course-1.jpg'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <CardContent>
                      <Typography fontWeight={800}>{c.title}</Typography>
                      {c.subtitle && (
                        <Typography variant="body2" color="rgba(255,255,255,0.75)">
                          {c.subtitle}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
