import React from "react";
import type { Profile } from "../App";
import { ProfileCard } from "./ProfileCardV2";
import { Settings, QrCode } from "lucide-react";

interface RedirectScreenProps {
  profiles: Profile[];
  onRedirectClick: (platform: "whatsapp" | "telegram") => void;
  onOpenSettings: () => void;
  onOpenQR: () => void;
}

export const RedirectScreen: React.FC<RedirectScreenProps> = ({
  profiles,
  onRedirectClick,
  onOpenSettings,
  onOpenQR,
}) => {
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get("admin") === "1";

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
      {/* Absolute Header with Admin Controls */}
      <div className="absolute top-md right-md flex items-center gap-sm z-50">
        <button
          onClick={onOpenQR}
          className="p-sm rounded-full bg-surface-container-low border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-on-surface-variant hover:text-on-surface shadow-lg"
          aria-label="Share QR Code"
        >
          <QrCode className="w-5 h-5" />
        </button>
        {isAdmin && (
          <button
            onClick={onOpenSettings}
            className="p-sm rounded-full bg-surface-container-low border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-on-surface-variant hover:text-on-surface shadow-lg"
            aria-label="Admin Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="flex flex-col items-center mb-xl mt-xl z-20 relative">
        <h1 className="font-display-lg text-display-lg text-primary text-center mb-xs drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] font-black uppercase tracking-widest italic">
          VIP Hosts
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[512px] text-center uppercase tracking-wide text-white font-semibold shadow-black drop-shadow-md">
          Connect directly with our elite dealers via WhatsApp or Telegram.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg z-20 mb-2xl">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onRedirectClick={onRedirectClick}
          />
        ))}
      </div>

      {/* Ambient background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity" 
          style={{ backgroundImage: "url('/bg-casino.png')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute top-0 right-0 w-full h-full bg-radial-gradient-primary opacity-20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-radial-gradient-secondary opacity-20 blur-[120px]"></div>
      </div>
    </div>
  );
};
