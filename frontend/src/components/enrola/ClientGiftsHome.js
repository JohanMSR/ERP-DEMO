import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, StarIcon } from '@heroicons/react/24/outline';
import GamificationStrip from './GamificationStrip';

const DEMO_GIFTS = [
  {
    id: 1,
    name: 'Tarjeta regalo Amazon',
    points: 1200,
    image:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80',
    cashIncentive: true,
  },
  {
    id: 2,
    name: 'Tarjeta Visa precargada',
    points: 2500,
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80',
    cashIncentive: false,
  },
  {
    id: 3,
    name: 'Experiencia premium',
    points: 800,
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80',
    cashIncentive: true,
  },
];

function ClientGiftsHome({
  gifts = DEMO_GIFTS,
  userPoints = 0,
  onOpenRewards,
}) {
  const [cashMap, setCashMap] = useState(() =>
    gifts.reduce((acc, g) => ({ ...acc, [g.id]: !!g.cashIncentive }), {})
  );

  return (
    <div className="space-y-8">
      <GamificationStrip userPoints={userPoints} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Regalos disponibles
          </h2>
          <p className="text-secondary-600 mt-1">
            Intercambia tus puntos por recompensas. Activa incentivo en dinero para
            programas de reclutamiento de socios cuando aplique.
          </p>
        </div>
        {onOpenRewards && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenRewards}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <StarIcon className="w-5 h-5" />
            Ver historial de puntos
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {gifts.map((gift, index) => {
          const canAfford = userPoints >= gift.points;
          const cashOn = !!cashMap[gift.id];
          return (
            <motion.article
              key={gift.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className={`card-premium interactive-lift overflow-hidden flex flex-col ${
                canAfford ? 'ring-2 ring-success-300/80 dark:ring-success-500/40' : ''
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary-100 dark:bg-secondary-800">
                <img
                  src={gift.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  <SparklesIcon className="w-4 h-4" />
                  {gift.points} pts
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                  {gift.name}
                </h3>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50/50 dark:bg-secondary-800/50 px-3 py-2 cursor-pointer">
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">
                    Incentivo dinero (reclutamiento socios)
                  </span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-secondary-300 text-orange-600 focus:ring-orange-500"
                    checked={cashOn}
                    onChange={() =>
                      setCashMap((m) => ({
                        ...m,
                        [gift.id]: !m[gift.id],
                      }))
                    }
                  />
                </label>
                <p className="text-xs text-secondary-500 mt-2 flex-1">
                  Visual: la empresa define reglas; aquí solo indicas preferencia
                  para campañas de socios.
                </p>
                <motion.button
                  type="button"
                  disabled={!canAfford}
                  whileHover={canAfford ? { scale: 1.02 } : {}}
                  className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold ${
                    canAfford
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-glow'
                      : 'bg-secondary-100 text-secondary-400 dark:bg-secondary-800 dark:text-secondary-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford
                    ? 'Canjear (vista)'
                    : `Faltan ${gift.points - userPoints} pts`}
                </motion.button>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

export default ClientGiftsHome;
