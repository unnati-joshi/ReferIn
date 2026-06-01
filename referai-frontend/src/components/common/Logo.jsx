// ReferIn brand mark: a node linked into a ring, a referral routed "in".
export const LogoMark = ({ size = 40, className = "" }) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-[var(--shadow)] ${className}`}
    style={{ width: size, height: size }}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* candidate node */}
      <circle cx="5.5" cy="6" r="2.4" fill="currentColor" />
      {/* referral path curving into the network */}
      <path
        d="M5.5 8.6c0 4.2 1.2 6.4 6 7.2"
        stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" fill="none"
        opacity="0.9"
      />
      {/* arrowhead pointing in */}
      <path
        d="M9.6 13.2l2.2 2.6-3.1 1.1"
        stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      {/* the network / company ring */}
      <circle cx="16.5" cy="16" r="4.4" stroke="currentColor" strokeWidth="1.9" fill="none" />
      <circle cx="16.5" cy="16" r="1.5" fill="currentColor" />
    </svg>
  </span>
);

const Logo = ({ size = 40, showWord = true, className = "", wordClassName = "" }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <LogoMark size={size} />
    {showWord && (
      <span className={`font-display font-semibold tracking-tight text-main ${wordClassName}`}>
        Refer<span className="text-[var(--primary)]">In</span>
      </span>
    )}
  </span>
);

export default Logo;
