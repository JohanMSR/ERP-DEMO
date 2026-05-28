import React from 'react';
import { motion } from 'framer-motion';
import { FireIcon, TrophyIcon } from '@heroicons/react/24/outline';

function GamificationStrip({ userPoints = 0 }) {
  const nextLevel = 5000;
  const progress = Math.min(100, (userPoints / nextLevel) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium p-6 bg-gradient-to-r from-amber-50 via-white to-orange-50 border-amber-200/50 dark:from-secondary-900/90 dark:via-secondary-900/70 dark:to-orange-950/30 dark:border-orange-500/20"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-glow">
            <TrophyIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
              Siguiente nivel de recompensa
            </h3>
            <p className="text-sm text-secondary-600 mt-1 max-w-xl">
              Mensajes persuasivos y gamificación: avanza para desbloquear más
              beneficios. En producción: notificaciones en app, SMS y correo.
            </p>
          </div>
        </div>
        <div className="w-full lg:max-w-md">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-secondary-600 dark:text-secondary-400 flex items-center gap-1">
              <FireIcon className="w-4 h-4 text-orange-500" />
              {userPoints} puntos
            </span>
            <span className="font-semibold text-secondary-900 dark:text-secondary-100">
              Meta {nextLevel} pts
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-secondary-100 dark:bg-secondary-800 overflow-hidden ring-1 ring-secondary-200/50 dark:ring-secondary-700/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
            />
          </div>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
            Refiere más para subir de nivel y acceder a regalos exclusivos.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default GamificationStrip;
