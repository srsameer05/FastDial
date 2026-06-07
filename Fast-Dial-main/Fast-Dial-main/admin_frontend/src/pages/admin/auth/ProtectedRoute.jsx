import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem('adminToken'));
  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated, 'adminToken:', localStorage.getItem('admin Token'));
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to='/adminlogin' replace state={{ from: location }} />
  );
};

export default ProtectedRoute;
