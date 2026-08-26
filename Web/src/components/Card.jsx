export const Card = ({ children, className = '', variant = 'default', ...props }) => {
  const baseStyles = 'rounded-xl border transition-all duration-200';
  const variants = {
    default: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]',
    flat: 'bg-gray-50 dark:bg-gray-900/50 border-gray-200/60 dark:border-gray-800/60',
    dark: 'bg-black dark:bg-black border-gray-800 text-white',
    emerald: 'bg-emerald-950 border-emerald-900 text-white shadow-xl',
  };

  return (
    <div className={`${baseStyles} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-5 border-b border-gray-100 dark:border-gray-800 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);
