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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '../src/api/auth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const token = params.get('token') || '';

  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!token) {
      setErr('Invalid or missing reset token.');
      return;
    }
    if (password.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setErr('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi(token, password);
      setMsg('Password has been reset. You can now login.');
      setTimeout(() => navigate('/login', { replace: true }), 800);
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
              Set a new password
            </Typography>

            <TextField
              label="New Password"
              type="password"
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
              {loading ? 'Updating...' : 'Update password'}
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
