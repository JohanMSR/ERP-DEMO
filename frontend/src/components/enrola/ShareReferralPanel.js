import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import ShareKitQuickBar from './ShareKitQuickBar';

function ShareReferralPanel({ url, message, className = '', showCopyAll = true }) {
  const text = message || `Únete con mi enlace Enrola: ${url}`;
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Mensaje copiado');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  return (
    <div className={`rounded-2xl border border-white/40 bg-white/50 p-4 shadow-sm backdrop-blur-sm ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 mb-2">Compartir rápido</p>
      <ShareKitQuickBar url={url} message={message} className="mb-4" />

      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 mb-2">Mensaje sugerido</p>
      <div className="flex gap-2 rounded-xl border border-secondary-100 bg-secondary-50/80 p-2">
        <p className="min-w-0 flex-1 text-sm leading-snug text-secondary-800">{text}</p>
        {showCopyAll && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={copyAll}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              copied
                ? 'border-success-300 bg-success-50 text-success-600'
                : 'border-secondary-200 bg-white text-secondary-600 hover:border-orange-200'
            }`}
            title="Copiar mensaje"
          >
            {copied ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <Copy className="h-5 w-5" />}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default ShareReferralPanel;
