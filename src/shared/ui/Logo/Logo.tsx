interface LogoProps {
  showTagline?: boolean
}

export function Logo({ showTagline = true }: LogoProps) {
  return (
    <div className="logo-mark">
      <div className="logo-icon">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <div>
        <div className="logo-text">SignalOS</div>
        {showTagline && <div className="logo-sub">Signal to Skill</div>}
      </div>
    </div>
  )
}
