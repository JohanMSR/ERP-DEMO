import React from 'react';
import { motion } from 'framer-motion';
import {
  BanknotesIcon,
  WalletIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '../ui/PageHeader';

const MOVEMENTS = [
  { t: 'Bono programa socios', a: '+$40.00', kind: 'money' },
  { t: 'Canje puntos → cupón', a: '-500 pts', kind: 'pts' },
  { t: 'Recompensa referido', a: '+120 pts', kind: 'pts' },
];

function ClientWalletView() {
  return (
    <div className="space-y-8">
      <PageHeader
        icon={WalletIcon}
        title="Wallet"
        subtitle="Puntos y dinero: recompensas habilitadas y saldo listo para cobrar (vista)."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium interactive-lift p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-secondary-900/80 dark:to-orange-950/25 dark:border-orange-500/15"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Puntos</h3>
            <WalletIcon className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-4xl font-bold text-orange-600">3.240</p>
          <p className="text-sm text-secondary-600 mt-2">Acumulados en campañas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-premium interactive-lift p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">
              Dinero habilitado
            </h3>
            <BanknotesIcon className="w-8 h-8 text-success-500" />
          </div>
          <p className="text-4xl font-bold text-success-600">$180.00</p>
          <p className="text-sm text-secondary-600 mt-2">
            Disponible según reglas del programa
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-premium interactive-lift p-6 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 dark:from-emerald-950/30 dark:to-secondary-900/80 dark:border-emerald-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Listo para cobrar</h3>
            <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-4xl font-bold text-emerald-700">$95.00</p>
          <p className="text-sm text-secondary-600 mt-2">
            Solicita retiro cuando esté habilitado
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="w-5 h-5 text-secondary-500" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
            Movimientos recientes
          </h3>
        </div>
        <ul className="divide-y divide-secondary-100 dark:divide-secondary-700/60">
          {MOVEMENTS.map((row) => (
            <li
              key={row.t}
              className="py-3 flex justify-between text-sm text-secondary-800 dark:text-secondary-200"
            >
              <span>{row.t}</span>
              <span
                className={
                  row.kind === 'money' ? 'text-success-700 font-semibold' : ''
                }
              >
                {row.a}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

export default ClientWalletView;
