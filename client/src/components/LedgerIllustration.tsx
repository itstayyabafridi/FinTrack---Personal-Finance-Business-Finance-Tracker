export const LedgerIllustration = () => (
  <svg width="112" height="72" viewBox="0 0 112 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background faint trend lines */}
    <path d="M76 18 L86 10 L96 17 L106 8" stroke="#D3E2F8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="3 3"/>
    <path d="M78 27 L88 22 L98 25" stroke="#E2EAF4" strokeWidth="1.2" strokeLinecap="round" fill="none"/>

    {/* Book soft shadow */}
    <ellipse cx="56" cy="58" rx="46" ry="6" fill="#E8F0FA" opacity="0.8"/>

    {/* Book Pages Base */}
    <path d="M16 48 C 30 51, 46 51, 56 48 L 56 24 C 46 27, 30 27, 16 24 Z" fill="#F1F6FD" stroke="#C8DAEF" strokeWidth="1.2"/>
    <path d="M16 43 C 30 46, 46 46, 56 43 L 56 19 C 46 22, 30 22, 16 19 Z" fill="#FFFFFF" stroke="#C8DAEF" strokeWidth="1.2"/>

    <path d="M56 48 C 66 51, 82 51, 96 48 L 96 24 C 82 27, 66 27, 56 24 Z" fill="#EBF2FA" stroke="#C8DAEF" strokeWidth="1.2"/>
    <path d="M56 43 C 66 46, 82 46, 96 43 L 96 19 C 82 22, 66 22, 56 19 Z" fill="#FFFFFF" stroke="#C8DAEF" strokeWidth="1.2"/>

    {/* Center Spine Stitch */}
    <path d="M56 19 L 56 45" stroke="#2F6BFF" strokeWidth="1.5" opacity="0.6"/>

    {/* Page text lines */}
    <line x1="22" y1="26" x2="48" y2="24" stroke="#DDE7F3" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="22" y1="31" x2="44" y2="29" stroke="#DDE7F3" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="22" y1="36" x2="38" y2="34" stroke="#DDE7F3" strokeWidth="1.5" strokeLinecap="round"/>

    <line x1="64" y1="24" x2="90" y2="26" stroke="#DDE7F3" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="64" y1="29" x2="86" y2="31" stroke="#DDE7F3" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="64" y1="34" x2="78" y2="36" stroke="#DDE7F3" strokeWidth="1.5" strokeLinecap="round"/>

    {/* Blue bookmark ribbon */}
    <path d="M56 19 C 56 14, 60 12, 64 12 L 64 20 L 60 18 L 56 20 Z" fill="#2F6BFF" opacity="0.85"/>

    {/* Magnifying Glass Detail */}
    <circle cx="25" cy="51" r="7" fill="#FFFFFF" stroke="#2F6BFF" strokeWidth="1.5"/>
    <circle cx="25" cy="51" r="4" stroke="#2F6BFF" strokeWidth="1" strokeDasharray="2 2"/>
    <line x1="30" y1="56" x2="36" y2="62" stroke="#2F6BFF" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);

export const CompassMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="12" stroke="#2F6BFF" strokeWidth="2"/>
    <path d="M14 4L16.5 9.5H11.5L14 4Z" fill="#2F6BFF"/>
    <path d="M14 24L16.5 18.5H11.5L14 24Z" fill="#2F6BFF" opacity="0.5"/>
    <path d="M4 14L9.5 16.5V11.5L4 14Z" fill="#2F6BFF" opacity="0.5"/>
    <path d="M24 14L18.5 16.5V11.5L24 14Z" fill="#2F6BFF"/>
    <circle cx="14" cy="14" r="3" fill="#2F6BFF"/>
  </svg>
);
