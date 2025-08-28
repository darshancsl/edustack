import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Stack,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { forgotPassword } from '../src/api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = React.useState('');
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    if (!/@gmail\.com$/i.test(email)) {
      setErr('Please enter a valid Gmail address.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      setMsg('If an account exists, a password reset link will be sent shortly.');
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background: 'linear-gradient(135deg,#4facfe 0%,#8f41ff 50%,#ff5acd 100%)',
      }}
    >
      <Card elevation={6} sx={{ width: 480, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3} component="form" onSubmit={onSubmit}>
            <Typography variant="h5" align="center" fontWeight={700}>
              Forgot Password
            </Typography>
            <TextField
              label="Gmail Id"
              type="email"
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon />
                  </InputAdornment>
                ),
              }}
              variant="standard"
              fullWidth
            />
            {msg && (
              <Typography color="success.main" variant="body2">
                {msg}
              </Typography>
            )}
            {err && (
              <Typography color="error" variant="body2">
                {err}
              </Typography>
            )}

            <Button
              type="submit"
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.2,
                borderRadius: 999,
                background:
                  'linear-gradient(90deg, rgba(105,230,206,1) 0%, rgba(209,91,255,1) 100%)',
                color: '#fff',
                '&:hover': {
                  opacity: 0.95,
                  background:
                    'linear-gradient(90deg, rgba(105,230,206,1) 0%, rgba(209,91,255,1) 100%)',
                },
              }}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>

            <Button component={RouterLink} to="/login">
              Back to Login
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
