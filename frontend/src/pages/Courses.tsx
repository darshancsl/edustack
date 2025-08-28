import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  TextField,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  useMediaQuery,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useTheme } from '@mui/material/styles';
import NavBar from '../components/NavBar';
import { listCourses, Course } from '../api/courses';
import { Link as RouterLink } from 'react-router-dom';

type Category = 'category-1' | 'category-2' | 'category-3' | '';
type SortBy = 'updatedAt' | 'category' | 'price';
type Order = 'asc' | 'desc';

export default function CoursesCatalog() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [items, setItems] = React.useState<Course[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [q, setQ] = React.useState('');
  const [category, setCategory] = React.useState<Category>('');
  const [sortBy, setSortBy] = React.useState<SortBy>('updatedAt');
  const [order, setOrder] = React.useState<Order>('desc');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCourses({
        q: q || undefined,
        category: (category || undefined) as any,
        sortBy,
        order,
        page: 1,
        limit: 30,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (e: any) {
      setError(e?.response?.data?.msg || e.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initial

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchData();
  };

  const clearFilters = () => {
    setQ('');
    setCategory('');
    setSortBy('updatedAt');
    setOrder('desc');
    fetchData();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: (t) => t.palette.background.default,
        color: (t) => t.palette.text.primary,
      }}
    >
      <NavBar />

      <Container sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
          Courses & Certifications
        </Typography>

        <Grid container spacing={3} alignItems="flex-start">
          {/* Left: Filters */}
          <Grid item xs={12} md={3}>
            <Box
              component="form"
              onSubmit={applyFilters}
              sx={{
                position: isMdUp ? 'sticky' : 'static',
                top: isMdUp ? 24 : 'auto',
                p: 2,
                mt: 5,
                bgcolor: (t) => t.palette.surface.elevated,
                border: (t) => `1px solid ${t.palette.surface.border}`,
                borderRadius: 0.5,
              }}
            >
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                Filters
              </Typography>

              <TextField
                size="small"
                placeholder="Search courses…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                fullWidth
              />

              <Divider sx={{ my: 2 }} />

              <FormControl fullWidth size="small">
                <InputLabel id="cat-label">Category</InputLabel>
                <Select
                  labelId="cat-label"
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="category-1">Category 1</MenuItem>
                  <MenuItem value="category-2">Category 2</MenuItem>
                  <MenuItem value="category-3">Category 3</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ my: 2 }} />

              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel id="sortby-label">Sort by</InputLabel>
                <Select
                  labelId="sortby-label"
                  label="Sort by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                >
                  <MenuItem value="updatedAt">Date uploaded</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                </Select>
              </FormControl>

              <ToggleButtonGroup
                value={order}
                exclusive
                fullWidth
                size="small"
                onChange={(_e, val) => val && setOrder(val)}
                sx={{ mt: 1 }}
              >
                <ToggleButton value="asc">Asc</ToggleButton>
                <ToggleButton value="desc">Desc</ToggleButton>
              </ToggleButtonGroup>

              <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Apply
                </Button>
                <Button variant="outlined" fullWidth onClick={clearFilters}>
                  Clear
                </Button>
              </Stack>
            </Box>
          </Grid>

          {/* Right: Results */}
          <Grid item xs={12} md={9}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{ mb: 2 }}
              spacing={1}
            >
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                {loading ? 'Loading…' : `${total} result${total === 1 ? '' : 's'}`}
              </Typography>
            </Stack>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Grid container spacing={2}>
              {items.map((c) => (
                <Grid key={c.slug} item xs={12} sm={6} lg={4}>
                  <Card
                    sx={{
                      bgcolor: (t) => t.palette.surface.elevated,
                      border: (t) => `1px solid ${t.palette.surface.border}`,
                      borderRadius: 0.5,
                    }}
                  >
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
                          <Typography variant="body2" color="text.secondary">
                            {c.subtitle}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          ₹{c.salePrice ?? c.price}
                          {c.salePrice != null && (
                            <Box
                              component="span"
                              sx={{ ml: 1, opacity: 0.7, textDecoration: 'line-through' }}
                            >
                              ₹{c.price}
                            </Box>
                          )}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {!loading && items.length === 0 && !error && (
              <Typography sx={{ mt: 3, opacity: 0.8 }}>
                No courses found. Try adjusting filters.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
