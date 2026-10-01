import type { Swing } from "@/lib/pinpoint/analysis";

// Down-the-line view of the club head path. The backswing and downswing are
// drawn from the swing plane and club path: an out-to-in path loops the
// downswing above the backswing ("over the top"), in-to-out drops it under.
export function SwingPlaneView({ swing }: { swing: Swing }) {
  const plane = (swing.swingPlaneDeg * Math.PI) / 180;
  const B = { x: 70, y: 196 };
  const L = 170;
  const T = { x: B.x + L * Math.cos(plane), y: B.y - L * Math.sin(plane) };
  const mid = { x: (B.x + T.x) / 2, y: (B.y + T.y) / 2 };
  const n = { x: Math.sin(plane), y: Math.cos(plane) }; // normal, pointing under the plane
  const back = 70;
  const down = Math.max(10, Math.min(130, back + swing.clubPathDeg * 9));
  const ctrl = (d: number) => `${mid.x + n.x * d} ${mid.y + n.y * d}`;
  const verdict = swing.clubPathDeg < -2 ? "Over the top" : swing.clubPathDeg > 2 ? "Under plane" : "On plane";

  return (
    <figure>
      <svg viewBox="0 0 320 220" className="w-full" role="img" aria-label={`Swing plane: ${verdict}`}>
        <line x1="20" y1="204" x2="300" y2="204" className="stroke-border" strokeWidth="2" />
        {/* Plane line */}
        <line
          x1={B.x}
          y1={B.y}
          x2={B.x + 230 * Math.cos(plane)}
          y2={B.y - 230 * Math.sin(plane)}
          className="stroke-muted-foreground/40"
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />
        <text x={B.x + 222 * Math.cos(plane) - 4} y={B.y - 222 * Math.sin(plane) - 6} className="fill-muted-foreground text-[10px]" textAnchor="end">
          {swing.swingPlaneDeg.toFixed(0)}° plane
        </text>
        {/* Backswing */}
        <path d={`M${B.x} ${B.y} Q${ctrl(back)} ${T.x} ${T.y}`} fill="none" className="stroke-muted-foreground" strokeWidth="2.5" strokeDasharray="2 5" strokeLinecap="round" />
        {/* Downswing */}
        <path d={`M${T.x} ${T.y} Q${ctrl(down)} ${B.x} ${B.y}`} fill="none" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
        {/* Follow-through */}
        <path d={`M${B.x} ${B.y} Q${B.x - 40} ${B.y - 10} ${B.x - 46} ${B.y - 70}`} fill="none" className="stroke-primary/40" strokeWidth="3" strokeLinecap="round" />
        <circle cx={T.x} cy={T.y} r="5" className="fill-card stroke-muted-foreground" strokeWidth="2" />
        <text x={T.x + 9} y={T.y + 4} className="fill-muted-foreground text-[10px]">Top · {swing.backswingMs}ms</text>
        <circle cx={B.x} cy={B.y} r="7" fill="#F7FFF9" />
        <text x={B.x + 12} y={B.y + 4} className="fill-muted-foreground text-[10px]">Impact · {swing.downswingMs}ms down</text>
      </svg>
      <figcaption className="mt-1 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dotted border-muted-foreground" /> Backswing
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-primary" /> Downswing
        </span>
        <span className="font-medium text-foreground">{verdict}</span>
      </figcaption>
    </figure>
  );
}

// Top-down view at impact: club path arrow, face direction, and the ball
// flight those two produce.
export function ImpactView({ swing }: { swing: Swing }) {
  const O = { x: 80, y: 150 };
  const rad = (d: number) => (d * Math.PI) / 180;
  // Target is straight up the screen; positive angles point right (in-to-out / open).
  const dir = (deg: number, len: number) => ({ x: O.x + len * Math.sin(rad(deg)), y: O.y - len * Math.cos(rad(deg)) });
  const exaggerate = 3; // a few degrees is invisible at true scale
  const pathEnd = dir(swing.clubPathDeg * exaggerate, 60);
  const faceEnd = dir(swing.faceAngleDeg * exaggerate, 52);
  const faceL = dir(swing.faceAngleDeg * exaggerate - 90, 16);
  const faceR = dir(swing.faceAngleDeg * exaggerate + 90, 16);

  // Ball flight: starts ~ face direction, curves by face-to-path.
  const start = 0.8 * swing.faceAngleDeg + 0.2 * swing.clubPathDeg;
  const curve = swing.faceAngleDeg - swing.clubPathDeg;
  const fx = 230;
  const fy0 = 150;
  const apexX = fx + start * 5;
  const landX = fx + start * 9 + curve * 7;

  return (
    <svg viewBox="0 0 320 170" className="w-full" role="img" aria-label={`Impact: face ${swing.faceAngleDeg}°, path ${swing.clubPathDeg}°, ${swing.shape}`}>
      <defs>
        <marker id="pp-arrow-path" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className="fill-primary" />
        </marker>
      </defs>
      {/* Club view */}
      <line x1={O.x} y1="160" x2={O.x} y2="16" className="stroke-muted-foreground/40" strokeDasharray="4 5" />
      <text x={O.x} y="11" textAnchor="middle" className="fill-muted-foreground text-[10px]">Target</text>
      <line x1={O.x - (pathEnd.x - O.x) * 0.6} y1={O.y - (pathEnd.y - O.y) * 0.6} x2={pathEnd.x} y2={pathEnd.y} className="stroke-primary" strokeWidth="2.5" markerEnd="url(#pp-arrow-path)" />
      <line x1={faceL.x} y1={faceL.y} x2={faceR.x} y2={faceR.y} className="stroke-accent" strokeWidth="5" strokeLinecap="round" />
      <line x1={O.x} y1={O.y} x2={faceEnd.x} y2={faceEnd.y} className="stroke-accent" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx={O.x} cy={O.y - 8} r="5" fill="#F7FFF9" />
      <text x="8" y="166" className="fill-primary text-[10px]">Path {swing.clubPathDeg > 0 ? "+" : ""}{swing.clubPathDeg.toFixed(1)}°</text>
      <text x="152" y="166" textAnchor="end" className="fill-accent text-[10px]">Face {swing.faceAngleDeg > 0 ? "+" : ""}{swing.faceAngleDeg.toFixed(1)}°</text>

      {/* Ball flight view */}
      <line x1="170" y1="0" x2="170" y2="170" className="stroke-border" />
      <line x1={fx} y1="160" x2={fx} y2="16" className="stroke-muted-foreground/40" strokeDasharray="4 5" />
      <path d={`M${fx} ${fy0} Q${apexX} 70 ${landX} 26`} fill="none" stroke="#F7FFF9" strokeWidth="2" strokeDasharray="1 5" strokeLinecap="round" />
      <circle cx={landX} cy="26" r="4" fill="#F7FFF9" />
      <circle cx={fx} cy={fy0} r="4" fill="#F7FFF9" />
      <text x={fx} y="166" textAnchor="middle" className="fill-foreground text-[11px] font-semibold">{swing.shape}</text>
    </svg>
  );
}
