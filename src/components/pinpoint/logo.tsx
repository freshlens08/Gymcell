import { useId } from "react";

import { cn } from "@/lib/utils";

// Keep in sync with public/pinpoint/logo-mark.svg.
export function PinPointMark({ className, title = "PinPoint" }: { className?: string; title?: string }) {
  const id = useId();
  const turf = `${id}-turf`;
  const ball = `${id}-ball`;
  return (
    <svg viewBox="0 0 64 64" fill="none" role="img" aria-label={title} className={className}>
      <defs>
        <linearGradient id={turf} x1="17" y1="10" x2="51" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5BF08F" />
          <stop offset="1" stopColor="#0E9F58" />
        </linearGradient>
        <radialGradient id={ball} cx="30" cy="22" r="14" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DDEFE4" />
        </radialGradient>
      </defs>
      <g transform="translate(-2 1)">
        <path d="M12.3 39.5A25 25 0 0 1 51.7 9.3" stroke="#FF6B4A" strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="51.7" cy="9.3" r="3" fill="#FF6B4A" />
        <path d="M34 60C34 60 17 43 17 27A17 17 0 0 1 51 27C51 43 34 60 34 60Z" fill={`url(#${turf})`} />
        <circle cx="34" cy="27" r="11" fill={`url(#${ball})`} />
        <g fill="#0E9F58" opacity=".28">
          {DIMPLES.map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      </g>
    </svg>
  );
}

const DIMPLES: [number, number, number][] = [
  [30.4, 20.7, 0.73], [34, 20.7, 0.76], [37.6, 20.7, 0.73],
  [28.6, 23.9, 0.76], [32.2, 23.9, 0.84], [35.8, 23.9, 0.84], [39.4, 23.9, 0.76],
  [26.8, 27, 0.73], [30.4, 27, 0.84], [34, 27, 0.95], [37.6, 27, 0.84], [41.2, 27, 0.73],
  [28.6, 30.1, 0.76], [32.2, 30.1, 0.84], [35.8, 30.1, 0.84], [39.4, 30.1, 0.76],
  [30.4, 33.3, 0.73], [34, 33.3, 0.76], [37.6, 33.3, 0.73],
];

export function PinPointWordmark({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-heading font-bold tracking-tight", className)}>
      <PinPointMark className={cn("size-8", markClassName)} />
      <span>
        Pin<span className="text-primary">Point</span>
      </span>
    </span>
  );
}
