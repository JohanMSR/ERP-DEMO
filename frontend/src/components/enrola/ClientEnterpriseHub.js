import React from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

function ClientEnterpriseHub() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Empresa corporativa</h2>
        <p className="text-secondary-600 mt-1">
          E-sign, post-venta e integración ELANTAR One (vista — habilitar según contrato).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6"
        >
          <DocumentTextIcon className="w-10 h-10 text-orange-500 mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            Firma electrónica (e-sign)
          </h3>
          <p className="text-sm text-secondary-600 mb-4">
            Precalificación de ventas, contratos y garantías.
          </p>
          <button type="button" className="btn-secondary text-sm w-full">
            Abrir documentos pendientes
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-premium p-6"
        >
          <WrenchScrewdriverIcon className="w-10 h-10 text-violet-600 mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            Post-venta
          </h3>
          <ul className="text-sm text-secondary-600 space-y-2 list-disc list-inside mb-4">
            <li>Servicios</li>
            <li>Mantenimientos</li>
            <li>Garantías</li>
          </ul>
          <button type="button" className="btn-secondary text-sm w-full">
            Nueva solicitud
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-premium p-6 bg-gradient-to-br from-slate-50 to-white"
        >
          <BuildingLibraryIcon className="w-10 h-10 text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            ELANTAR One
          </h3>
          <p className="text-sm text-secondary-600 mb-4">
            Reclutamiento crea usuario automático; programa clientes crea prospecto
            (corporativo).
          </p>
          <span className="text-xs font-medium text-secondary-500">
            Sincronización en desarrollo
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default ClientEnterpriseHub;
