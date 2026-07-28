"use client";

import { useState, useTransition } from "react";
import { RotateCw } from "lucide-react";
import { logQuickLift } from "@/app/dashboard/actions";
import { MUSCLE_REGIONS, type MuscleRegion } from "@/lib/muscle-map";
import { getTier, TIER_COLORS, TIER_LABELS } from "@/lib/strength-tiers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type PersonalRecord = { exercise_name: string; weight: number };

const NEUTRAL_FILL = "var(--muted)";
const DECOR_FILL = "color-mix(in oklch, var(--muted), var(--background) 40%)";

function regionInfo(region: MuscleRegion, records: PersonalRecord[]) {
  const record = records.find((r) => r.exercise_name === region.exerciseName);
  if (!record) return { tier: null, weight: null };
  return { tier: getTier(region.exerciseName, record.weight), weight: record.weight };
}

function RegionShape({
  region,
  records,
  selected,
  onSelect,
  children,
}: {
  region: MuscleRegion;
  records: PersonalRecord[];
  selected: boolean;
  onSelect: (region: MuscleRegion) => void;
  children: (fill: string) => React.ReactNode;
}) {
  const { tier } = regionInfo(region, records);
  const fill = tier ? TIER_COLORS[tier] : NEUTRAL_FILL;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={region.label}
      onClick={() => onSelect(region)}
      onKeyDown={(event) => event.key === "Enter" && onSelect(region)}
      className="cursor-pointer outline-none"
      opacity={selected ? 0.7 : 1}
    >
      {children(fill)}
    </g>
  );
}

function FrontBody({
  records,
  selectedId,
  onSelect,
}: {
  records: PersonalRecord[];
  selectedId: string | null;
  onSelect: (region: MuscleRegion) => void;
}) {
  const byId = (id: string) => MUSCLE_REGIONS.find((r) => r.id === id)!;

  return (
    <svg viewBox="0 0 200 360" className="h-full w-full">
      {/* head + neck */}
      <circle cx="100" cy="26" r="18" fill={DECOR_FILL} />
      <rect x="91" y="42" width="18" height="12" fill={DECOR_FILL} />

      <RegionShape
        region={byId("shoulders")}
        records={records}
        selected={selectedId === "shoulders"}
        onSelect={onSelect}
      >
        {(fill) => (
          <>
            <ellipse cx="64" cy="72" rx="16" ry="15" fill={fill} className="transition-colors" />
            <ellipse cx="136" cy="72" rx="16" ry="15" fill={fill} className="transition-colors" />
          </>
        )}
      </RegionShape>

      <RegionShape
        region={byId("chest")}
        records={records}
        selected={selectedId === "chest"}
        onSelect={onSelect}
      >
        {(fill) => (
          <rect x="82" y="62" width="36" height="48" rx="14" fill={fill} className="transition-colors" />
        )}
      </RegionShape>

      {/* abs (decorative) */}
      <rect x="85" y="112" width="30" height="45" rx="8" fill={DECOR_FILL} />

      <RegionShape
        region={byId("biceps")}
        records={records}
        selected={selectedId === "biceps"}
        onSelect={onSelect}
      >
        {(fill) => (
          <>
            <ellipse cx="46" cy="100" rx="13" ry="26" fill={fill} className="transition-colors" />
            <ellipse cx="154" cy="100" rx="13" ry="26" fill={fill} className="transition-colors" />
          </>
        )}
      </RegionShape>

      {/* forearms + hands (decorative) */}
      <rect x="34" y="122" width="16" height="50" rx="8" fill={DECOR_FILL} />
      <rect x="150" y="122" width="16" height="50" rx="8" fill={DECOR_FILL} />
      <circle cx="42" cy="178" r="8" fill={DECOR_FILL} />
      <circle cx="158" cy="178" r="8" fill={DECOR_FILL} />

      {/* hips (decorative) */}
      <rect x="78" y="155" width="44" height="30" rx="12" fill={DECOR_FILL} />

      <RegionShape
        region={byId("quads")}
        records={records}
        selected={selectedId === "quads"}
        onSelect={onSelect}
      >
        {(fill) => (
          <>
            <ellipse cx="88" cy="225" rx="18" ry="45" fill={fill} className="transition-colors" />
            <ellipse cx="112" cy="225" rx="18" ry="45" fill={fill} className="transition-colors" />
          </>
        )}
      </RegionShape>

      {/* shins + feet (decorative) */}
      <rect x="78" y="268" width="16" height="65" rx="7" fill={DECOR_FILL} />
      <rect x="106" y="268" width="16" height="65" rx="7" fill={DECOR_FILL} />
      <ellipse cx="86" cy="340" rx="12" ry="7" fill={DECOR_FILL} />
      <ellipse cx="114" cy="340" rx="12" ry="7" fill={DECOR_FILL} />
    </svg>
  );
}

