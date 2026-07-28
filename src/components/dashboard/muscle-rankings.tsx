import { MUSCLE_REGIONS } from "@/lib/muscle-map";
import { getTier, TIER_COLORS, TIER_LABELS } from "@/lib/strength-tiers";

type PersonalRecord = { exercise_name: string; weight: number };

export function MuscleRankings({ records }: { records: PersonalRecord[] }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {MUSCLE_REGIONS.map((region) => {
        const record = records.find((r) => r.exercise_name === region.exerciseName);
        const tier = record ? getTier(region.exerciseName, record.weight) : null;

        return (
          <div key={region.id} className="flex items-center justify-between py-2.5">
            <span className="text-sm">{region.label}</span>
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
        );
      })}
    </div>
  );
}
