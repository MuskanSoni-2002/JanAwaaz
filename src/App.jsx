import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import DashboardLayout from './layouts/DashboardLayout';

// Citizen pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyComplaints from './pages/MyComplaints';
import RaiseComplaint from './pages/RaiseComplaint';
import ComplaintDetails from './pages/ComplaintDetails';

// Officer portal
import { OfficerAuthProvider } from './officer/context/OfficerAuthContext';
import OfficerGuard from './officer/components/OfficerGuard';
import OfficerLayout from './officer/layouts/OfficerLayout';
import OfficerLogin from './officer/pages/OfficerLogin';
import OfficerDashboard from './officer/pages/OfficerDashboard';
import OfficerComplaints from './officer/pages/OfficerComplaints';
import OfficerComplaintDetails from './officer/pages/OfficerComplaintDetails';
import OfficerProfile from './officer/pages/OfficerProfile';

// Admin portal
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import AdminGuard from './admin/components/AdminGuard';
import AdminLayout from './admin/layouts/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminOfficerManagement from './admin/pages/AdminOfficerManagement';
import AdminGrievanceManagement from './admin/pages/AdminGrievanceManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Citizen Routes ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/complaints" element={<MyComplaints />} />
            <Route path="/complaints/new" element={<RaiseComplaint />} />
            <Route path="/complaints/:id" element={<ComplaintDetails />} />
          </Route>
        </Route>

        {/* ── Officer Portal (completely isolated) ── */}
        <Route
          path="/officer/*"
          element={
            <OfficerAuthProvider>
              <Routes>
                <Route path="login" element={<OfficerLogin />} />
                <Route element={<OfficerGuard />}>
                  <Route element={<OfficerLayout />}>
                    <Route path="dashboard" element={<OfficerDashboard />} />
                    <Route path="complaints" element={<OfficerComplaints />} />
                    <Route path="complaints/:id" element={<OfficerComplaintDetails />} />
                    <Route path="profile" element={<OfficerProfile />} />
                    <Route index element={<Navigate to="dashboard" replace />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="login" replace />} />
              </Routes>
            </OfficerAuthProvider>
          }
        />

        <Route
          path="/admin/*"
          element={
            <AdminAuthProvider>
              <Routes>
                <Route path="login" element={<AdminLogin />} />
                <Route element={<AdminGuard />}>
                  <Route element={<AdminLayout />}>
                    <Route path="officers" element={<AdminOfficerManagement />} />
                    <Route path="grievances" element={<AdminGrievanceManagement />} />
                    <Route index element={<Navigate to="officers" replace />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="login" replace />} />
              </Routes>
            </AdminAuthProvider>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
