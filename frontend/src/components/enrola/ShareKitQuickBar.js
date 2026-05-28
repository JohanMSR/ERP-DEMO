import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Mail } from 'lucide-react';

/**
 * Minimal quick-share actions: WhatsApp, Telegram, Email.
 */
function ShareKitQuickBar({ url, message, className = '' }) {
  const text = message || `Únete con mi enlace: ${url}`;
  const encText = encodeURIComponent(text);
  const encUrl = encodeURIComponent(url);

  const actions = [
    {
      key: 'wa',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encText}`,
      className: 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-green-500/25',
      icon: MessageCircle,
    },
    {
      key: 'tg',
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encUrl}&text=${encText}`,
      className: 'bg-[#229ED9] hover:bg-[#1e8fc4] text-white shadow-md shadow-sky-500/25',
      icon: Send,
    },
    {
      key: 'email',
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent('Te invito')}&body=${encText}`,
      className: 'bg-slate-600 hover:bg-slate-700 text-white shadow-md shadow-slate-500/20',
      icon: Mail,
    },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {actions.map(({ key, label, href, className: btnClass, icon: Icon }) => (
        <motion.a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${btnClass}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </motion.a>
      ))}
    </div>
  );
}

export default ShareKitQuickBar;
