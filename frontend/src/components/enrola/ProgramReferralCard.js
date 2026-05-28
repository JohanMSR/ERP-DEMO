import React, { Fragment, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Link as LinkIconLucide,
  ClipboardCopy,
  Check,
  ArrowDownToLine,
  Share2,
} from 'lucide-react';
import {
  LinkIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  CheckIcon,
  UserGroupIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ShareReferralPanel from './ShareReferralPanel';
import ShareKitQuickBar from './ShareKitQuickBar';

const themes = {
  clients: {
    label: 'Programa clientes',
    subtitle: 'Nuevos clientes',
    gradient: 'from-orange-500 to-amber-500',
    border: 'border-orange-200/60',
    qrFg: '#c2410c',
    Icon: UserGroupIcon,
  },
  partners: {
    label: 'Programa socios',
    subtitle: 'Reclutamiento de socios',
    gradient: 'from-violet-600 to-indigo-600',
    border: 'border-violet-200/60',
    qrFg: '#5b21b6',
    Icon: BriefcaseIcon,
  },
};

function ProgramReferralCard({ programKey, link, shareMessage }) {
  const theme = themes[programKey] || themes.clients;
  const Icon = theme.Icon;
  const code = link?.link_code || link?.code || 'DEMO';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullUrl = `${baseUrl}/referral/${code}`;
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Enlace copiado');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  const defaultMsg =
    shareMessage ||
    (programKey === 'partners'
      ? `Gana con el programa de socios Enrola. Primeros 3 negocios: $250. Invitación: ${fullUrl}`
      : `Únete con mi programa de clientes Enrola y obtén beneficios exclusivos: ${fullUrl}`);

  const downloadQRCode = () => {
    const svg = document.getElementById(`qr-${programKey}-${code}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `referral-qr-${code}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('QR descargado');
      });
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card-premium overflow-hidden border-2 ${theme.border}`}
      >
        <div className={`relative p-6 bg-gradient-to-br ${theme.gradient} text-white`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shadow-glow">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{theme.label}</h3>
                <p className="text-sm text-white/90">{theme.subtitle}</p>
                <p className="mt-1 font-mono text-sm bg-black/10 inline-block px-2 py-0.5 rounded-lg">
                  {code}
                </p>
              </div>
            </div>
            <LinkIcon className="w-8 h-8 text-white/80 shrink-0" />
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Enlace personalizado</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <input
                readOnly
                value={fullUrl}
                className="min-w-0 flex-1 rounded-xl border border-secondary-200 bg-secondary-50/80 px-3 py-2.5 text-xs font-mono text-secondary-800 outline-none ring-orange-400/30 focus:ring-2"
                onFocus={(e) => e.target.select()}
              />
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={copy}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
                    copied
                      ? 'border-success-300 bg-success-50 text-success-700'
                      : 'border-secondary-200 bg-white text-secondary-800 hover:border-orange-200'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                      <span className="hidden sm:inline">Copiado</span>
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="h-4 w-4" />
                      <span className="hidden sm:inline">Copiar</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-secondary-500">Compartir en:</span>
              <ShareKitQuickBar url={fullUrl} message={defaultMsg} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShareModalOpen(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-orange-200/80 bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-4 py-2.5 text-sm font-semibold text-orange-800 min-w-[200px]"
            >
              <Share2 className="h-4 w-4" />
              Kit de compartir
            </motion.button>
          </div>

          <div className="pt-2 border-t border-white/20">
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowQR(!showQR)}
              className="w-full btn-ghost flex items-center justify-center gap-2"
            >
              <QrCodeIcon className="w-4 h-4" />
              <span>{showQR ? 'Ocultar' : 'Mostrar'} QR</span>
            </motion.button>
            <AnimatePresence>
              {showQR && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex flex-col items-center gap-3"
                >
                  <div className="rounded-2xl border border-secondary-100 dark:border-secondary-600 bg-white dark:bg-secondary-800 p-4 shadow-soft">
                    <QRCodeSVG
                      id={`qr-${programKey}-${code}`}
                      value={fullUrl}
                      size={192}
                      level="H"
                      includeMargin
                      bgColor="#ffffff"
                      fgColor={theme.qrFg}
                    />
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={downloadQRCode}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-medium text-white shadow-soft"
                  >
                    <ArrowDownToLine className="h-4 w-4" />
                    Descargar QR
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <Transition appear show={shareModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={setShareModalOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-6 shadow-2xl backdrop-blur-xl">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <Dialog.Title className="text-lg font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                        <LinkIconLucide className="h-5 w-5 text-orange-500" />
                        Invitación — {theme.label}
                      </Dialog.Title>
                      <p className="mt-1 text-sm text-secondary-600">Copia el enlace o comparte en un toque.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShareModalOpen(false)}
                      className="rounded-xl p-2 text-secondary-500 hover:bg-secondary-100"
                      aria-label="Cerrar"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase text-secondary-500">Tu enlace</label>
                      <div className="mt-1 flex gap-2">
                        <input readOnly value={fullUrl} className="flex-1 rounded-xl border border-secondary-200 bg-secondary-50/90 px-3 py-2 text-xs font-mono" />
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={copy}
                          className={`rounded-xl border px-3 ${copied ? 'border-success-300 bg-success-50' : 'border-secondary-200 bg-white'}`}
                        >
                          {copied ? <CheckIcon className="h-5 w-5 text-success-600" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                        </motion.button>
                      </div>
                    </div>
                    <ShareKitQuickBar url={fullUrl} message={defaultMsg} className="justify-center" />
                    <ShareReferralPanel url={fullUrl} message={defaultMsg} showCopyAll />
                    <div className="flex justify-center rounded-2xl border border-secondary-100 dark:border-secondary-600 bg-white dark:bg-secondary-800 p-4">
                      <QRCodeSVG
                        value={fullUrl}
                        size={160}
                        level="H"
                        includeMargin
                        bgColor="#ffffff"
                        fgColor={theme.qrFg}
                      />
                    </div>
                    <p className="text-center text-xs text-secondary-500">Escanea para abrir tu invitación</p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default ProgramReferralCard;
