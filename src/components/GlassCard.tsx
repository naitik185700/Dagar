import React, { useRef, useState } from "react";

interface GlassCardProps {
  href: string;
  glowColor: string; // Tailwind color class or hex, e.g., 'rgba(78,222,163,0.15)'
  borderColorHover: string; // e.g. 'group-hover:border-primary/30'
  focusRingColor: string; // e.g. 'focus-visible:ring-primary'
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  href,
  glowColor,
  borderColorHover,
  focusRingColor,
  children,
  onClick,
}) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <a
      ref={cardRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`group relative flex-1 flex flex-col items-center justify-center p-xl rounded-xl glass-card transition-all duration-500 ease-out hover:scale-[1.03] outline-none focus-visible:ring-2 ${borderColorHover} ${focusRingColor}`}
    >
      {/* Dynamic Cursor Glow Tracker */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`
            : undefined,
        }}
      />
      {children}
    </a>
  );
};
