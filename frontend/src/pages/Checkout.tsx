import * as React from "react";
import { Box, Container, Typography, Card, CardContent, Stack, Button, Alert } from "@mui/material";
import { useSearchParams, useNavigate, Link as RouterLink } from "react-router-dom";
import NavBar from "../components/NavBar";
import { getCourse } from "../api/courses";
import { devPurchase /*, createStripeIntent*/ } from "../api/checkout";

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const slug = params.get("course") || "";

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [course, setCourse] = React.useState<any>(null);
  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const c = await getCourse(slug);
        setCourse(c);
      } catch (e: any) {
        setError(e?.response?.data?.msg || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const price = course ? (course.salePrice ?? course.price) : 0;

  const onDevBuy = async () => {
    setBusy(true); setError(null); setToast(null);
    try {
      await devPurchase(slug);
      setToast("Enrollment confirmed!");
      setTimeout(() => navigate(`/courses/${slug}`), 600);
    } catch (e: any) {
      setError(e?.response?.data?.msg || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: (t) => t.palette.background.default, color: (t) => t.palette.text.primary }}>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={900}>Checkout</Typography>

        {loading && <Typography sx={{ mt: 2 }}>Loading…</Typography>}
        {error && <Alert sx={{ mt: 2 }} severity="error">{error}</Alert>}

        {course && (
          <Card sx={{ mt: 2, bgcolor: (t) => t.palette.surface.elevated, border: (t) => `1px solid ${t.palette.surface.border}` }}>
            <CardContent>
              <Typography variant="h5" fontWeight={800}>{course.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{course.subtitle}</Typography>
              <Typography variant="h6" fontWeight={900}>${price.toFixed(2)}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {course.accessPeriod === 'lifetime' ? 'Lifetime access' :
                 course.accessPeriod === '30d' ? '30 days access' :
                 course.accessPeriod === '90d' ? '90 days access' :
                 course.accessPeriod === '180d' ? '180 days access' :
                 course.accessPeriod === '365d' ? '365 days access' : 'Access included'}
              </Typography>

              {toast && <Alert sx={{ mt: 2 }} severity="success">{toast}</Alert>}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                {/* Dev purchase (instant) */}
                <Button variant="contained" disabled={busy} onClick={onDevBuy}>
                  Complete Purchase (Dev)
                </Button>

                {/* Stripe path for later (commented until ENABLE_STRIPE=true) */}
                {/* <Button variant="outlined" disabled={busy} onClick={onStripePay}>Pay with Card</Button> */}

                <Button component={RouterLink} to={`/courses/${slug}`} variant="text">
                  Back to course
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
