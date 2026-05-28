import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  LinkIcon, 
  EyeIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  ShareIcon,
  QrCodeIcon,
  SparklesIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { ClipboardCopy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

function ReferralCard({ link, onViewDetails, compact = false }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareLink = async (linkData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join with my referral link',
          text: 'Get exclusive benefits by joining through my referral!',
          url: `${window.location.origin}/referral/${linkData.code}`
        });
      } catch (error) {
        copyToClipboard(`${window.location.origin}/referral/${linkData.code}`);
      }
    } else {
      copyToClipboard(`${window.location.origin}/referral/${linkData.code}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const downloadQRCode = () => {
    const svg = document.getElementById(`qr-code-${link.code}`);
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
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `referral-qr-${link.code}.png`;
        downloadLink.click();
        URL.revokeObjectURL(url);
        toast.success('QR Code downloaded!');
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="card p-3 sm:p-4 group hover:shadow-medium"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-glow">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-secondary-900 dark:text-secondary-100 truncate max-w-32">
                {link.code}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">
                {link.clicks} clicks
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => copyToClipboard(`${window.location.origin}/referral/${link.code}`)}
              className="p-2 rounded-xl bg-secondary-100/50 hover:bg-secondary-200/50 dark:bg-secondary-800/60 dark:hover:bg-secondary-700/60 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success-600" strokeWidth={2.5} />
              ) : (
                <ClipboardCopy className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-premium group overflow-hidden"
    >
      {/* Header with gradient background */}
      <div className="relative p-6 bg-gradient-to-br from-orange-50/50 to-amber-50/30 border-b border-white/20 dark:from-secondary-900/90 dark:to-secondary-900/70 dark:border-secondary-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
        
        <div className="relative flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
              <LinkIcon className="w-7 h-7 text-white" />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-1">
                {link.code}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-secondary-500 dark:text-secondary-400">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Created {formatDate(link.created_at)}</span>
                </div>
                {link.expires_at && (
                  <div className="flex items-center space-x-1">
                    <span>Expires {formatDate(link.expires_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            {link.is_active ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-2xs font-medium bg-success-100 text-success-700 border border-success-200 dark:bg-success-950/40 dark:text-success-400 dark:border-success-800/50">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-2xs font-medium bg-secondary-100 text-secondary-700 border border-secondary-200 dark:bg-secondary-800/60 dark:text-secondary-300 dark:border-secondary-600">
                <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2" />
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mx-auto mb-2 shadow-glow">
              <EyeIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-secondary-100">{link.clicks}</p>
            <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 font-medium">Total Clicks</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mx-auto mb-2 shadow-glow">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-secondary-100">{link.conversions || 0}</p>
            <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 font-medium">Conversions</p>
          </div>
          
        </div>

        {/* URL Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Referral Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              readOnly
              value={`${window.location.origin}/referral/${link.code}`}
              className="flex-1 min-w-0 px-4 py-3 bg-secondary-50/50 border border-secondary-200/50 rounded-xl text-sm font-mono text-secondary-700"
              onFocus={(e) => e.target.select()}
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => copyToClipboard(`${window.location.origin}/referral/${link.code}`)}
              className={`p-3 rounded-xl border transition-[border-color,background-color,box-shadow] duration-300 shrink-0 ${
                copied 
                  ? 'bg-success-100 border-success-200 text-success-600' 
                  : 'bg-white dark:bg-secondary-800/70 border-secondary-200 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/70'
              }`}
              title={copied ? 'Copiado' : 'Copiar'}
            >
              {copied ? (
                <Check className="w-5 h-5" strokeWidth={2.5} />
              ) : (
                <ClipboardCopy className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => shareLink(link)}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <ShareIcon className="w-4 h-4" />
            <span>Share</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewDetails(link)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <ChartBarIcon className="w-4 h-4" />
            <span>Analytics</span>
          </motion.button>
        </div>

        {/* QR Code Toggle */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowQR(!showQR)}
            className="w-full btn-ghost flex items-center justify-center space-x-2"
          >
            <QrCodeIcon className="w-4 h-4" />
            <span>{showQR ? 'Hide' : 'Show'} QR Code</span>
          </motion.button>
          
          <AnimatePresence>
            {showQR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-3"
              >
                <div className="flex justify-center">
                  <div className="bg-white rounded-2xl p-4 border border-secondary-200/50 shadow-soft">
                    <QRCodeSVG
                      id={`qr-code-${link.code}`}
                      value={`${window.location.origin}/referral/${link.code}`}
                      size={200}
                      level="H"
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      imageSettings={{
                        src: "/icono.png",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadQRCode}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:shadow-glow transition-[box-shadow,transform] duration-300 text-sm font-medium hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Download QR</span>
                  </motion.button>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                    Scan this code to access your referral link
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Premium indicator */}
      {link.is_premium && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-glow">
            <SparklesIcon className="w-3 h-3 text-white" />
            <span className="text-2xs font-medium text-white">Premium</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ReferralCard;
