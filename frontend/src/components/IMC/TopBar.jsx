import { Bell, Search } from 'lucide-react';

/**
 * IMC Top Bar / Header Component
 */
export const TopBar = ({ 
  title,
  description,
  onMobileMenuToggle,
  searchValue,
  onSearchChange,
  showSearch = false,
  className = '',
  children,
  ...props 
}) => {
  return (
    <header
      className={`imc-topbar fixed top-0 left-0 right-0 z-30 ${className}`}
      style={{
        marginLeft: 0,
        paddingLeft: '260px',
        transition: 'padding-left 250ms ease',
      }}
      {...props}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.5rem',
      }}>
        {/* Left: Title & Description */}
        <div>
          {title && (
            <p className="imc-kicker">{title}</p>
          )}
        </div>

        {/* Center: Search (optional) */}
        {showSearch && (
          <div className="imc-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={onSearchChange}
            />
          </div>
        )}

        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {children}
          <button
            className="imc-btn-ghost"
            style={{ padding: '0.5rem', borderRadius: '0.5rem' }}
          >
            <Bell size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

/**
 * Page Header - For page titles and descriptions
 */
export const PageHeader = ({ 
  eyebrow,
  title, 
  description,
  children,
  action,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`imc-card imc-animate ${className}`}
      style={{ padding: '1.5rem 2rem' }}
      {...props}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
        <div>
          {eyebrow && (
            <p className="imc-kicker" style={{ color: 'var(--color-primary)' }}>{eyebrow}</p>
          )}
          {title && (
            <h1 className="imc-page-title" style={{ marginTop: '0.5rem' }}>{title}</h1>
          )}
          {description && (
            <p className="imc-body" style={{ marginTop: '0.5rem', maxWidth: '500px' }}>
              {description}
            </p>
          )}
          {children}
        </div>
        {action && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
