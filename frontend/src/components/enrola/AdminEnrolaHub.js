import React from 'react';
import { motion } from 'framer-motion';
import {
  LinkIcon,
  PhoneIcon,
  PlayCircleIcon,
  GiftIcon,
  TrophyIcon,
  ClipboardDocumentCheckIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';

const packages = [
  { id: 1, label: 'Paquete 1', amount: 300, balance: 200 },
  { id: 2, label: 'Paquete 2', amount: 500, balance: 120 },
];

function AdminEnrolaHub() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Centro Enrola (empresa)</h2>
        <p className="text-secondary-600 mt-1">
          Enlaces por programa, soporte, formación, incentivos, seguimiento y
          marketplace de paquetes (vista).
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Enlaces por programa
            </h3>
          </div>
          <p className="text-sm text-secondary-600 mb-4">
            Crea enlaces distintos: programa de clientes y programa de
            reclutamiento de socios.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/50 px-4 py-3">
              <span className="text-sm font-medium text-orange-900">Clientes</span>
              <code className="text-xs bg-white px-2 py-1 rounded-lg border">
                /r/empresa-clientes
              </code>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3">
              <span className="text-sm font-medium text-violet-900">Socios</span>
              <code className="text-xs bg-white px-2 py-1 rounded-lg border">
                /r/empresa-socios
              </code>
            </div>
          </div>
          <button type="button" className="mt-4 btn-secondary w-full sm:w-auto">
            Configurar enlaces
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-premium p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <PhoneIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Línea de soporte
            </h3>
          </div>
          <p className="text-sm text-secondary-600 mb-4">
            Contacto directo para administradores y escalamiento.
          </p>
          <ul className="space-y-2 text-sm text-secondary-800">
            <li>Teléfono: +1 (555) 010-2030</li>
            <li>WhatsApp empresas: disponible 8:00–20:00</li>
            <li>Correo: soporte@enrola.app</li>
          </ul>
        </motion.div>
      </section>

      <section className="card-premium p-6">
        <div className="flex items-center gap-3 mb-4">
          <PlayCircleIcon className="w-8 h-8 text-orange-500" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
            Videos educativos animados
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Campañas y paquetes', 'Ads en Enrola', 'Wallet y regalos'].map(
            (title, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-secondary-100 bg-secondary-50/50 aspect-video flex items-center justify-center text-secondary-600 text-sm font-medium"
              >
                {title}
                <span className="sr-only"> — placeholder video</span>
              </motion.div>
            )
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <GiftIcon className="w-7 h-7 text-amber-500" />
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Incentivos de regalos por programa
            </h3>
          </div>
          <p className="text-sm text-secondary-600 mb-4">
            Define reglas distintas para clientes vs reclutamiento de socios.
          </p>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Programa clientes
            </label>
            <input
              className="input-field"
              placeholder="Ej. puntos por referido calificado"
              readOnly
            />
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mt-2">
              Programa socios
            </label>
            <input
              className="input-field"
              placeholder="Ej. primeros 3 negocios $250"
              readOnly
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-premium p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrophyIcon className="w-7 h-7 text-orange-500" />
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Incentivos fuerza de ventas
            </h3>
          </div>
          <p className="text-sm text-secondary-600 mb-4">
            Bonos por metas, ranking y desempeño.
          </p>
          <ul className="text-sm text-secondary-800 space-y-2 list-disc list-inside">
            <li>Bono por volumen de referidos</li>
            <li>Meta mensual de conversiones</li>
            <li>Reconocimiento top vendedor</li>
          </ul>
          <button type="button" className="mt-4 btn-primary">
            Configurar incentivos
          </button>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <ClipboardDocumentCheckIcon className="w-7 h-7 text-success-600" />
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Seguimiento al cumplimiento de regalos
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-secondary-500 border-b">
                  <th className="py-2 pr-4">Cliente</th>
                  <th className="py-2 pr-4">Regalo</th>
                  <th className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="text-secondary-800">
                <tr className="border-b border-secondary-100">
                  <td className="py-2 pr-4">María G.</td>
                  <td className="py-2 pr-4">Amazon $50</td>
                  <td className="py-2">
                    <span className="text-success-700 font-medium">Entregado</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Luis P.</td>
                  <td className="py-2 pr-4">Visa $25</td>
                  <td className="py-2">
                    <span className="text-amber-700 font-medium">En proceso</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-premium p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <MegaphoneIcon className="w-7 h-7 text-red-500" />
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Ads — fondos de campaña
            </h3>
          </div>
          <p className="text-sm text-secondary-600 mb-4">
            Administración de publicidad para adquirir nuevos clientes en Enrola.
          </p>
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-red-900">Saldo Ads</span>
            <span className="text-xl font-bold text-red-700">$350.00</span>
          </div>
          <button type="button" className="mt-4 btn-secondary w-full">
            Gestionar campañas
          </button>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCartIcon className="w-7 h-7 text-orange-500" />
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Marketplace — paquetes de regalos
            </h3>
          </div>
          <p className="text-sm text-secondary-600 mb-4">
            Compra paquetes ($300, $500, $1000, $1500…) para financiar campañas.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[300, 500, 1000, 1500].map((n) => (
              <button
                key={n}
                type="button"
                className="rounded-xl border border-secondary-200 py-3 text-sm font-semibold hover:border-orange-300 hover:bg-orange-50/50"
              >
                ${n}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-premium p-6 bg-gradient-to-br from-emerald-50 to-white"
        >
          <div className="flex items-center gap-3 mb-4">
            <BanknotesIcon className="w-7 h-7 text-emerald-600" />
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Wallet empresa — gasto del paquete
            </h3>
          </div>
          {packages.map((p) => (
            <div
              key={p.id}
              className="mb-4 last:mb-0 rounded-xl border border-emerald-100 bg-white/80 p-4"
            >
              <div className="flex justify-between text-sm font-medium text-secondary-800">
                <span>{p.label}</span>
                <span>${p.amount}</span>
              </div>
              <p className="text-xs text-secondary-600 mt-2">
                Consumido: ${p.amount - p.balance} · Disponible:{' '}
                <strong>${p.balance}</strong>
              </p>
              <div className="mt-2 h-2 rounded-full bg-secondary-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${(p.balance / p.amount) * 100}%`,
                  }}
                />
              </div>
              <button type="button" className="mt-3 text-sm text-orange-700 font-medium">
                Solicitar +$100 para completar paquete (vista)
              </button>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

export default AdminEnrolaHub;
