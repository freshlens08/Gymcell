"use client";

import { useTransition } from "react";
import { upsertTrainingSplit } from "@/app/dashboard/closet/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/lib/supabase/database.types";

type ExerciseCategory = Database["public"]["Enums"]["exercise_category"];

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MUSCLE_FOCUS_OPTIONS: ExerciseCategory[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "core",
  "cardio",
  "olympic",
  "full_body",
  "mobility",
];

function formatLabel(value: string) {
  return value.replace("_", " ").replace(/^./, (char) => char.toUpperCase());
}

export function SplitSettings({
  splits,
}: {
  splits: { day_of_week: number; muscle_focus: ExerciseCategory | null }[];
}) {
  const [, startTransition] = useTransition();

  const focusByDay = new Map(splits.map((split) => [split.day_of_week, split.muscle_focus]));

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {DAY_LABELS.map((label, dayOfWeek) => (
        <div key={dayOfWeek} className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Select
            value={focusByDay.get(dayOfWeek) ?? "rest"}
            onValueChange={(value) =>
              startTransition(() =>
                upsertTrainingSplit(dayOfWeek, value === "rest" ? null : (value as ExerciseCategory)),
              )
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue>
                {(value: string) => (value === "rest" ? "Rest day" : formatLabel(value))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rest">Rest day</SelectItem>
              {MUSCLE_FOCUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {formatLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
