import React from 'react';
import { motion } from 'framer-motion';

function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'ghost', 'accent', 'outline'
  size = 'default', // 'small', 'default', 'large'
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left', // 'left', 'right'
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-[color,background-color,border-color,box-shadow,ring-color,transform] duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-elegant hover:from-orange-700 hover:to-orange-800 hover:shadow-glow focus:ring-orange-500',
    secondary: 'bg-white/60 backdrop-blur-sm text-secondary-700 shadow-soft ring-1 ring-secondary-200/50 hover:bg-white/80 hover:shadow-medium hover:ring-secondary-300/50 focus:ring-orange-500 dark:bg-secondary-800/70 dark:text-secondary-100 dark:ring-secondary-600/50 dark:hover:bg-secondary-800 dark:hover:ring-secondary-500/50',
    ghost: 'text-secondary-600 hover:bg-secondary-100/50 hover:text-secondary-900 focus:ring-orange-500 dark:text-secondary-300 dark:hover:bg-secondary-800/60 dark:hover:text-secondary-50',
    accent: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-elegant hover:from-amber-600 hover:to-amber-700 hover:shadow-glow focus:ring-amber-500',
    outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50 focus:ring-orange-500 dark:text-orange-400 dark:hover:bg-orange-950/35 dark:border-orange-400'
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm rounded-lg',
    default: 'px-6 py-3 text-sm rounded-xl',
    large: 'px-8 py-4 text-base rounded-2xl'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const renderIcon = () => {
    if (loading) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`border-2 border-current border-t-transparent rounded-full ${iconSizes[size]}`}
        />
      );
    }

    if (icon) {
      const IconComponent = icon;
      return <IconComponent className={iconSizes[size]} />;
    }

    return null;
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={classes}
      {...props}
    >
      {iconPosition === 'left' && renderIcon() && (
        <span className={children ? 'mr-2' : ''}>{renderIcon()}</span>
      )}
      
      {children}
      
      {iconPosition === 'right' && renderIcon() && (
        <span className={children ? 'ml-2' : ''}>{renderIcon()}</span>
      )}
    </motion.button>
  );
}

export default Button;
