import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  MenuItem,
  Alert,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import { createCourse, getCourse, updateCourse, Course } from '../../api/courses';

// helper to slugify a title
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

type Props = { mode: 'create' | 'edit' };

export default function AdminCourseForm({ mode }: Props) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { slug: routeSlug } = useParams();

  const [payload, setPayload] = React.useState<Partial<Course>>({
    slug: '',
    title: '',
    subtitle: '',
    heroImage: '',
    price: 0,
    salePrice: undefined,
    level: 'Beginner',
    language: 'English',
    lastUpdated: new Date().toISOString().slice(0, 10),
    description: '',
    whatYouWillLearn: [],
    category: "category-1",
    accessPeriod: "lifetime",
    toc: [],
  });

  const [tocJson, setTocJson] = React.useState('[]');
  const [learnText, setLearnText] = React.useState('');
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // load existing for edit
  React.useEffect(() => {
    (async () => {
      if (mode === 'edit' && routeSlug) {
        try {
          const data = await getCourse(routeSlug);
          setPayload({
            ...data,
            lastUpdated: (data.lastUpdated || '').slice(0, 10),
          });
          setLearnText((data.whatYouWillLearn || []).join('\n'));
          setTocJson(JSON.stringify(data.toc || [], null, 2));
        } catch (e: any) {
          setErr(e?.response?.data?.msg || e.message);
        }
      }
    })();
  }, [mode, routeSlug]);

  // auto-slug from title if creating / empty slug
  React.useEffect(() => {
    if (mode === 'create' && (payload.slug || '') === '' && payload.title) {
      setPayload((p) => ({ ...p, slug: slugify(p.title || '') }));
    }
  }, [mode, payload.title]);

  const onChange = (k: keyof Course) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setPayload((p) => ({ ...p, [k]: v }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);

    // basic client validation (server is source-of-truth)
    if (!payload.title || !payload.slug || !payload.description) {
      setErr('Title, slug, and description are required.');
      return;
    }
    const price = Number(payload.price);
    const sale = payload.salePrice != null ? Number(payload.salePrice) : undefined;
    if (Number.isNaN(price) || price < 0) return setErr('Price must be a non-negative number.');
    if (sale != null && (Number.isNaN(sale) || sale >= price))
      return setErr('Sale price must be less than price.');

    // parse learn/toc
    let parsedTOC: any[] = [];
    try {
      parsedTOC = JSON.parse(tocJson || '[]');
    } catch {
      return setErr('TOC JSON is invalid.');
    }

    const learn = (learnText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const body: Partial<Course> = {
      ...payload,
      price,
      salePrice: sale,
      whatYouWillLearn: learn,
      toc: parsedTOC as any,
      // cast date input (yyyy-mm-dd) to ISO
      lastUpdated: payload.lastUpdated ? new Date(payload.lastUpdated).toISOString() : undefined,
    };

    setLoading(true);
    try {
      if (mode === 'create') {
        const res = await createCourse(body);
        setOk(res.msg);
        // go to edit page for further tweaks
        navigate(`/admin/courses/${res.slug}/edit`, { replace: true });
      } else {
        const slug = routeSlug!;
        const res = await updateCourse(slug, body);
        setOk(res.msg);
      }
    } catch (e: any) {
      setErr(e?.response?.data?.details?.join('\n') || e?.response?.data?.msg || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0b0b12', color: 'white' }}>
      <NavBar />
      <Container sx={{ py: 6 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={900}>
            {mode === 'create' ? 'New Course' : `Edit · ${payload.title || routeSlug}`}
          </Typography>
          <Button variant="text" onClick={() => navigate('/admin/courses')}>
            Back to list
          </Button>
        </Stack>

        <Grid container spacing={2} sx={{ mt: 2 }} component="form" onSubmit={onSubmit}>
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {err && <Alert severity="error">{err}</Alert>}
              {ok && <Alert severity="success">{ok}</Alert>}

              <TextField
                label="Title"
                value={payload.title || ''}
                onChange={onChange('title')}
                required
              />
              <TextField
                label="Slug"
                value={payload.slug || ''}
                onChange={(e) => setPayload((p) => ({ ...p, slug: slugify(e.target.value) }))}
                helperText="URL-safe, lowercase, hyphen-separated"
                required
              />
              <TextField
                label="Subtitle"
                value={payload.subtitle || ''}
                onChange={onChange('subtitle')}
              />
              <TextField
                label="Hero image URL"
                value={payload.heroImage || ''}
                onChange={onChange('heroImage')}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Price"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={payload.price ?? 0}
                  onChange={onChange('price')}
                  required
                />
                <TextField
                  label="Sale price"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={payload.salePrice ?? ''}
                  onChange={onChange('salePrice' as any)}
                />
                <TextField
                  select
                  label="Level"
                  value={payload.level || 'Beginner'}
                  onChange={onChange('level' as any)}
                >
                  {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                    <MenuItem key={l} value={l}>
                      {l}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Language"
                  value={payload.language || 'English'}
                  onChange={onChange('language' as any)}
                />
                <TextField
                  select
                  label="Category"
                  value={payload.category || "category-1"}
                  onChange={(e) => setPayload(p => ({ ...p, category: e.target.value as any }))}
                >
                  <MenuItem value="category-1">Category 1</MenuItem>
                  <MenuItem value="category-2">Category 2</MenuItem>
                  <MenuItem value="category-3">Category 3</MenuItem>
                </TextField>

                {/* ✅ Access Period */}
                <TextField
                  select
                  label="Access period"
                  value={payload.accessPeriod || "lifetime"}
                  onChange={(e) => setPayload(p => ({ ...p, accessPeriod: e.target.value as any }))}
                  helperText="How long students keep access after purchase"
                >
                  <MenuItem value="lifetime">Lifetime access</MenuItem>
                  <MenuItem value="30d">30 days</MenuItem>
                  <MenuItem value="90d">90 days</MenuItem>
                  <MenuItem value="180d">180 days</MenuItem>
                  <MenuItem value="365d">365 days</MenuItem>
                </TextField>
              </Stack>
              <TextField
                label="Last updated"
                type="date"
                value={(payload.lastUpdated || '').slice(0, 10)}
                onChange={onChange('lastUpdated' as any)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Description"
                value={payload.description || ''}
                onChange={onChange('description')}
                multiline
                minRows={4}
                required
              />
              <TextField
                label="What you’ll learn (one per line)"
                value={learnText}
                onChange={(e) => setLearnText(e.target.value)}
                multiline
                minRows={4}
              />
              <TextField
                label="TOC JSON (sections/items)"
                value={tocJson}
                onChange={(e) => setTocJson(e.target.value)}
                multiline
                minRows={8}
                helperText="Example: [{ id:'s1', title:'Section', items:[{id:'l1', title:'Lesson', duration:'10m'}]}]"
              />

              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    background: theme.palette.secondary.main,
                    color: theme.palette.text.primary,
                  }}
                >
                  {mode === 'create' ? 'Create Course' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/courses')}
                  sx={{ color: theme.palette.text.primary }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Grid>

          {/* Preview card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
              <Box
                sx={{
                  height: 140,
                  backgroundImage: `url(${payload.heroImage || '/media/course-1.jpg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <CardContent>
                <Typography fontWeight={800}>{payload.title || 'Preview title'}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {(() => {
                    const p = payload.accessPeriod || "lifetime";
                    const label =
                      p === "lifetime" ? "Lifetime access" :
                        p === "30d" ? "30 days access" :
                          p === "90d" ? "90 days access" :
                            p === "180d" ? "180 days access" :
                              p === "365d" ? "365 days access" : p;
                    return label;
                  })()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {payload.subtitle || 'Subtitle…'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  ${payload.salePrice ?? payload.price ?? 0}
                  {payload.salePrice != null && (
                    <s style={{ opacity: 0.6, marginLeft: 6 }}>${payload.price}</s>
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
