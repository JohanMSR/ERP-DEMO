import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBagIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import PageHeader from '../ui/PageHeader';

const ITEMS = [
  {
    id: 1,
    type: 'product',
    title: 'Kit bienvenida',
    price: '$49',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  },
  {
    id: 2,
    type: 'service',
    title: 'Mantenimiento anual',
    price: '$120',
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
  },
  {
    id: 3,
    type: 'product',
    title: 'Accesorio premium',
    price: '$29',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
  },
];

function ClientClubView() {
  return (
    <div className="space-y-8">
      <PageHeader
        icon={ShoppingBagIcon}
        title="Club de compras"
        subtitle="E-commerce para productos y servicios con tu wallet (vista)."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-premium interactive-lift overflow-hidden flex flex-col"
          >
            <div className="aspect-[4/3] overflow-hidden bg-secondary-100 dark:bg-secondary-800">
              <img
                src={item.img}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                {item.type === 'product' ? (
                  <ShoppingBagIcon className="w-5 h-5 text-orange-500" />
                ) : (
                  <WrenchScrewdriverIcon className="w-5 h-5 text-violet-600" />
                )}
                <span className="text-xs font-semibold uppercase text-secondary-500">
                  {item.type === 'product' ? 'Producto' : 'Servicio'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                {item.title}
              </h3>
              <p className="text-2xl font-bold text-orange-600 mt-2">{item.price}</p>
              <button
                type="button"
                className="mt-4 w-full btn-primary py-2.5 rounded-xl text-sm"
              >
                Comprar con puntos o dinero
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ClientClubView;
