import { AlertCircle } from 'lucide-react';

/**
 * Empty State Component - Display when no data
 */
export const EmptyState = ({ 
  icon: Icon = AlertCircle,
  title = 'No data',
  description = 'There is nothing to display',
  action,
  className = '',
  ...props 
}) => {
  return (
    <div className={`imc-empty ${className}`} {...props}>
      <Icon size={32} style={{ color: 'var(--imc-text-muted)' }} />
      <p className="imc-section-title mt-2">{title}</p>
      <p className="imc-body mt-1">{description}</p>
      {action && (
        <div style={{ marginTop: '1rem' }}>
          {action}
        </div>
      )}
    </div>
  );
};

/**
 * Loading State Component
 */
export const LoadingState = ({ 
  message = 'Loading...',
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        height: '50vh',
        color: 'var(--imc-text-muted)',
      }}
      {...props}
    >
      <div 
        className="imc-skeleton"
        style={{
          width: '1.5rem',
          height: '1.5rem',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      {message}
    </div>
  );
};

/**
 * Error State Component
 */
export const ErrorState = ({ 
  title = 'Something went wrong',
  description = 'Please try again later',
  action,
  className = '',
  ...props 
}) => {
  return (
    <div className={`imc-alert imc-alert-error ${className}`} {...props}>
      <AlertCircle size={20} />
      <div>
        <p className="imc-section-title">{title}</p>
        <p className="imc-body mt-1">{description}</p>
        {action && (
          <div style={{ marginTop: '0.75rem' }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
