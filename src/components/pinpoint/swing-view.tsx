"use client";

import { useState } from "react";
import { ActivityIcon, CheckCircle2Icon, LightbulbIcon, PlayIcon, SquareIcon, ZapIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { coachingTips, IDEAL_TEMPO } from "@/lib/pinpoint/analysis";
import { CLUBS, clubById } from "@/lib/pinpoint/clubs";
import { cn } from "@/lib/utils";

import { usePinPoint } from "./pinpoint-provider";
import { ImpactView, SwingPlaneView } from "./swing-graphics";
import { EmptyState, Metric, Panel, PanelTitle, ScoreRing, signed } from "./ui";

export function SwingView() {
  const { status, kind, swings, activeClub, setActiveClub, sessionActive, toggleSession, simulateSwing } =
    usePinPoint();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const connected = status === "connected";
  const swing = swings.find((s) => s.id === selectedId) ?? swings[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
        <div className="flex gap-1.5">
          {CLUBS.map((c) => (
            <button
              key={c.id}
              onClick={() => void setActiveClub(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                c.id === activeClub
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {c.short}
            </button>
          ))}
        </div>
      </div>

      {connected && (
        <div className="flex gap-2">
          <Button
            className="h-11 flex-1 rounded-xl"
            variant={sessionActive ? "secondary" : "default"}
            onClick={() => void toggleSession()}
          >
            {sessionActive ? <SquareIcon /> : <PlayIcon />}
            {sessionActive ? "End session" : "Start session"}
          </Button>
          {kind === "demo" && (
            <Button className="h-11 rounded-xl" variant="outline" onClick={simulateSwing}>
              <ZapIcon /> Swing
            </Button>
          )}
        </div>
      )}

      {sessionActive && (
        <div className="flex items-center justify-center gap-2 text-xs text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Listening for swings with the {clubById(activeClub)?.name}
        </div>
      )}

      {!swing ? (
        <EmptyState
          icon={<ActivityIcon className="size-5" />}
          title="No swings yet"
          body={
            connected
              ? "Start a session and hit a shot. PinPoint reads your swing from the tag in the grip."
              : "Connect your PinPoint Hub on the Home tab to start capturing swings."
          }
        />
      ) : (
        <SwingDetail key={swing.id} swingId={swing.id} onPick={setSelectedId} />
      )}
    </div>
  );
}

function SwingDetail({ swingId, onPick }: { swingId: string; onPick: (id: string) => void }) {
  const { swings } = usePinPoint();
  const swing = swings.find((s) => s.id === swingId)!;
  const club = clubById(swing.clubId);
  const tips = coachingTips(swing);
  const recent = swings.slice(0, 12);

  return (
    <>
      <Panel className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs font-medium text-muted-foreground">
              {club?.name} · #{swing.seq}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-5xl font-bold tracking-tight tabular-nums">
                {swing.clubSpeedMph.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">mph</span>
            </div>
            <div className="text-xs text-muted-foreground">Club head speed</div>
          </div>
          <ScoreRing score={swing.score} />
        </div>
        {recent.length > 1 && (
          <div className="mt-4 flex h-10 items-end gap-1" aria-label="Recent swings by score">
            {recent
              .slice()
              .reverse()
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => onPick(s.id)}
                  title={`${clubById(s.clubId)?.short} · ${s.clubSpeedMph.toFixed(0)} mph · score ${s.score}`}
                  aria-label={`${clubById(s.clubId)?.name}, score ${s.score}`}
                  className={cn(
                    "flex-1 rounded-t-[4px] transition-colors",
                    s.id === swing.id ? "bg-primary" : "bg-primary/25 hover:bg-primary/50",
                  )}
                  style={{ height: `${25 + s.score * 0.75}%` }}
                />
              ))}
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-2 gap-2">
        <Metric
          label="Tempo"
          value={`${swing.tempoRatio}:1`}
          hint={Math.abs(swing.tempoRatio - IDEAL_TEMPO) <= 0.4 ? "Tour tempo" : `Target ${IDEAL_TEMPO}:1`}
          tone={Math.abs(swing.tempoRatio - IDEAL_TEMPO) <= 0.4 ? "good" : "warn"}
        />
        <Metric
          label="Est. carry"
          value={swing.carryYds || "—"}
          unit={swing.carryYds ? "yds" : undefined}
          hint={swing.shape}
        />
        <Metric
          label="Face angle"
          value={signed(swing.faceAngleDeg)}
          unit="°"
          hint={swing.faceAngleDeg > 0.5 ? "Open" : swing.faceAngleDeg < -0.5 ? "Closed" : "Square"}
        />
        <Metric
          label="Club path"
          value={signed(swing.clubPathDeg)}
          unit="°"
          hint={swing.clubPathDeg > 0.5 ? "In-to-out" : swing.clubPathDeg < -0.5 ? "Out-to-in" : "Neutral"}
        />
        <Metric
          label="Attack angle"
          value={signed(swing.attackAngleDeg)}
          unit="°"
          hint={swing.attackAngleDeg >= 0 ? "Hitting up" : "Hitting down"}
        />
        <Metric
          label="Strike"
          value={swing.impactQuality}
          unit="/100"
          hint={swing.impactQuality >= 80 ? "Centered" : swing.impactQuality >= 60 ? "Slight miss" : "Off-center"}
          tone={swing.impactQuality >= 80 ? "good" : swing.impactQuality < 60 ? "warn" : undefined}
        />
      </div>

      <Panel>
        <PanelTitle>Swing plane · down the line</PanelTitle>
        <SwingPlaneView swing={swing} />
      </Panel>

      <Panel>
        <PanelTitle>Impact &amp; ball flight</PanelTitle>
        <ImpactView swing={swing} />
        <p className="mt-2 text-center text-[11px] text-muted-foreground">Angles drawn 3× for visibility</p>
      </Panel>

      <Panel>
        <PanelTitle>Coach</PanelTitle>
        <ul className="flex flex-col gap-3">
          {tips.map((t) => (
            <li key={t.title} className="flex gap-3">
              {t.tone === "good" ? (
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
              ) : (
                <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-accent" />
              )}
              <div>
                <div className="text-sm font-semibold">{t.title}</div>
                <div className="text-sm text-muted-foreground">{t.body}</div>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
