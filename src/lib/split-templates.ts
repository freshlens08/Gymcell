import type { Database } from "@/lib/supabase/database.types";

type ExerciseCategory = Database["public"]["Enums"]["exercise_category"];

export type SplitTemplateId = "full_body" | "upper_lower" | "push_pull_legs" | "bro_split";

export const SPLIT_TEMPLATES: {
  id: SplitTemplateId;
  label: string;
  description: string;
  days: ExerciseCategory[][];
}[] = [
  {
    id: "full_body",
    label: "Full Body",
    description: "3 days/week — everything, every session",
    days: [
      ["chest", "back", "shoulders", "quads", "hamstrings", "core"],
      [],
      ["chest", "back", "shoulders", "quads", "hamstrings", "core"],
      [],
      ["chest", "back", "shoulders", "quads", "hamstrings", "core"],
      [],
      [],
    ],
  },
  {
    id: "upper_lower",
    label: "Upper / Lower",
    description: "4 days/week — split by upper and lower body",
    days: [
      [],
      ["chest", "back", "shoulders", "biceps", "triceps"],
      ["quads", "hamstrings", "glutes", "calves"],
      [],
      ["chest", "back", "shoulders", "biceps", "triceps"],
      ["quads", "hamstrings", "glutes", "calves"],
      [],
    ],
  },
  {
    id: "push_pull_legs",
    label: "Push / Pull / Legs",
    description: "6 days/week — push, pull, legs, repeated",
    days: [
      [],
      ["chest", "shoulders", "triceps"],
      ["back", "biceps"],
      ["quads", "hamstrings", "glutes", "calves"],
      ["chest", "shoulders", "triceps"],
      ["back", "biceps"],
      ["quads", "hamstrings", "glutes", "calves"],
    ],
  },
  {
    id: "bro_split",
    label: "Body Part Split",
    description: "5 days/week — one major muscle group per day",
    days: [
      [],
      ["chest"],
      ["back"],
      ["shoulders"],
      ["quads", "hamstrings", "glutes", "calves"],
      ["biceps", "triceps"],
      [],
    ],
  },
];
