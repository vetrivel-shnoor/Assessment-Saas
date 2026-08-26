export const Badge = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${variants[variant] || variants.gray} ${className}`}>
      {children}
    </span>
  );
};
