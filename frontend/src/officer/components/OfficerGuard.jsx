import { Navigate, Outlet } from 'react-router-dom';
import { useOfficerAuth } from '../context/OfficerAuthContext';

const OfficerGuard = () => {
  const { authenticated } = useOfficerAuth();
  if (!authenticated) return <Navigate to="/officer/login" replace />;
  return <Outlet />;
};

export default OfficerGuard;
