import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem('vendorToken'));
  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated, 'vendorToken:', localStorage.getItem('vendorToken'));
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to='/vendorlogin' replace state={{ from: location }} />
  );
};

export default ProtectedRoute;
