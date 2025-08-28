import * as React from 'react';
import { Box, Typography, TextField, Stack, Button } from '@mui/material';
import NavBar from '../components/NavBar';
import { getProfileStatus, updateProfile } from '../api/user';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const s = await getProfileStatus();
        setName(s.name || '');
        setBio(s.profile?.bio || '');
        setAvatarUrl(s.profile?.avatarUrl || '');
        setLocation(s.profile?.location || '');
      } catch (e: any) {
        setErr(e?.response?.data?.msg || e.message);
      }
    })();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await updateProfile({
        name,
        profile: { bio, avatarUrl, location },
      });
      navigate('/welcome'); // return to welcome to reflect status
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0b0b12' }}>
      <NavBar />
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
        <Typography variant="h4" color="white" fontWeight={800}>
          Edit Profile
        </Typography>
        {err && (
          <Typography color="error" sx={{ mt: 1 }}>
            {err}
          </Typography>
        )}
        <Stack component="form" spacing={2} sx={{ mt: 3 }} onSubmit={onSave}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="Avatar URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            fullWidth
          />
          <TextField
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              Save
            </Button>
            <Button variant="text" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
