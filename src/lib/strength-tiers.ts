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

// General adult strength standards (estimated 1RM, lbs). Not yet adjusted
// for bodyweight/gender/experience — a reasonable starting point, worth
// personalizing later.
const THRESHOLDS: Record<string, [number, Tier][]> = {
  "Barbell Bench Press": [
    [0, "bronze"],
    [95, "silver"],
    [135, "gold"],
    [185, "platinum"],
    [225, "diamond"],
    [315, "titan"],
  ],
  "Overhead Press": [
    [0, "bronze"],
    [65, "silver"],
    [85, "gold"],
    [115, "platinum"],
    [135, "diamond"],
    [185, "titan"],
  ],
  "Barbell Curl": [
    [0, "bronze"],
    [45, "silver"],
    [65, "gold"],
    [85, "platinum"],
    [100, "diamond"],
    [130, "titan"],
  ],
  "Barbell Back Squat": [
    [0, "bronze"],
    [115, "silver"],
    [155, "gold"],
    [225, "platinum"],
    [275, "diamond"],
    [365, "titan"],
  ],
  "Barbell Deadlift": [
    [0, "bronze"],
    [135, "silver"],
    [185, "gold"],
    [275, "platinum"],
    [335, "diamond"],
    [425, "titan"],
  ],
  "Close-Grip Bench Press": [
    [0, "bronze"],
    [75, "silver"],
    [105, "gold"],
    [145, "platinum"],
    [175, "diamond"],
    [225, "titan"],
  ],
  "Romanian Deadlift": [
    [0, "bronze"],
    [95, "silver"],
    [135, "gold"],
    [185, "platinum"],
    [225, "diamond"],
    [315, "titan"],
  ],
  "Standing Calf Raise": [
    [0, "bronze"],
    [95, "silver"],
    [135, "gold"],
    [185, "platinum"],
    [225, "diamond"],
    [315, "titan"],
  ],
};

export function getTier(exerciseName: string, weight: number): Tier {
  const table = THRESHOLDS[exerciseName] ?? THRESHOLDS["Barbell Bench Press"];
  let tier: Tier = "bronze";
  for (const [min, t] of table) {
    if (weight >= min) tier = t;
  }
  return tier;
}
