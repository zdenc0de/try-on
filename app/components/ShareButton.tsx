'use client';

import { useState } from 'react';
import { Share2, Link2, Check, X, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  url?: string;
  productId?: string; // Alternativa: construir URL desde productId en cliente
  title: string;
  description?: string;
  price?: number;
  variant?: 'icon' | 'button' | 'full';
  className?: string;
}

export default function ShareButton({
  url,
  productId,
  title,
  description,
  price,
  variant = 'button',
  className = '',
}: ShareButtonProps) {
  // Construir URL si no se proporciona pero sí productId
  const shareUrl = url || (productId && typeof window !== 'undefined'
    ? `${window.location.origin}/producto/${productId}`
    : '');
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = price
    ? `${title} - $${price} MXN`
    : title;

  const fullText = description
    ? `${shareText}\n\n${description}`
    : shareText;

  // Usar Web Share API si está disponible (móviles)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // Usuario canceló o error
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      setShowMenu(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Enlace copiado');
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1500);
    } catch (err) {
      toast.error('No se pudo copiar');
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${fullText}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowMenu(false);
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`, '_blank');
    setShowMenu(false);
  };

  const shareToFacebook = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
    setShowMenu(false);
  };

  // Variante solo icono
  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={handleNativeShare}
          className={`p-2 text-neutral-500 hover:text-orange-500 transition-colors ${className}`}
          title="Compartir"
        >
          <Share2 size={18} />
        </button>

        {showMenu && (
          <ShareMenu
            onClose={() => setShowMenu(false)}
            onCopy={copyToClipboard}
            onWhatsApp={shareToWhatsApp}
            onTwitter={shareToTwitter}
            onFacebook={shareToFacebook}
            copied={copied}
          />
        )}
      </div>
    );
  }

  // Variante botón compacto
  if (variant === 'button') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={handleNativeShare}
          className={`flex items-center gap-2 px-4 py-2 border border-neutral-800 hover:border-orange-600 text-neutral-400 hover:text-orange-500 transition-colors text-sm uppercase font-bold tracking-wider ${className}`}
        >
          <Share2 size={16} />
          Compartir
        </button>

        {showMenu && (
          <ShareMenu
            onClose={() => setShowMenu(false)}
            onCopy={copyToClipboard}
            onWhatsApp={shareToWhatsApp}
            onTwitter={shareToTwitter}
            onFacebook={shareToFacebook}
            copied={copied}
          />
        )}
      </div>
    );
  }

  // Variante completa (botones visibles)
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        type="button"
        onClick={shareToWhatsApp}
        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white transition-colors text-xs uppercase font-bold"
        title="Compartir en WhatsApp"
      >
        <MessageCircle size={14} />
        WhatsApp
      </button>

      <button
        type="button"
        onClick={shareToTwitter}
        className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white transition-colors text-xs uppercase font-bold"
        title="Compartir en X"
      >
        <XIcon size={14} />
        X
      </button>

      <button
        type="button"
        onClick={copyToClipboard}
        className="flex items-center gap-2 px-3 py-2 border border-neutral-700 hover:border-orange-600 text-neutral-400 hover:text-orange-500 transition-colors text-xs uppercase font-bold"
        title="Copiar enlace"
      >
        {copied ? <Check size={14} /> : <Link2 size={14} />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

// Menú desplegable de compartir
function ShareMenu({
  onClose,
  onCopy,
  onWhatsApp,
  onTwitter,
  onFacebook,
  copied,
}: {
  onClose: () => void;
  onCopy: () => void;
  onWhatsApp: () => void;
  onTwitter: () => void;
  onFacebook: () => void;
  copied: boolean;
}) {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div className="absolute right-0 top-full mt-2 bg-neutral-950 border border-neutral-800 z-50 min-w-[180px] shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="p-2 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-500 uppercase tracking-wider">Compartir</span>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-600 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-1">
          <button
            type="button"
            onClick={onWhatsApp}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-900 transition-colors text-left"
          >
            <MessageCircle size={16} className="text-green-500" />
            <span className="text-sm">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onTwitter}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-900 transition-colors text-left"
          >
            <XIcon size={16} className="text-neutral-400" />
            <span className="text-sm">X (Twitter)</span>
          </button>

          <button
            type="button"
            onClick={onFacebook}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-900 transition-colors text-left"
          >
            <FacebookIcon size={16} className="text-blue-500" />
            <span className="text-sm">Facebook</span>
          </button>

          <div className="border-t border-neutral-800 mt-1 pt-1">
            <button
              type="button"
              onClick={onCopy}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-900 transition-colors text-left"
            >
              {copied ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <Link2 size={16} className="text-orange-500" />
              )}
              <span className="text-sm">{copied ? 'Copiado' : 'Copiar enlace'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Icono de X (Twitter)
function XIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Icono de Facebook
function FacebookIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
