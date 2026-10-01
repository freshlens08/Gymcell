import { BatteryFullIcon, BatteryLowIcon, BatteryMediumIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-2xl border bg-card p-4", className)}>{children}</section>;
}

export function PanelTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{children}</h2>
      {action}
    </div>
  );
}

export function Metric({
  label,
  value,
  unit,
  hint,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  hint?: string;
  tone?: "good" | "warn";
}) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2.5">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="font-mono text-xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {hint && (
        <div
          className={cn(
            "mt-0.5 text-[11px]",
            tone === "good" && "text-primary",
            tone === "warn" && "text-accent",
            !tone && "text-muted-foreground",
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

// Four bars, like a phone's signal meter. RSSI -45 dBm or better is full.
export function SignalBars({ rssi, className }: { rssi: number; className?: string }) {
  const level = rssi >= -55 ? 4 : rssi >= -68 ? 3 : rssi >= -80 ? 2 : 1;
  return (
    <span className={cn("inline-flex items-end gap-0.5", className)} aria-label={`Signal ${level} of 4`}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn("w-1 rounded-sm", i <= level ? "bg-primary" : "bg-muted-foreground/30")}
          style={{ height: 3 + i * 3 }}
        />
      ))}
    </span>
  );
}

export function BatteryLabel({ percent, className }: { percent: number; className?: string }) {
  const Icon = percent < 20 ? BatteryLowIcon : percent < 60 ? BatteryMediumIcon : BatteryFullIcon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs tabular-nums", percent < 20 && "text-accent", className)}>
      <Icon className="size-4" />
      {percent}%
    </span>
  );
}

export function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} className="stroke-muted" strokeWidth="9" fill="none" />
        <circle
          cx="50"
          cy="50"
          r={r}
          className="stroke-primary transition-[stroke-dashoffset] duration-700"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-bold tabular-nums">{score}</span>
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase">Score</span>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, body, children }: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-10 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-primary">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{body}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function timeAgo(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

export function signed(n: number, digits = 1): string {
  const v = n.toFixed(digits);
  return n > 0 ? `+${v}` : v;
}
