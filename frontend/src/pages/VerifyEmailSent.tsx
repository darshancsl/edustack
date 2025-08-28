import * as React from 'react';
import { Box, Typography, Button, Stack, TextField, InputAdornment } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { http } from '../lib/http';
import { Link as RouterLink, useLocation } from 'react-router-dom';

export default function VerifyEmailSent() {
  const [email, setEmail] = React.useState('');
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    let timer: number | undefined;
    if (cooldown > 0) {
      timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const location = useLocation() as any;
  React.useEffect(() => {
    if (location?.state?.email) setEmail(location.state.email);
  }, [location]);

  const resend = async () => {
    setErr(null);
    setMsg(null);
    if (!/@gmail\.com$/i.test(email)) {
      setErr('Please enter a valid Gmail address.');
      return;
    }
    setLoading(true);
    try {
      await http.post('/api/auth/resend-verification', { email });
      setMsg(
        'If an account exists and is not verified, a new verification email will be sent shortly.',
      );
      setCooldown(60); // 60s client-side cooldown
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 4 }}>
      <Box sx={{ textAlign: 'center', maxWidth: 560 }}>
        <Typography variant="h4" fontWeight={800}>
          Check your email
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          We sent you a verification link. Click it within 24 hours to activate your account.
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: 'center' }}>
          <TextField
            placeholder="yourname@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={resend} disabled={loading || cooldown > 0}>
            {cooldown > 0 ? `Resend (${cooldown})` : 'Resend'}
          </Button>
        </Stack>

        {msg && (
          <Typography color="success.main" sx={{ mt: 2 }}>
            {msg}
          </Typography>
        )}
        {err && (
          <Typography color="error" sx={{ mt: 2 }}>
            {err}
          </Typography>
        )}

        <Button sx={{ mt: 3 }} variant="text" component={RouterLink} to="/login">
          Back to Login
        </Button>
      </Box>
    </Box>
  );
}
