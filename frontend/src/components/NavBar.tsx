import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { authStore } from '../store/auth';
import { alpha, useTheme } from '@mui/material/styles';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [, force] = React.useReducer((x) => x + 1, 0);

  // re-render on auth changes
  React.useEffect(() => authStore.subscribe(force), []);
  const { user } = authStore.state;

  // Profile menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const logout = () => {
    authStore.clear();
    handleClose();
    navigate('/login');
  };

  // Helper to style active tab
  const isActive = (path: string) =>
    location.pathname === path ? { fontWeight: 700, textDecoration: 'underline' } : {};

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: alpha(theme.palette.background.default, 0.95),
        // backdropFilter: 'blur(6px)',
        borderBottom: `1px solid ${theme.palette.surface.border}`,
      }}
    >
      <Toolbar
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          width: '100%',
        }}
      >
        {/* Brand / Logo */}
        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 800, mr: 4 }}
        >
          EduStack
        </Typography>

        {/* Center nav links */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button component={RouterLink} to="/" color="inherit" sx={isActive('/')}>
            Home
          </Button>
          <Button
            component={RouterLink}
            to="/dashboard"
            color="inherit"
            sx={isActive('/dashboard')}
          >
            My Dashboard
          </Button>
          <Button component={RouterLink} to="/courses" color="inherit" sx={isActive('/courses')}>
            Courses & Certifications
          </Button>
          <Button component={RouterLink} to="/about" color="inherit" sx={isActive('/about')}>
            About Us
          </Button>
          <Button component={RouterLink} to="/contact" color="inherit" sx={isActive('/contact')}>
            Contact Us
          </Button>
        </Box>

        {/* Right side: Profile or Register */}
        {user ? (
          <>
            {user?.role === 'admin' && (
              <MenuItem component={RouterLink} to="/admin/" onClick={handleClose}>
                Admin
              </MenuItem>
            )}
            <IconButton onClick={handleOpen} sx={{ p: 0 }}>
              <Avatar
                alt={user.name}
                src={undefined}
                sx={{ background: theme.palette.secondary.main, color: theme.palette.text.primary }}
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{
                mt: 1,
                '& .MuiPaper-root': {
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 0,
                  padding: '0 20px',
                },
              }}
            >
              <MenuItem disabled>{user.name}</MenuItem>
              <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
                Profile
              </MenuItem>
              <MenuItem component={RouterLink} to="/dashboard" onClick={handleClose}>
                Dashboard
              </MenuItem>
              <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            sx={{
              borderRadius: 999,
              textTransform: 'none',
              background: theme.palette.secondary.main,
              color: theme.palette.text.primary,
            }}
          >
            Register
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
