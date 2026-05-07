import { ChevronRight, Calendar, MapPin, AlertCircle } from 'lucide-react';

/**
 * Complaint Card - For displaying complaint items
 */
export const ComplaintCard = ({ 
  id,
  title, 
  category,
  status,
  date,
  location,
  onClick,
  href,
  className = '',
  ...props 
}) => {
  const Component = href ? 'a' : 'div';
  
  const statusColor = {
    RESOLVED: { bg: '#E8F5E9', text: '#2E7D32', label: 'Resolved' },
    REJECTED: { bg: '#FFEBEE', text: '#C62828', label: 'Rejected' },
    PENDING: { bg: '#FFF3E0', text: '#E65100', label: 'Pending' },
    ASSIGNED: { bg: '#E3F2FD', text: '#1565C0', label: 'Assigned' },
    'IN_PROGRESS': { bg: '#FCE4EC', text: '#AD1457', label: 'In Progress' },
  };
  
  const statusInfo = statusColor[status] || statusColor.PENDING;

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`imc-complaint-card cursor-pointer transition-all ${className}`}
      {...props}
    >
      <div className="imc-complaint-card-header flex-1">
        <div className="imc-complaint-id">#{id}</div>
        <h3 className="imc-complaint-title">{title}</h3>
        <div className="imc-complaint-meta">
          {category && (
            <div className="imc-complaint-meta-item">
              <span>{category}</span>
            </div>
          )}
          {date && (
            <div className="imc-complaint-meta-item">
              <Calendar size={14} />
              <span>{date}</span>
            </div>
          )}
          {location && (
            <div className="imc-complaint-meta-item">
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-3">
        <div 
          className="imc-badge"
          style={{
            background: statusInfo.bg,
            color: statusInfo.text,
            borderColor: statusInfo.text + '33',
          }}
        >
          {statusInfo.label}
        </div>
        <ChevronRight size={20} style={{ color: 'var(--imc-text-muted)' }} />
      </div>
    </Component>
  );
};

/**
 * Complaint List - Container for complaint cards
 */
export const ComplaintList = ({ children, className = '', empty = false, ...props }) => {
  if (empty) {
    return (
      <div className="imc-empty" {...props}>
        <AlertCircle size={32} style={{ color: 'var(--imc-text-muted)' }} />
        <p className="imc-body mt-2">No complaints found</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`} {...props}>
      {children}
    </div>
  );
};
