/**
 * IMC Table Components
 */

export const Table = ({ children, className = '', ...props }) => (
  <div 
    className={`imc-card overflow-hidden ${className}`} 
    {...props}
  >
    <table className="imc-table">
      {children}
    </table>
  </div>
);

export const TableHead = ({ children, ...props }) => (
  <thead {...props}>{children}</thead>
);

export const TableBody = ({ children, ...props }) => (
  <tbody {...props}>{children}</tbody>
);

export const TableRow = ({ children, className = '', ...props }) => (
  <tr className={`imc-table-row ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHeader = ({ children, className = '', ...props }) => (
  <th className={className} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }) => (
  <td className={className} {...props}>
    {children}
  </td>
);

/**
 * Responsive Table Container
 */
export const TableContainer = ({ children, className = '', ...props }) => (
  <div className={`overflow-x-auto ${className}`} {...props}>
    {children}
  </div>
);
