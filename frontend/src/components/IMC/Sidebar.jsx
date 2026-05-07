import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

/**
 * IMC Sidebar Navigation Component
 *
 * Desktop: always visible (fixed left: 0)
 * Mobile:  slides in when isOpen=true, hidden otherwise
 */
export const Sidebar = ({
  navItems = [],
  userInitials,
  userName,
  onLogout,
  isOpen = false,
  onToggle,
  className = '',
}) => {
  const location = useLocation();

  const isNavItemActive = (path) => {
    if (path === '/complaints') {
      return location.pathname === '/complaints' || /^\/complaints\/[^/]+$/.test(location.pathname);
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* ── Mobile toggle button (hidden on desktop) ── */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 50,
          padding: '0.5rem',
          borderRadius: '0.5rem',
          background: '#fff',
          border: '1px solid #E8ECF1',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* ── Mobile overlay ── */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="lg:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 40,
          }}
        />
      )}

      {/* ── Sidebar ──
           Desktop: always left:0
           Mobile:  slides based on isOpen
      ── */}
      <aside
        className={`imc-sidebar ${className}`}
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          width: '260px',
          zIndex: 45,
          display: 'flex',
          flexDirection: 'column',
          transition: 'left 250ms ease',
          // Will be overridden by the media-specific class below on mobile
          left: 0,
        }}
        // On mobile, shift off-screen when closed via inline override
        // We use a data attribute so CSS can target it cleanly
        data-open={isOpen}
      >
        {/* Brand */}
        <div className="imc-sidebar-brand">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            JanAwaaz
          </h1>
          <p style={{ fontSize: '0.6875rem', opacity: 0.65, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Citizen Portal
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.5rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isOpen && onToggle?.()}
                className={`imc-sidebar-nav-item ${isActive ? 'imc-sidebar-nav-item-active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="imc-sidebar-user">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="imc-avatar">{userInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userName}
              </p>
              <p style={{ fontSize: '0.6875rem', opacity: 0.65, marginTop: '0.125rem' }}>
                Citizen
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="imc-btn-danger"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
