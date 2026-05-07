import { useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileStack,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  UserCircle2,
  Menu,
  Bell,
} from 'lucide-react';
import { logout } from '../features/authSlice';
import { Sidebar } from '../components/IMC/Sidebar';
import { useCitizenNotifications } from '../context/CitizenNotificationContext';
import CitizenNotificationPanel from '../components/CitizenNotificationPanel';

/**
 * IMC-Inspired Dashboard Layout
 * Professional, clean, service-oriented design
 */
const IMCDashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const { unreadCount } = useCitizenNotifications();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Complaints', path: '/complaints', icon: FileStack },
    { name: 'New Complaint', path: '/complaints/new', icon: PlusCircle },
    { name: 'Profile', path: '/profile', icon: UserCircle2 },
  ];

  const userInitials = useMemo(() => {
    if (!user?.firstName && !user?.lastName) return 'JA';
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  }, [user]);

  const userName = useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || 'Citizen';
  }, [user]);

  return (
    <div className="citizen-portal" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        userInitials={userInitials}
        userName={userName}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          marginTop: 0,
          backgroundColor: 'var(--imc-bg)',
          transition: 'margin-left 250ms ease',
        }}
        className="ml-0 lg:ml-[260px]"
      >
        {/* Header with Notification Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--imc-border)',
        }}>
          <button
            onClick={() => setNotificationPanelOpen(true)}
            style={{
              position: 'relative',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
            aria-label="Notifications"
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-0.25rem',
                right: '-0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.25rem',
                height: '1.25rem',
                borderRadius: '9999px',
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: '0.625rem',
                fontWeight: 'bold',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Content with proper padding */}
        <div style={{ padding: '1.5rem' }}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Sidebar Toggle */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 40,
            display: 'block',
          }}
          className="lg:hidden"
        />
      )}

      {/* Notification Panel */}
      <CitizenNotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />
    </div>
  );
};

export default IMCDashboardLayout;
