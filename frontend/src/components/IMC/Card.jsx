/**
 * IMC Card Component - Base card with flexible styling
 */
export const Card = ({ children, className = '', hover = false, ...props }) => (
  <div className={`imc-card ${hover ? 'imc-card-hover' : ''} ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Header - For card titles and descriptions
 */
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`flex flex-col gap-1 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Title - Large heading for cards
 */
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`imc-section-title ${className}`} {...props}>
    {children}
  </h3>
);

/**
 * Card Description - Subtitle text
 */
export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`imc-body ${className}`} {...props}>
    {children}
  </p>
);

/**
 * Card Content - Main content area
 */
export const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

/**
 * Card Footer - Bottom action area
 */
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`flex justify-between items-center gap-2 mt-4 ${className}`} {...props}>
    {children}
  </div>
);
