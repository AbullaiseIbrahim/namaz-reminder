import { Outlet } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export default function AuthLayout() {
  return (
    <Box sx={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0f1b24 0%, #154360 40%, #1a5276 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      p: 2,
      paddingTop: 'max(16px, env(safe-area-inset-top))',
      paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Geometric background pattern */}
      <Box sx={{
        position: 'absolute', inset: 0, opacity: 0.07,
        backgroundImage: `
          repeating-linear-gradient(45deg, rgba(212,172,13,1) 0 1px, transparent 1px 20px),
          repeating-linear-gradient(-45deg, rgba(212,172,13,1) 0 1px, transparent 1px 20px)
        `,
      }} />

      {/* Logo */}
      <Box sx={{ mb: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: 4, mx: 'auto', mb: 2,
          background: 'linear-gradient(135deg, #d4ac0d, #b7950b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, boxShadow: `0 8px 32px ${alpha('#d4ac0d', 0.3)}`,
        }}>
          🕌
        </Box>
        <Typography sx={{
          color: '#fff', fontWeight: 800, fontSize: 26,
          letterSpacing: '-0.4px', fontFamily: "'DM Sans', sans-serif",
        }}>
          Salah Companion
        </Typography>
        <Typography sx={{ color: alpha('#d4ac0d', 0.9), fontSize: 14, fontWeight: 500, mt: 0.5 }}>
          Track your Salah. Build your habit.
        </Typography>
      </Box>

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
