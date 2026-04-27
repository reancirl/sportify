import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

/**
 * Inline court-and-ball motif for use inside buttons or tight loading states.
 * Renders a tiny SVG court with an animated ball; respects prefers-reduced-motion
 * by falling back to a static circle.
 */
function BallSpinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center justify-center", className)}
    >
      <svg
        viewBox="0 0 32 20"
        width="32"
        height="20"
        fill="none"
        aria-hidden
        className="overflow-visible"
      >
        <style>{`
          @keyframes bs-travel {
            0%   { transform: translateX(0px)  translateY(0px); }
            45%  { transform: translateX(18px) translateY(-4px); }
            50%  { transform: translateX(20px) translateY(0px); }
            95%  { transform: translateX(2px)  translateY(-4px); }
            100% { transform: translateX(0px)  translateY(0px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .bs-ball { animation: none; }
          }
          .bs-ball {
            animation: bs-travel 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
        `}</style>

        {/* Court outline */}
        <rect x="1" y="2" width="30" height="16" stroke="#3e2817" strokeWidth="0.8" />

        {/* Net */}
        <line x1="16" y1="2" x2="16" y2="18" stroke="#f37021" strokeWidth="1" />

        {/* Ball */}
        <circle
          cx="5"
          cy="10"
          r="2.5"
          fill="#f37021"
          stroke="#d85a14"
          strokeWidth="0.5"
          className="bs-ball"
        />
      </svg>
    </span>
  )
}

export { Spinner, BallSpinner }
