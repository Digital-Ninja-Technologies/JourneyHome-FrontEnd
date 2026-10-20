export function Logo({ className }: { className?: string }) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg role="img" aria-label="Journey Home" width="28" height="28" viewBox="0 0 64 64">
        <path d="M16 56 V30 A16 16 0 0 1 48 30 V56" fill="none" stroke="#0F2420" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="32" cy="40" r="6" fill="#D4A55A" />
        <line x1="8" y1="56" x2="56" y2="56" stroke="#0F2420" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
      <span className="font-serif text-[21px] tracking-tight text-foreground">
        Journey <span className="italic text-accent">Home</span>
      </span>
    </span>
  );
}
