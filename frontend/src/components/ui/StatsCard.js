import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon: Icon, 
  gradient,
  description,
  trend,
  periodText = 'vs last period',
  trendPeriodText = 'Last 7 days',
  animated = true,
  size = 'default' // 'small', 'default', 'large'
}) {
  const changeColor = changeType === 'positive'
    ? 'text-success-600 dark:text-success-400'
    : changeType === 'negative'
      ? 'text-error-600 dark:text-error-400'
      : 'text-secondary-400 dark:text-secondary-500';

  const changeIcon = changeType === 'positive' ? '↗' : 
                    changeType === 'negative' ? '↘' : 
                    '→';

  const sizeClasses = {
    small: 'p-4',
    default: 'p-6',
    large: 'p-8'
  };

  const titleSizes = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg'
  };

  const valueSizes = {
    small: 'text-xl',
    default: 'text-3xl',
    large: 'text-4xl'
  };

  const iconSizes = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`card-premium hover-glow group ${sizeClasses[size]}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`font-semibold text-secondary-600 dark:text-secondary-300 mb-1 ${titleSizes[size]}`}>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-secondary-500 dark:text-secondary-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {Icon && (
          <div className={`${iconSizes[size]} bg-gradient-to-br ${gradient} p-3 rounded-2xl shadow-glow flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-4">
        <div
          className={`font-bold text-secondary-900 dark:text-secondary-50 mb-1 tabular-nums [&_*]:text-inherit ${valueSizes[size]}`}
        >
          {animated && typeof value === 'number' ? (
            <CountUp
              end={value}
              duration={2}
              preserveValue
              separator=","
            />
          ) : (
            value
          )}
        </div>
        
        {(change !== undefined && change !== null) && (
          <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm ${changeColor}`}>
            <span className="font-semibold text-inherit">
              {change !== 0 ? `${changeIcon} ${Math.abs(change)}%` : '0%'}
            </span>
            <span className="text-secondary-500 dark:text-secondary-400">{periodText}</span>
          </div>
        )}
      </div>

      {/* Trend Chart or Additional Info */}
      {trend && (
        <div className="mt-4 pt-4 border-t border-white/20 dark:border-secondary-600/40">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-secondary-500 dark:text-secondary-400">
            <span className="text-inherit">{trendPeriodText}</span>
            <span className={`shrink-0 ${changeColor}`}>
              {changeType === 'positive' ? 'Trending up' : 
               changeType === 'negative' ? 'Trending down' : 
               'No activity'}
            </span>
          </div>
          
          {/* Simple trend visualization */}
          <div className="mt-2 h-8 flex items-end space-x-1">
            {trend.map((point, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${(point / Math.max(...trend)) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`flex-1 bg-gradient-to-t ${gradient} rounded-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                style={{ minHeight: '2px' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Progress bar for percentage values */}
      {typeof value === 'number' && value <= 100 && size !== 'small' && (
        <div className="mt-4">
          <div className="w-full bg-secondary-100 dark:bg-secondary-800 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default StatsCard;
