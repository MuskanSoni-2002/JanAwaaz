/**
 * Service Card Component - For dashboard action cards
 */
export const ServiceCard = ({ 
  icon: Icon, 
  title, 
  description,
  onClick,
  href,
  className = '',
  ...props 
}) => {
  const Component = href ? 'a' : 'div';
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={`imc-service-card relative z-10 ${className}`}
      {...props}
    >
      <div className="imc-service-icon relative z-10">
        <Icon size={32} style={{ color: 'var(--color-primary)' }} />
      </div>
      <div className="relative z-10">
        <h3 className="imc-service-title">{title}</h3>
        <p className="imc-service-desc">{description}</p>
      </div>
    </Component>
  );
};

/**
 * Service Grid - Container for service cards
 */
export const ServiceGrid = ({ children, className = '', ...props }) => (
  <div className={`imc-grid-2 ${className}`} {...props}>
    {children}
  </div>
);