function BackBody({
  records,
  selectedId,
  onSelect,
}: {
  records: PersonalRecord[];
  selectedId: string | null;
  onSelect: (region: MuscleRegion) => void;
}) {
  const byId = (id: string) => MUSCLE_REGIONS.find((r) => r.id === id)!;

  return (
    <svg viewBox="0 0 200 360" className="h-full w-full">
      {/* head + neck */}
      <circle cx="100" cy="26" r="18" fill={DECOR_FILL} />
      <rect x="91" y="42" width="18" height="12" fill={DECOR_FILL} />

      {/* shoulder caps (decorative on back view) */}
      <ellipse cx="64" cy="72" rx="16" ry="15" fill={DECOR_FILL} />
      <ellipse cx="136" cy="72" rx="16" ry="15" fill={DECOR_FILL} />

      <RegionShape
        region={byId("back")}
        records={records}
        selected={selectedId === "back"}
        onSelect={onSelect}
      >
        {(fill) => (
          <rect x="78" y="62" width="44" height="95" rx="16" fill={fill} className="transition-colors" />
        )}
      </RegionShape>

      <RegionShape
        region={byId("triceps")}
        records={records}
        selected={selectedId === "triceps"}
        onSelect={onSelect}
      >
        {(fill) => (
          <>
            <ellipse cx="46" cy="100" rx="13" ry="26" fill={fill} className="transition-colors" />
            <ellipse cx="154" cy="100" rx="13" ry="26" fill={fill} className="transition-colors" />
          </>
        )}
      </RegionShape>

      {/* forearms + hands (decorative) */}
      <rect x="34" y="122" width="16" height="50" rx="8" fill={DECOR_FILL} />
      <rect x="150" y="122" width="16" height="50" rx="8" fill={DECOR_FILL} />
      <circle cx="42" cy="178" r="8" fill={DECOR_FILL} />
      <circle cx="158" cy="178" r="8" fill={DECOR_FILL} />

      {/* hips (decorative) */}
      <rect x="78" y="155" width="44" height="30" rx="12" fill={DECOR_FILL} />

      <RegionShape
        region={byId("hamstrings")}
        records={records}
        selected={selectedId === "hamstrings"}
        onSelect={onSelect}
      >
        {(fill) => (
          <>
            <ellipse cx="88" cy="215" rx="18" ry="50" fill={fill} className="transition-colors" />
            <ellipse cx="112" cy="215" rx="18" ry="50" fill={fill} className="transition-colors" />
          </>
        )}
      </RegionShape>

      <RegionShape
        region={byId("calves")}
        records={records}
        selected={selectedId === "calves"}
        onSelect={onSelect}
      >
        {(fill) => (
          <>
            <ellipse cx="84" cy="305" rx="13" ry="32" fill={fill} className="transition-colors" />
            <ellipse cx="116" cy="305" rx="13" ry="32" fill={fill} className="transition-colors" />
          </>
        )}
      </RegionShape>

      {/* feet (decorative) */}
      <ellipse cx="86" cy="340" rx="12" ry="7" fill={DECOR_FILL} />
      <ellipse cx="114" cy="340" rx="12" ry="7" fill={DECOR_FILL} />
    </svg>
  );
}

export function BodyDiagram({ records }: { records: PersonalRecord[] }) {
  const [flipped, setFlipped] = useState(false);
  const [activeRegion, setActiveRegion] = useState<MuscleRegion | null>(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isPending, startTransition] = useTransition();

  const current = activeRegion ? regionInfo(activeRegion, records) : null;

  function handleSave() {
    if (!activeRegion || !weight) return;
    startTransition(async () => {
      await logQuickLift(activeRegion.exerciseName, Number(weight), reps ? Number(reps) : 1);
      setActiveRegion(null);
      setWeight("");
      setReps("");
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {flipped ? "Back" : "Front"} — tap a muscle to log
        </p>
        <Button type="button" variant="outline" size="icon-sm" onClick={() => setFlipped((f) => !f)}>
          <RotateCw className="size-4" />
        </Button>
      </div>

      <div style={{ perspective: "1200px" }} className="h-80 w-48">
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.6s ease",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
            <FrontBody
              records={records}
              selectedId={activeRegion?.view === "front" ? activeRegion.id : null}
              onSelect={setActiveRegion}
            />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <BackBody
              records={records}
              selectedId={activeRegion?.view === "back" ? activeRegion.id : null}
              onSelect={setActiveRegion}
            />
          </div>
        </div>
      </div>

      <Dialog open={activeRegion !== null} onOpenChange={(open) => !open && setActiveRegion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeRegion?.label}</DialogTitle>
            <DialogDescription>
              {activeRegion?.exerciseName}
              {current?.tier && (
                <>
                  {" "}
                  — current: <span style={{ color: TIER_COLORS[current.tier] }}>{TIER_LABELS[current.tier]}</span>{" "}
                  ({current.weight} lbs)
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-end gap-3">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="quick-log-weight">Weight (lbs)</Label>
              <Input
                id="quick-log-weight"
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                autoFocus
              />
            </div>
            <div className="flex w-24 flex-col gap-2">
              <Label htmlFor="quick-log-reps">Reps</Label>
              <Input
                id="quick-log-reps"
                type="number"
                inputMode="numeric"
                placeholder="1"
                value={reps}
                onChange={(event) => setReps(event.target.value)}
              />
            </div>
          </div>

          <Button type="button" disabled={!weight || isPending} onClick={handleSave}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
