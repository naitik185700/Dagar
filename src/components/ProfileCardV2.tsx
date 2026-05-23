import React, { useRef, useState } from "react";
import type { Profile } from "../App";


interface ProfileCardProps {
  profile: Profile;
  onRedirectClick: (platform: "whatsapp" | "telegram") => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onRedirectClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  const getWhatsAppLink = (num: string) => {
    const raw = num.trim();
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const cleaned = raw.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleaned}`;
  };

  const getTelegramLink = (user: string) => {
    const raw = user.trim();
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    return `https://t.me/${raw.replace("@", "")}`;
  };

  const waIconBase64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAwCAYAAAA2GtvFAAAAYklEQVR4AeyQIQqAQBQFxW4SBM+hVzDpzbyM2exlLEZBi86UFY3Ctl3+LO9P+fDy7POSeBcSrY+COx30UHllIGywQ6NYCSUoTkXL4tR8i2IkzDDBobgIYRRhMSRhCw8/+rgBAAD//ywAJwAAAAAGSURBVAMAUC4LYZb9hyMAAAAASUVORK5CYII=";

  const tgIconBase64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAwCAYAAAA2GtvFAAAAZklEQVR4AeyQoQ2AMBBFGwwWga5kCjQjMAp7MAOChK0Ilgkgbfp+mopWV7bpu/t54sTvTPGayAup3UfPeaujljDDApvESvhghEtiJ0zwwiPxE04Y4JZgG8c4wCdBjr+J2EOaNfoIAAAA///12n/gAAAABklEQVQDAHrZC2Hp+a0sAAAAAElFTkSuQmCC";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col items-center p-lg rounded-xl casino-card w-full max-w-[320px] mx-auto overflow-hidden"
    >
      {/* Dynamic Cursor Glow Tracker */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(255, 215, 0, 0.15), transparent 40%)`
            : undefined,
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full">
        <div 
          className="rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,215,0,0.4)] mb-md transition-transform duration-500 group-hover:scale-110 flex-shrink-0 vip-avatar-border"
          style={{ width: "104px", height: "104px", minWidth: "104px", minHeight: "104px" }}
        >
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-black">
            <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
          </div>
        </div>
        
        <h3 className="font-headline-md text-headline-md font-bold text-primary mb-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center">{profile.name}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant/80 text-center mb-lg">{profile.details}</p>

        <div className="flex w-full gap-sm mt-xs">
          <a
            href={getWhatsAppLink(profile.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRedirectClick("whatsapp")}
            className="flex-1 flex items-center justify-center gap-xs py-sm rounded-lg bg-gradient-to-b from-[#1a1a1a] to-[#050505] border border-primary/30 hover:border-primary hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all duration-300 group/btn"
          >
            <img style={{ height: "20px" }} src={waIconBase64} alt="WA" className="h-5 w-auto object-contain opacity-80 group-hover/btn:opacity-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
            <span className="font-body-md text-white font-bold tracking-wide uppercase text-sm group-hover/btn:text-primary transition-colors drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">WhatsApp</span>
          </a>
          
          <a
            href={getTelegramLink(profile.telegram)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRedirectClick("telegram")}
            className="flex-1 flex items-center justify-center gap-xs py-sm rounded-lg bg-gradient-to-b from-[#1a1a1a] to-[#050505] border border-secondary/30 hover:border-secondary hover:shadow-[0_0_15px_rgba(255,36,0,0.6)] transition-all duration-300 group/btn"
          >
            <img style={{ height: "20px" }} src={tgIconBase64} alt="TG" className="h-5 w-auto object-contain opacity-80 group-hover/btn:opacity-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
            <span className="font-body-md text-white font-bold tracking-wide uppercase text-sm group-hover/btn:text-secondary transition-colors drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
};
