import { DaySplitEditor } from "@/components/closet/day-split-editor";
import type { Database } from "@/lib/supabase/database.types";

type ExerciseCategory = Database["public"]["Enums"]["exercise_category"];

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function SplitSettings({
  splits,
}: {
  splits: { day_of_week: number; muscle_focus: ExerciseCategory[] }[];
}) {
  const focusByDay = new Map(splits.map((split) => [split.day_of_week, split.muscle_focus]));

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {DAY_LABELS.map((label, dayOfWeek) => (
        <div key={dayOfWeek} className="flex items-center justify-between gap-3">
          <span className="w-20 shrink-0 text-sm text-muted-foreground">{label}</span>
          <DaySplitEditor
            dayOfWeek={dayOfWeek}
            dayLabel={label}
            initialFocuses={focusByDay.get(dayOfWeek) ?? []}
          />
        </div>
      ))}
    </div>
  );
}
