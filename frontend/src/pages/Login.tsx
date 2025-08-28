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
  IconButton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Facebook from '@mui/icons-material/Facebook';
import Google from '@mui/icons-material/Google';
import XIcon from '@mui/icons-material/X';
import { authStore } from '../store/auth';
import { loginApi } from '../src/api/auth';

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user, token } = await loginApi({ email, password });
      authStore.setToken(token);
      authStore.setUser(user);
      navigate('/');
    } catch (err: any) {
      const msg =
        err?.response?.data?.msg || err?.message || 'Login failed. Please check your credentials.';
      if (/verify/i.test(msg)) {
        setError('Please verify your email. Check your inbox for the verification link.');
      } else {
        setError(msg);
      }
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
        // gradient background like the screenshot
        background: 'linear-gradient(135deg, #4facfe 0%, #8f41ff 50%, #ff5acd 100%)',
        p: 2,
      }}
    >
      <Card
        elevation={6}
        sx={{
          width: 420,
          borderRadius: 1,
          background: alpha(theme.palette.background.paper, 0.5),
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack component="form" onSubmit={onSubmit} spacing={3}>
            <Typography variant="h5" align="center" fontWeight={700} gutterBottom>
              Login
            </Typography>

            <TextField
              label="Username"
              placeholder="Type your username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
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
              label="Password"
              placeholder="Type your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
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
              helperText={
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  underline="hover"
                  sx={{ float: 'right', fontSize: 12, mt: 0.5 }}
                >
                  Forgot password?
                </Link>
              }
            />

            {error && (
              <Typography color="error" variant="body2">
                {error}
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
              {loading ? 'Logging in...' : 'LOGIN'}
            </Button>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Or Sign Up Using
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Stack>

            <Stack direction="row" justifyContent="center" spacing={1.5}>
              <IconButton aria-label="Login with Facebook" size="large">
                <Facebook />
              </IconButton>
              <IconButton aria-label="Login with Twitter/X" size="large">
                <XIcon />
              </IconButton>
              <IconButton aria-label="Login with Google" size="large">
                <Google />
              </IconButton>
            </Stack>

            <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
              Or Sign Up Using
            </Typography>
            <Typography variant="caption" align="center" color="text.secondary">
              <Link component={RouterLink} to="/register" underline="hover" align="center">
                SIGN UP
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
