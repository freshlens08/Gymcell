import type { Muscle } from "react-body-highlighter";
import type { Database } from "@/lib/supabase/database.types";
import { getTier, type Tier } from "@/lib/strength-tiers";

type ExerciseCategory = Database["public"]["Enums"]["exercise_category"];
export type BodyView = "front" | "back";

export type MuscleRegion = {
  id: Muscle;
  label: string;
  view: BodyView;
  exerciseCategory: ExerciseCategory;
};

export const MUSCLE_REGIONS: MuscleRegion[] = [
  { id: "chest", label: "Chest", view: "front", exerciseCategory: "chest" },
  { id: "front-deltoids", label: "Shoulders", view: "front", exerciseCategory: "shoulders" },
  { id: "biceps", label: "Biceps", view: "front", exerciseCategory: "biceps" },
  { id: "abs", label: "Abs", view: "front", exerciseCategory: "core" },
  { id: "obliques", label: "Obliques", view: "front", exerciseCategory: "core" },
  { id: "quadriceps", label: "Quads", view: "front", exerciseCategory: "quads" },
  { id: "adductor", label: "Adductors", view: "front", exerciseCategory: "quads" },
  { id: "forearm", label: "Forearms", view: "front", exerciseCategory: "forearms" },

  { id: "trapezius", label: "Traps", view: "back", exerciseCategory: "back" },
  { id: "upper-back", label: "Upper Back", view: "back", exerciseCategory: "back" },
  { id: "lower-back", label: "Lower Back", view: "back", exerciseCategory: "back" },
  { id: "back-deltoids", label: "Rear Delts", view: "back", exerciseCategory: "shoulders" },
  { id: "triceps", label: "Triceps", view: "back", exerciseCategory: "triceps" },
  { id: "gluteal", label: "Glutes", view: "back", exerciseCategory: "glutes" },
  { id: "abductors", label: "Abductors", view: "back", exerciseCategory: "glutes" },
  { id: "hamstring", label: "Hamstrings", view: "back", exerciseCategory: "hamstrings" },
  { id: "calves", label: "Calves", view: "back", exerciseCategory: "calves" },
];

export type MusclePreference = {
  muscle_slug: string;
  exercise_id: string;
  exercise_name: string;
  category: ExerciseCategory;
};

export type PersonalRecord = { exercise_name: string; weight: number };

export type MuscleRegionState = {
  region: MuscleRegion;
  exerciseId: string | null;
  exerciseName: string | null;
  tier: Tier | null;
  weight: number | null;
};

export function buildRegionStates(
  preferences: MusclePreference[],
  records: PersonalRecord[],
): MuscleRegionState[] {
  return MUSCLE_REGIONS.map((region) => {
    const preference = preferences.find((p) => p.muscle_slug === region.id);
    if (!preference) {
      return { region, exerciseId: null, exerciseName: null, tier: null, weight: null };
    }

    const record = records.find((r) => r.exercise_name === preference.exercise_name);
    if (!record) {
      return {
        region,
        exerciseId: preference.exercise_id,
        exerciseName: preference.exercise_name,
        tier: null,
        weight: null,
      };
    }

    return {
      region,
      exerciseId: preference.exercise_id,
      exerciseName: preference.exercise_name,
      tier: getTier(preference.category, record.weight),
      weight: record.weight,
    };
  });
}
