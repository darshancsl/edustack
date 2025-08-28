import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  listCourses,
  Course,
  deleteCourse as apiDelete,
  duplicateCourse as apiDuplicate,
} from '../../api/courses';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';

export default function AdminCoursesList() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [q, setQ] = React.useState('');
  const [items, setItems] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingSlug, setPendingSlug] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const fetchData = async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCourses({ q: query, limit: 50 });
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

  const onDuplicate = async (slug: string) => {
    try {
      const res = await apiDuplicate(slug);
      setToast(res.msg);
      // After duplicate, navigate to edit the new one
      navigate(`/admin/courses/${res.slug}/edit`);
    } catch (e: any) {
      setError(e?.response?.data?.msg || e.message);
    }
  };

  const onConfirmDelete = (slug: string) => {
    setPendingSlug(slug);
    setConfirmOpen(true);
  };

  const onDelete = async () => {
    if (!pendingSlug) return;
    try {
      await apiDelete(pendingSlug);
      setToast('Course deleted');
      setConfirmOpen(false);
      setPendingSlug(null);
      // refresh list
      fetchData(q);
    } catch (e: any) {
      setError(e?.response?.data?.msg || e.message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, color: 'white' }}>
      <NavBar />
      <Container sx={{ py: 6 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Typography variant="h4" fontWeight={900}>
            Admin - Courses
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData(q)}
              sx={{ minWidth: 260 }}
            />
            <Button
              variant="contained"
              onClick={() => fetchData(q)}
              sx={{
                background: theme.palette.primary.main,
                color: theme.palette.text.primary,
                '&:hover': {
                  background: theme.palette.primaryHover.main,
                },
                borderRadius: 0.5,
              }}
            >
              Search
            </Button>
            <Button
              component={RouterLink}
              to="/admin/courses/new"
              variant="outlined"
              sx={{
                color: theme.palette.text.primary,
                '&:hover': {
                  background: theme.palette.primaryHover.main,
                },
                border: (t) => `1px solid ${t.palette.surface.border}`,
                backgroundColor: theme.palette.background.default,
                borderRadius: 0.5,
              }}
            >
              New Course
            </Button>
          </Stack>
        </Stack>

        {loading && <Typography sx={{ mt: 3 }}>Loading…</Typography>}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {toast && (
          <Alert onClose={() => setToast(null)} severity="success" sx={{ mt: 2 }}>
            {toast}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {items.map((c) => (
            <Grid key={c.slug} item xs={12} md={6} lg={4}>
              <Card sx={{ bgcolor: theme.palette.surface.elevated, borderRadius: 1 }}>
                <Box
                  sx={{
                    height: 140,
                    backgroundImage: `url(${c.heroImage || '/media/course-1.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <CardContent>
                  <Typography fontWeight={800}>{c.title}</Typography>
                  {c.subtitle && (
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {c.subtitle}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Price: ₹{c.salePrice ?? c.price}{' '}
                    {c.salePrice && <s style={{ opacity: 0.6, marginLeft: 6 }}>₹{c.price}</s>}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={RouterLink}
                    to={`/courses/${c.slug}`}
                    size="small"
                    sx={{
                      color: theme.palette.text.primary,
                      border: (t) => `1px solid ${t.palette.surface.border}`,
                      borderRadius: 0,
                    }}
                  >
                    View
                  </Button>
                  <Button
                    component={RouterLink}
                    to={`/admin/courses/${c.slug}/edit`}
                    size="small"
                    variant="outlined"
                    sx={{
                      color: theme.palette.text.primary,
                      border: (t) => `1px solid ${t.palette.surface.border}`,
                      borderRadius: 0,
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    onClick={() => onDuplicate(c.slug)}
                    sx={{
                      color: theme.palette.text.primary,
                      border: (t) => `1px solid ${t.palette.surface.border}`,
                      borderRadius: 0,
                    }}
                  >
                    Duplicate
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onConfirmDelete(c.slug)}
                    sx={{
                      border: (t) => `1px solid ${t.palette.surface.border}`,
                      borderRadius: 0,
                    }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete course?</DialogTitle>
        <DialogContent>
          This action cannot be undone. The course will be permanently removed.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={onDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
