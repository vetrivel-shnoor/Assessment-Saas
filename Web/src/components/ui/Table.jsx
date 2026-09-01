import React from 'react';

export const TableContainer = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm ${className}`}>
    <div className="overflow-x-auto">
      {children}
    </div>
  </div>
);

export const Table = ({ children, className = '', ...props }) => (
  <table className={`w-full text-left text-sm ${className}`} {...props}>
    {children}
  </table>
);

export const TableHeader = ({ children, className = '', ...props }) => (
  <thead className={`bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 ${className}`} {...props}>
    {children}
  </thead>
);

export const TableRow = ({ children, className = '', ...props }) => (
  <tr className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead = ({ children, className = '', ...props }) => (
  <th className={`px-6 py-4 font-bold uppercase tracking-wider text-xs opacity-70 ${className}`} {...props}>
    {children}
  </th>
);

export const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={`divide-y divide-gray-200 dark:divide-white/10 ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableCell = ({ children, className = '', ...props }) => (
  <td className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </td>
);
