import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layouts/MainLayout';
import AuthLayout from '../components/layouts/AuthLayout';

// Pages
import Dashboard from '../pages/Dashboard';
import Prayers from '../pages/Prayers';
import History from '../pages/History';
import Statistics from '../pages/Statistics';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import Register from '../pages/Register';

function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/',           element: <Dashboard /> },
          { path: '/prayers',    element: <Prayers /> },
          { path: '/history',    element: <History /> },
          { path: '/statistics', element: <Statistics /> },
          { path: '/settings',   element: <Settings /> },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login',    element: <Login /> },
          { path: '/register', element: <Register /> },
        ],
      },
    ],
  },
]);
