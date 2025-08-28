import * as React from 'react';
import { Box, Typography, Card, CardContent, Stack, TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getProfileStatus, updateProfile, skipOnboarding } from '../api/user';
import NavBar from '../components/NavBar';

export default function Welcome() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [location, setLocation] = React.useState('');

  // UX state
  const [loading, setLoading] = React.useState(false);
  const [initializing, setInitializing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const s = await getProfileStatus();
        setName(s.name || '');
        setBio(s.profile?.bio || '');
        setAvatarUrl(s.profile?.avatarUrl || '');
        setLocation(s.profile?.location || '');
      } catch (e: any) {
        setError(e?.response?.data?.msg || e.message);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // minimal client validation (backend also validates + may auto-complete)
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (bio.trim().length < 10) {
      setError('Bio should be at least 10 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        profile: {
          bio: bio.trim(),
          avatarUrl: avatarUrl.trim(),
          location: location.trim(),
        },
      });

      setSuccess('Profile saved successfully!');
      // If backend marked profileCompleted, go to dashboard; else stay and let user edit more
      if (res?.profileCompleted) {
        setTimeout(() => navigate('/dashboard'), 600);
      }
    } catch (e: any) {
      setError(e?.response?.data?.msg || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onSkip = async () => {
    try {
      await skipOnboarding();
    } catch {
      // ignore errors on skip to reduce friction
    } finally {
      navigate('/dashboard');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0b0b12' }}>
      <NavBar />

      <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: { xs: 4, md: 6 } }}>
        <Typography variant="h3" fontWeight={800} color="white">
          Welcome to EduStack 🎉
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.75)" sx={{ mt: 1 }}>
          You’re verified! Complete your profile to personalize your experience.
        </Typography>

        <Card
          sx={{
            mt: 3,
            bgcolor: 'rgba(255,255,255,0.04)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <CardContent>
            <Stack component="form" onSubmit={onSave} spacing={2.5} sx={{ maxWidth: 720 }}>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}

              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
                multiline
                minRows={3}
                helperText="Tell us a little about yourself (min 10 characters)."
                fullWidth
              />

              <TextField
                label="Avatar URL"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                fullWidth
              />

              <TextField
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                fullWidth
              />

              <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                <Button type="submit" variant="contained" disabled={loading || initializing}>
                  {loading ? 'Saving…' : 'Save and continue'}
                </Button>
                <Button variant="text" onClick={() => navigate('/dashboard')} disabled={loading}>
                  I’ll do this later
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
