import { type MuscleRegionState } from "@/lib/muscle-map";
import { TIER_COLORS, TIER_LABELS } from "@/lib/strength-tiers";

export function MuscleRankings({ states }: { states: MuscleRegionState[] }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {states.map(({ region, exerciseName, tier }) => (
        <div key={region.id} className="flex items-center justify-between py-2.5">
          <div>
            <p className="text-sm">{region.label}</p>
            {exerciseName && <p className="text-xs text-muted-foreground">{exerciseName}</p>}
          </div>
          {tier ? (
            <span
              className="text-xs font-semibold tracking-wide uppercase"
              style={{ color: TIER_COLORS[tier] }}
            >
              {TIER_LABELS[tier]}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Unranked</span>
          )}
        </div>
      ))}
    </div>
  );
}
