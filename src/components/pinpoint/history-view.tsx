"use client";

import { useState } from "react";
import { HistoryIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { average, type Swing } from "@/lib/pinpoint/analysis";
import { CLUBS, clubById } from "@/lib/pinpoint/clubs";

import { usePinPoint } from "./pinpoint-provider";
import { EmptyState, Panel, PanelTitle } from "./ui";

export function HistoryView() {
  const { swings, clearHistory } = usePinPoint();

  if (swings.length === 0) {
    return (
      <EmptyState
        icon={<HistoryIcon className="size-5" />}
        title="No history yet"
        body="Swings you capture are saved on this device so you can track your speed, gapping and consistency over time."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Panel>
        <PanelTitle>Club speed · last {Math.min(30, swings.length)} swings</PanelTitle>
        <SpeedTrend swings={swings.slice(0, 30).reverse()} />
      </Panel>
      <Panel>
        <PanelTitle>Gapping · average carry</PanelTitle>
        <Gapping swings={swings} />
      </Panel>
      <Panel>
        <PanelTitle
          action={
            <Button size="xs" variant="ghost" className="text-muted-foreground" onClick={clearHistory}>
              <Trash2Icon /> Clear
            </Button>
          }
        >
          All swings
        </PanelTitle>
        <ul className="divide-y">
          {swings.slice(0, 50).map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="w-8 font-mono text-xs font-bold text-primary">{clubById(s.clubId)?.short}</span>
              <span className="flex-1 text-muted-foreground">
                {swingTime(s.at)} · {s.shape}
              </span>
              <span className="font-mono tabular-nums">{s.clubSpeedMph.toFixed(1)}</span>
              <span className="w-10 text-right font-mono text-muted-foreground tabular-nums">{s.score}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function swingTime(at: number): string {
  const d = new Date(at);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString([], { weekday: "short" })} ${time}`;
}

function SpeedTrend({ swings }: { swings: Swing[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 320;
  const H = 150;
  const pad = { l: 30, r: 10, t: 12, b: 20 };
  const speeds = swings.map((s) => s.clubSpeedMph);
  const lo = Math.floor((Math.min(...speeds) - 3) / 5) * 5;
  const hi = Math.ceil((Math.max(...speeds) + 3) / 5) * 5;
  const x = (i: number) => pad.l + (swings.length === 1 ? 0.5 : i / (swings.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / Math.max(1, hi - lo)) * (H - pad.t - pad.b);
  const ticks = [lo, (lo + hi) / 2, hi];
  const line = swings.map((s, i) => `${i ? "L" : "M"}${x(i)} ${y(s.clubSpeedMph)}`).join("");
  const h = hover !== null ? swings[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        role="img"
        aria-label="Club speed trend"
        onPointerLeave={() => setHover(null)}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (swings.length - 1));
          setHover(Math.max(0, Math.min(swings.length - 1, i)));
        }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="stroke-border" />
            <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">
              {t.toFixed(0)}
            </text>
          </g>
        ))}
        <path d={line} fill="none" className="stroke-primary" strokeWidth="2" strokeLinejoin="round" />
        {h && hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} className="stroke-muted-foreground/50" />
            <circle cx={x(hover)} cy={y(h.clubSpeedMph)} r="4.5" className="fill-primary stroke-card" strokeWidth="2" />
          </>
        )}
        <text x={pad.l} y={H - 4} className="fill-muted-foreground text-[9px]">Older</text>
        <text x={W - pad.r} y={H - 4} textAnchor="end" className="fill-muted-foreground text-[9px]">Latest</text>
      </svg>
      {h && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border bg-popover px-2 py-1 text-xs shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          <span className="font-semibold">{clubById(h.clubId)?.short}</span>{" "}
          <span className="font-mono">{h.clubSpeedMph.toFixed(1)} mph</span>
        </div>
      )}
    </div>
  );
}

function Gapping({ swings }: { swings: Swing[] }) {
  const rows = CLUBS.map((c) => {
    const carries = swings.filter((s) => s.clubId === c.id && s.carryYds > 0).map((s) => s.carryYds);
    return { club: c, carry: carries.length ? average(carries) : 0, n: carries.length };
  }).filter((r) => r.n > 0);
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Hit a few full shots to see your yardages.</p>;
  const max = Math.max(...rows.map((r) => r.carry));

  return (
    <ul className="flex flex-col gap-1.5">
      {rows.map(({ club, carry, n }) => (
        <li key={club.id} className="flex items-center gap-2 text-xs" title={`${club.name}: ${carry.toFixed(0)} yds over ${n} swings`}>
          <span className="w-7 font-mono font-bold text-muted-foreground">{club.short}</span>
          <div className="h-4 flex-1">
            <div className="h-full rounded-r bg-primary/80" style={{ width: `${(carry / max) * 100}%` }} />
          </div>
          <span className="w-16 text-right font-mono tabular-nums">
            {carry.toFixed(0)} <span className="text-muted-foreground">yds</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
