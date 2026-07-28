import type { Database } from "@/lib/supabase/database.types";

type ExerciseCategory = Database["public"]["Enums"]["exercise_category"];

export type Tier = "bronze" | "silver" | "gold" | "platinum" | "diamond" | "titan";

export const TIER_ORDER: Tier[] = ["bronze", "silver", "gold", "platinum", "diamond", "titan"];

export const TIER_COLORS: Record<Tier, string> = {
  bronze: "#b45309",
  silver: "#94a3b8",
  gold: "#facc15",
  platinum: "#22d3ee",
  diamond: "#a78bfa",
  titan: "#ef4444",
};

export const TIER_LABELS: Record<Tier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
  titan: "Titan",
};

// General adult strength standards (estimated 1RM, lbs) per muscle category.
// Since the exercise used for each muscle is user-chosen (not fixed), these
// are broad category-level scales rather than per-exercise — a bodyweight
// pull-up and a loaded row will rank differently even though both train
// "back". Not yet adjusted for bodyweight/gender/experience either. Both are
// reasonable follow-up refinements once real usage data exists.
const CATEGORY_THRESHOLDS: Partial<Record<ExerciseCategory, [number, Tier][]>> = {
  chest: [
    [0, "bronze"],
    [95, "silver"],
    [135, "gold"],
    [185, "platinum"],
    [225, "diamond"],
    [315, "titan"],
  ],
  shoulders: [
    [0, "bronze"],
    [65, "silver"],
    [85, "gold"],
    [115, "platinum"],
    [135, "diamond"],
    [185, "titan"],
  ],
  back: [
    [0, "bronze"],
    [95, "silver"],
    [135, "gold"],
    [185, "platinum"],
    [225, "diamond"],
    [315, "titan"],
  ],
  biceps: [
    [0, "bronze"],
    [45, "silver"],
    [65, "gold"],
    [85, "platinum"],
    [100, "diamond"],
    [130, "titan"],
  ],
  triceps: [
    [0, "bronze"],
    [75, "silver"],
    [105, "gold"],
    [145, "platinum"],
    [175, "diamond"],
    [225, "titan"],
  ],
  forearms: [
    [0, "bronze"],
    [25, "silver"],
    [40, "gold"],
    [55, "platinum"],
    [70, "diamond"],
    [90, "titan"],
  ],
  core: [
    [0, "bronze"],
    [10, "silver"],
    [25, "gold"],
    [45, "platinum"],
    [65, "diamond"],
    [90, "titan"],
  ],
  quads: [
    [0, "bronze"],
    [115, "silver"],
    [155, "gold"],
    [225, "platinum"],
    [275, "diamond"],
    [365, "titan"],
  ],
  hamstrings: [
    [0, "bronze"],
    [95, "silver"],
    [135, "gold"],
    [185, "platinum"],
    [225, "diamond"],
    [315, "titan"],
  ],
  glutes: [
    [0, "bronze"],
    [95, "silver"],
    [135, "gold"],
    [185, "platinum"],
    [225, "diamond"],
    [315, "titan"],
  ],
  calves: [
    [0, "bronze"],
    [95, "silver"],
    [135, "gold"],
    [185, "platinum"],
    [225, "diamond"],
    [315, "titan"],
  ],
};

export function getTier(category: ExerciseCategory, weight: number): Tier {
  const table = CATEGORY_THRESHOLDS[category] ?? CATEGORY_THRESHOLDS.chest!;
  let tier: Tier = "bronze";
  for (const [min, t] of table) {
    if (weight >= min) tier = t;
  }
  return tier;
}

export function tierRank(tier: Tier): number {
  return TIER_ORDER.indexOf(tier) + 1;
}
