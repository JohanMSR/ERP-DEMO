import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  PhotoIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import ShareReferralPanel from './ShareReferralPanel';
import ProgramReferralCard from './ProgramReferralCard';

function VendorReferralPromoView({ user }) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const inputRef = useRef(null);
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const clientCode = user?.referral_codes?.clients || 'VEND-CLI-DEMO';
  const partnerCode = user?.referral_codes?.partners || 'VEND-SOC-DEMO';
  const urlClients = `${base}/referral/${clientCode}`;
  const urlPartners = `${base}/referral/${partnerCode}`;

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    setPhotoUrl(URL.createObjectURL(f));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
          Promoción y tarjeta virtual
        </h2>
        <p className="text-secondary-600 mt-1">
          Sube tu foto, genera tu tarjeta de promotor y comparte enlaces y QR por
          programa (colores distintos: clientes vs socios).
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
          <motion.div
            layout
            className="card-premium p-6 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Foto de perfil
            </h3>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="relative w-32 h-32 rounded-3xl overflow-hidden bg-secondary-100 border-4 border-white shadow-glow flex-shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary-400">
                    <UserCircleIcon className="w-20 h-20" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <PhotoIcon className="w-5 h-5" />
                  Subir foto
                </button>
                <p className="text-xs text-secondary-500">
                  Vista local: la imagen no se envía al servidor en esta demo.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-0 overflow-hidden border-2 border-orange-200/60"
          >
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Promotor</p>
                <p className="text-xl font-bold">{user?.username || 'Vendedor'}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/20 border border-white/30">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="w-8 h-8 text-white/80" />
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 bg-gradient-to-b from-white to-orange-50/30">
              <div className="rounded-2xl bg-white border border-orange-100 p-3 text-center shadow-soft">
                <p className="text-xs font-semibold text-orange-700 mb-2">
                  Clientes
                </p>
                <div className="flex justify-center">
                  <QRCodeSVG
                    value={urlClients}
                    size={96}
                    level="H"
                    fgColor="#c2410c"
                    bgColor="#ffffff"
                  />
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-violet-100 p-3 text-center shadow-soft">
                <p className="text-xs font-semibold text-violet-700 mb-2">Socios</p>
                <div className="flex justify-center">
                  <QRCodeSVG
                    value={urlPartners}
                    size={96}
                    level="H"
                    fgColor="#5b21b6"
                    bgColor="#ffffff"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <ProgramReferralCard
            programKey="clients"
            link={{ link_code: clientCode }}
          />
          <ProgramReferralCard
            programKey="partners"
            link={{ link_code: partnerCode }}
          />
          <ShareReferralPanel
            url={urlClients}
            message={`Soy promotor Enrola — programa clientes: ${urlClients}`}
          />
        </div>
      </div>
    </div>
  );
}

export default VendorReferralPromoView;
