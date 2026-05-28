import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'default', // 'small', 'default', 'large', 'xl'
  showCloseButton = true,
  closeOnOverlayClick = true 
}) {
  const sizeClasses = {
    small: 'max-w-md w-full',
    default: 'max-w-lg w-full',
    large: 'max-w-2xl w-full',
    xl: 'max-w-4xl w-full'
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  if (typeof document === 'undefined') return null;

  const content = (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-secondary-900/80 backdrop-blur-sm"
          onClick={handleOverlayClick}
        />

        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ 
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1]
          }}
          className={`relative ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-premium">
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-secondary-200/60 dark:border-secondary-600/50">
                {title && (
                  <h3 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-secondary-100">
                    {title}
                  </h3>
                )}
                
                {showCloseButton && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    aria-label="Close"
                    className="p-2 rounded-xl text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100/50 transition-colors dark:hover:text-secondary-200 dark:hover:bg-secondary-800/80"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

export default Modal;
