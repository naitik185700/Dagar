import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, Copy, Check, QrCode } from "lucide-react";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://example.com";

  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "directory-qr-code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-md">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-[384px] glass-card border-white/20 rounded-3xl p-md sm:p-lg flex flex-col items-center shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-full hover:bg-white/10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-sm sm:p-md rounded-full bg-primary/10 border border-primary/20 text-primary mb-md mt-sm">
          <QrCode className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>

        <h2 className="font-headline-sm sm:font-headline-md text-on-surface mb-xs text-center">Share Directory</h2>
        <p className="font-body-sm sm:font-body-md text-on-surface-variant text-center mb-lg">
          Scan to view the team directory
        </p>

        {/* QR Code Container with Glow */}
        <div className="relative p-sm sm:p-md rounded-2xl bg-white shadow-[0_0_40px_rgba(78,222,163,0.3)] mb-lg group" ref={qrRef}>
          <QRCodeCanvas
            value={currentUrl}
            size={180}
            level="H"
            includeMargin={false}
            fgColor="#002113"
            bgColor="#ffffff"
            className="rounded-lg transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-sm">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-sm py-sm rounded-xl bg-primary text-on-primary font-body-lg hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
          >
            <Download className="w-5 h-5" />
            Download QR
          </button>
          
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-sm py-sm rounded-xl bg-surface-container-low border border-white/10 text-on-surface font-body-lg hover:bg-white/5 hover:border-white/20 transition-all"
          >
            {copied ? <Check className="w-5 h-5 text-primary" /> : <Copy className="w-5 h-5" />}
            {copied ? "Copied!" : "Copy Page Link"}
          </button>
        </div>
      </div>
    </div>
  );
};
