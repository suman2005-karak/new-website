export default function BoltLoader() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24">
        {/* Lightning Bolt SVG */}
        <svg
          className="w-24 h-24 animate-pulse"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path
            d="M32 2L12 34H28L26 62L52 30H36L32 2Z"
            fill="#6366F1"
            filter="url(#glow)"
            className="animate-lightning"
          />
        </svg>
      </div>
    </div>
  );
}
