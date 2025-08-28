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
  Link,
  useTheme,
  alpha,
} from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { http } from '../lib/http';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authStore } from '../store/auth';

export default function Register() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const validate = () => {
    setError(null);
    if (!/@gmail\.com$/i.test(email)) {
      setError('Please use a valid Gmail address (ends with @gmail.com).');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSuccess(null);
    try {
      await http.post('/api/auth/register', { name, email, password });
      setSuccess('Registered successfully! Please check your email to verify your account.');
      // Optional: take them to an interstitial screen
      setTimeout(() => navigate('/verify-email-sent', { replace: true, state: { email } }), 800);
    } catch (err: any) {
      setError(err?.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (authStore.state.token) navigate('/dashboard', { replace: true });
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg,#4facfe 0%,#8f41ff 50%,#ff5acd 100%)',
        p: 2,
      }}
    >
      <Card
        elevation={6}
        sx={{ width: 480, borderRadius: 1, background: alpha(theme.palette.background.paper, 0.5) }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack component="form" spacing={3} onSubmit={onSubmit}>
            <Typography variant="h5" align="center" fontWeight={700}>
              Create your account
            </Typography>

            <TextField
              label="Username"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineRoundedIcon />
                  </InputAdornment>
                ),
              }}
              variant="standard"
              fullWidth
            />

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

            <TextField
              label="Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
              }}
              variant="standard"
              fullWidth
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
              }}
              variant="standard"
              fullWidth
            />

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" variant="body2">
                {success}
              </Typography>
            )}

            <Button
              type="submit"
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.2,
                borderRadius: 999,
                background: theme.palette.primary.main,
                color: theme.palette.text.primary,
                '&:hover': {
                  opacity: 0.95,
                  background: theme.palette.primary.main,
                },
              }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <Typography variant="caption" align="center" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                Login
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
