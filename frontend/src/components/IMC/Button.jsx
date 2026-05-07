/**
 * IMC Button Components - Reusable button variants
 */

export const Button = ({ 
  variant = 'primary', 
  children, 
  className = '',
  disabled = false,
  ...props 
}) => {
  const variants = {
    primary: 'imc-btn-primary',
    secondary: 'imc-btn-secondary',
    ghost: 'imc-btn-ghost',
    danger: 'imc-btn-danger',
  };

  return (
    <button 
      className={`${variants[variant] || variants.primary} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const ButtonGroup = ({ children, className = '', ...props }) => (
  <div className={`flex gap-2 ${className}`} {...props}>
    {children}
  </div>
);
