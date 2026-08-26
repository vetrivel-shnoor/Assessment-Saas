import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const Logo = ({ linkTo = '/', className = '', variant = 'auto' }) => {
  const textPrimaryClass = 
    variant === 'dark' 
      ? 'text-white' 
      : variant === 'light' 
      ? 'text-gray-900' 
      : 'text-gray-900 dark:text-white';

  const textSecondaryClass = 
    variant === 'dark' 
      ? 'text-emerald-400' 
      : 'text-emerald-600 dark:text-emerald-400';

  const iconBgClass = 
    variant === 'dark'
      ? 'bg-white text-emerald-950'
      : 'bg-emerald-600 text-white';

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg ${iconBgClass} flex items-center justify-center shrink-0 shadow-sm`}>
        <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="min-w-0">
        <h1 className={`font-extrabold leading-none text-xs md:text-sm tracking-tight whitespace-nowrap ${textPrimaryClass}`}>
          ASSESSMENT PORTAL
        </h1>
        <p className={`text-[8px] md:text-[9px] font-bold tracking-wider uppercase whitespace-nowrap mt-0.5 ${textSecondaryClass}`}>
          ASSESSMENT PLATFORM
        </p>
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="inline-block">{content}</Link>;
  }

  return content;
};

export default Logo;
