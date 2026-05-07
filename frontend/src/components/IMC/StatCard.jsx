/**
 * Stat Card Component - For displaying statistics
 */
export const StatCard = ({ 
  icon: Icon, 
  label, 
  value,
  color = '#1565C0',
  bgColor = '#E3F2FD',
  className = '',
  ...props 
}) => {
  return (
    <div className={`imc-stat-card ${className}`} {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="imc-stat-label">{label}</p>
          <p className="imc-stat-value mt-1" style={{ color }}>
            {value}
          </p>
        </div>
        {Icon && (
          <div 
            className="imc-stat-icon"
            style={{ background: bgColor }}
          >
            <Icon size={20} style={{ color }} />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Stat Grid - Container for stat cards
 */
export const StatGrid = ({ children, className = '', ...props }) => (
  <div className={`imc-grid-4 ${className}`} {...props}>
    {children}
  </div>
);
