import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, BottomNavigation,
  BottomNavigationAction, IconButton, Avatar, Paper,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { label: 'Home',       path: '/',           icon: <DashboardIcon /> },
  { label: 'Prayers',    path: '/prayers',    icon: <AccessTimeIcon /> },
  { label: 'History',    path: '/history',    icon: <HistoryIcon /> },
  { label: 'Statistics', path: '/statistics', icon: <BarChartIcon /> },
  { label: 'Settings',   path: '/settings',   icon: <SettingsIcon /> },
];

// Subtle Islamic geometric pattern overlay
const GeometricPattern = () => (
  <Box sx={{
    position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none',
    backgroundImage: `
      repeating-linear-gradient(45deg, rgba(212,172,13,0.6) 0 1px, transparent 1px 16px),
      repeating-linear-gradient(-45deg, rgba(212,172,13,0.6) 0 1px, transparent 1px 16px)
    `,
  }} />
);

export default function MainLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const currentTab = NAV_ITEMS.findIndex(i => i.path === pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', bgcolor: 'background.default' }}>
      {/* AppBar extends into status bar area on iOS PWA */}
      <AppBar position="sticky" elevation={0} sx={{
        overflow: 'hidden',
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        <GeometricPattern />
        <Toolbar sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              component="img"
              src="/pwa-192x192.png"
              alt="Salah Companion"
              sx={{ width: 34, height: 34, borderRadius: '50%' }}
            />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: '-0.3px',
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.2,
                }}
              >
                Salah Companion
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                Track your Salah. Build your habit.
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => navigate('/settings')} size="small">
            <Avatar
              sx={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, #d4ac0d, #b7950b)',
                color: '#1a2733',
                fontWeight: 800,
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, pb: `calc(56px + env(safe-area-inset-bottom) + 24px)` }}>
        <Outlet />
      </Box>

      <Paper
        component="nav"
        elevation={0}
        sx={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200,
          borderTop: '1px solid rgba(26,82,118,0.1)',
          boxShadow: '0 -4px 20px rgba(26,82,118,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <BottomNavigation value={currentTab} onChange={(_, v) => navigate(NAV_ITEMS[v].path)} showLabels>
          {NAV_ITEMS.map(item => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 11,
                minWidth: 0,
                '&.Mui-selected': { color: '#1a5276' },
                '& .MuiBottomNavigationAction-label': {
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
