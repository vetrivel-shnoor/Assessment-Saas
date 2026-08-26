import { Card } from './Card';

export const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  change, 
  changeType = 'positive', 
  iconBg = 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  className = ''
}) => {
  return (
    <Card className={`p-5 sm:p-6 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] dark:hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] transition-shadow duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        {change && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            changeType === 'positive' 
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' 
              : 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800'
          }`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h3>
      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{value}</p>
    </Card>
  );
};
