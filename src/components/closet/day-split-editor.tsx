"use client";

import { useState, useTransition } from "react";
import { upsertTrainingSplit } from "@/app/dashboard/closet/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/supabase/database.types";

type ExerciseCategory = Database["public"]["Enums"]["exercise_category"];

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

export function DaySplitEditor({
  dayOfWeek,
  dayLabel,
  initialFocuses,
}: {
  dayOfWeek: number;
  dayLabel: string;
  initialFocuses: ExerciseCategory[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<ExerciseCategory>>(new Set(initialFocuses));
  const [isPending, startTransition] = useTransition();

  function toggle(option: ExerciseCategory) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(option)) {
        next.delete(option);
      } else {
        next.add(option);
      }
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      await upsertTrainingSplit(dayOfWeek, Array.from(selected));
      setOpen(false);
    });
  }

  const summary = initialFocuses.length > 0 ? initialFocuses.map(formatLabel).join(", ") : "Rest day";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setSelected(new Set(initialFocuses));
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={<Button variant="outline" className="w-full justify-between font-normal" />}
      >
        <span className="truncate">{summary}</span>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] gap-4">
        <DialogHeader>
          <DialogTitle>{dayLabel}</DialogTitle>
        </DialogHeader>

        <div className="-mx-1 grid max-h-80 grid-cols-2 gap-1 overflow-y-auto px-1">
          {MUSCLE_FOCUS_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Checkbox
                checked={selected.has(option)}
                onCheckedChange={() => toggle(option)}
              />
              {formatLabel(option)}
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isPending}
            onClick={() => setSelected(new Set())}
          >
            Rest day
          </Button>
          <Button type="button" className="flex-1" disabled={isPending} onClick={handleSave}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
