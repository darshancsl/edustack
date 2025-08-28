import * as React from "react";
import {
  Box, Container, Typography, Card, CardActionArea, CardContent,
  LinearProgress, Stack, Chip, Button, Tabs, Tab
} from "@mui/material";
import Grid from '@mui/material/GridLegacy';
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import NavBar from "../components/NavBar";
import { listMyEnrollments, MyEnrollment } from "../api/enrollments";

function accessLabel(p?: string) {
  switch (p) {
    case "lifetime": return "Lifetime";
    case "30d": return "30 days";
    case "90d": return "90 days";
    case "180d": return "180 days";
    case "365d": return "365 days";
    default: return "";
  }
}
function daysLeft(expiresAt?: string) {
  if (!expiresAt) return Infinity;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const theme = useTheme();
  const [items, setItems] = React.useState<MyEnrollment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<"active" | "expired">("active");

  React.useEffect(() => {
    (async () => {
      try {
        const data = await listMyEnrollments();
        setItems(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const active = items.filter(i => !i.expired);
  const expired = items.filter(i => i.expired);

  const renderCard = (e: MyEnrollment) => {
    const dLeft = daysLeft(e.expiresAt);
    const badge = e.expired ? "Expired" : (e.course.accessPeriod === "lifetime" ? "Lifetime" : `${dLeft} days left`);

    return (
      <Card
        key={e.course.slug}
        sx={{
          bgcolor: (t) => t.palette.surface.elevated,
          border: (t) => `1px solid ${t.palette.surface.border}`,
        }}
      >
        <CardActionArea component={RouterLink} to={`/courses/${e.course.slug}`}>
          <Box sx={{
            height: 140,
            backgroundImage: `url(${e.course.heroImage || "/media/course-1.jpg"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }} />
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={800}>{e.course.title}</Typography>
              <Chip size="small" label={badge} color={e.expired ? "default" : "primary"} />
            </Stack>
            {e.course.subtitle && (
              <Typography variant="body2" color="text.secondary">{e.course.subtitle}</Typography>
            )}

            <Stack spacing={1} sx={{ mt: 1.5 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Progress</Typography>
                <Typography variant="caption" color="text.secondary">{e.progressPct}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={e.progressPct} />
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
              <Button component={RouterLink} to={`/courses/${e.course.slug}`} size="small" variant="contained">
                {e.progressPct > 0 ? "Continue learning" : "Start course"}
              </Button>
              <Button component={RouterLink} to={`/courses/${e.course.slug}`} size="small" variant="text">
                Details
              </Button>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>My Dashboard</Typography>

        <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label={`Active (${active.length})`} value="active" />
          <Tab label={`Expired (${expired.length})`} value="expired" />
        </Tabs>

        {loading ? (
          <Typography>Loading…</Typography>
        ) : (
          <Grid item xs={12} md={9}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              sx={{ mb: 2 }}
              spacing={1}
            >
              {(tab === "active" ? active : expired).map(renderCard)}
            </Stack>
          </Grid>
        )}

        {!loading && items.length === 0 && (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <Typography>No courses yet.</Typography>
            <Button component={RouterLink} to="/courses" sx={{ mt: 1 }} variant="contained">Browse Courses</Button>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
