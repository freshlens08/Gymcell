"use client";

import { useEffect, useState } from "react";
import { BellRingIcon, CheckIcon, LocateFixedIcon, TagIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { average } from "@/lib/pinpoint/analysis";
import { CLUBS, clubById } from "@/lib/pinpoint/clubs";
import { TagFlags } from "@/lib/pinpoint/protocol";
import { cn } from "@/lib/utils";

import { usePinPoint, type TagState } from "./pinpoint-provider";
import { BatteryLabel, EmptyState, SignalBars, timeAgo } from "./ui";

// Log-distance path loss model. Calibrated for a tag reading -59 dBm at 1 m.
export function rssiToMeters(rssi: number): number {
  return Math.pow(10, (-59 - rssi) / (10 * 2.2));
}

export function BagView() {
  const { status, tags, swings, locatingClub, locate } = usePinPoint();
  const connected = status === "connected";
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  if (!connected && Object.keys(tags).length === 0) {
    return (
      <EmptyState
        icon={<TagIcon className="size-5" />}
        title="Your bag is offline"
        body="Connect your PinPoint Hub to see which clubs are in the bag, check tag batteries, and find lost clubs."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {CLUBS.map((club) => {
        const tag = tags[club.id];
        const clubSwings = swings.filter((s) => s.clubId === club.id);
        const avgSpeed = clubSwings.length ? average(clubSwings.map((s) => s.clubSpeedMph)) : null;
        const avgCarry = clubSwings.length ? average(clubSwings.map((s) => s.carryYds)) : null;
        const inBag = tag && tag.flags & (TagFlags.InBag | TagFlags.Moving);
        const missing = tag && !inBag;

        return (
          <div
            key={club.id}
            className={cn("flex items-center gap-3 rounded-2xl border bg-card p-3", missing && "border-accent/50")}
          >
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold",
                missing ? "bg-accent/15 text-accent" : "bg-primary/12 text-primary",
              )}
            >
              {club.short}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{club.name}</span>
                <span className="text-[11px] text-muted-foreground">{club.loftDeg}°</span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {!tag
                  ? "Waiting for tag…"
                  : missing
                    ? `Not in bag · last moved ${timeAgo(tag.lastMovedSec * 1000 + (now - tag.seenAt))}`
                    : tag.flags & TagFlags.Moving
                      ? "In hand"
                      : "In bag"}
                {avgSpeed !== null && (
                  <>
                    {" · "}
                    <span className="font-mono">{avgSpeed.toFixed(0)} mph</span>
                    {avgCarry ? <span className="font-mono"> · {avgCarry.toFixed(0)} yds</span> : null}
                  </>
                )}
              </div>
            </div>
            {tag && (
              <div className="flex flex-col items-end gap-1">
                <SignalBars rssi={tag.rssi} />
                <BatteryLabel percent={tag.battery} className="text-[11px] [&_svg]:size-3.5" />
              </div>
            )}
            {missing && connected && (
              <Button size="sm" variant="outline" className="rounded-lg" onClick={() => void locate(club.id)}>
                <LocateFixedIcon /> Find
              </Button>
            )}
          </div>
        );
      })}

      {locatingClub !== null && tags[locatingClub] && (
        <FindClubSheet tag={tags[locatingClub]} onClose={() => void locate(null)} />
      )}
    </div>
  );
}

function FindClubSheet({ tag, onClose }: { tag: TagState; onClose: () => void }) {
  const club = clubById(tag.clubId);
  const meters = rssiToMeters(tag.rssi);
  const found = !!(tag.flags & TagFlags.InBag) || meters < 1.2;
  // 0 at ~40 m, 1 when right next to it.
  const closeness = Math.max(0, Math.min(1, 1 - Math.log10(Math.max(1, meters)) / Math.log10(40)));
  const label = found ? "Found it!" : meters < 4 ? "Very close" : meters < 12 ? "Getting warmer" : "Far away";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="pinpoint w-full max-w-md rounded-t-3xl border-t p-6 pb-10 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Find ${club?.name}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Find my club</div>
            <div className="text-lg font-semibold">{club?.name}</div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
            <XIcon />
          </Button>
        </div>

        <div className="relative mx-auto my-8 flex size-56 items-center justify-center">
          {[1, 0.72, 0.44].map((s) => (
            <div key={s} className="absolute rounded-full border border-primary/20" style={{ width: `${s * 100}%`, height: `${s * 100}%` }} />
          ))}
          <div
            className="absolute rounded-full bg-primary/15 transition-all duration-700"
            style={{ width: `${30 + closeness * 70}%`, height: `${30 + closeness * 70}%` }}
          />
          {!found && <div className="absolute size-full animate-ping rounded-full border-2 border-primary/30 [animation-duration:2s]" />}
          <div className="relative flex flex-col items-center">
            {found ? (
              <CheckIcon className="size-10 text-primary" />
            ) : (
              <span className="font-mono text-4xl font-bold tabular-nums">~{meters < 10 ? meters.toFixed(1) : meters.toFixed(0)}</span>
            )}
            <span className="text-xs text-muted-foreground">{found ? "Right here" : "meters away"}</span>
          </div>
        </div>

        <div className="text-center">
          <div className={cn("text-xl font-semibold", found ? "text-primary" : "text-foreground")}>{label}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {found
              ? "Put it back in the bag. PinPoint will warn you if you walk off without it again."
              : "Walk around slowly. The tag is beeping and flashing, and the signal gets stronger as you get closer."}
          </p>
        </div>
        {!found && (
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-accent">
            <BellRingIcon className="size-4 animate-bounce" /> Tag is ringing · {tag.rssi} dBm
          </div>
        )}
      </div>
    </div>
  );
}
