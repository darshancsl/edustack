import * as React from "react";
import {
  Box, CssBaseline, Divider, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 240;

export default function AdminLayout() {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: "Analytics", icon: <AnalyticsIcon />, to: "/admin/analytics" }, // ⬅️ absolute
    { label: "Courses",   icon: <LibraryBooksIcon />, to: "/admin/courses"  }, // ⬅️ absolute
  ];

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h6" fontWeight={900}>Admin</Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1 }}>
        {items.map((it) => {
          const isDefaultAnalytics = location.pathname === "/admin" && it.to === "/admin/analytics";
          const selected = isDefaultAnalytics || location.pathname.startsWith(it.to);
          return (
            <ListItemButton
              key={it.to}
              selected={selected}
              onClick={() => { navigate(it.to); setMobileOpen(false); }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{it.icon}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2, color: "text.secondary", fontSize: 12 }}>
        © {new Date().getFullYear()} EduStack
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: theme.palette.background.default, color: theme.palette.text.primary, minHeight: "100vh" }}>
      <CssBaseline />

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="admin navigation">
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: (t) => t.palette.background.default,
              borderRight: (t) => `1px solid ${t.palette.surface.border}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: (t) => t.palette.background.default,
              borderRight: (t) => `1px solid ${t.palette.surface.border}`,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        {/* Mobile menu button since we removed the admin AppBar */}
        <Toolbar sx={{ display: { xs: "flex", md: "none" }, px: 0 }}>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} aria-label="open drawer">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }} fontWeight={800}>Admin</Typography>
        </Toolbar>

        {/* Render child pages (Analytics / Courses / etc.) */}
        <Outlet />
      </Box>
    </Box>
  );
}
