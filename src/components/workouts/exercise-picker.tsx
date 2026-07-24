"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Search } from "lucide-react";
import { addExerciseToWorkout } from "@/app/dashboard/workouts/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Exercise = {
  id: string;
  name: string;
  category: string;
  equipment: string;
};

export function ExercisePicker({
  workoutId,
  exercises,
  excludeIds,
}: {
  workoutId: string;
  exercises: Exercise[];
  excludeIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const available = useMemo(
    () => exercises.filter((exercise) => !excludeIds.includes(exercise.id)),
    [exercises, excludeIds],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return available;
    const q = query.toLowerCase();
    return available.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(q) ||
        exercise.category.toLowerCase().includes(q) ||
        exercise.equipment.toLowerCase().includes(q),
    );
  }, [available, query]);

  function handleSelect(exerciseId: string) {
    startTransition(async () => {
      await addExerciseToWorkout(workoutId, exerciseId);
      setOpen(false);
      setQuery("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="self-start" />}>
        <Plus />
        Add exercise
      </DialogTrigger>
      <DialogContent className="max-h-[70vh] gap-4">
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search exercises…"
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="-mx-1 flex max-h-80 flex-col gap-1 overflow-y-auto px-1">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No exercises found.
            </p>
          )}
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(exercise.id)}
              className="flex items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
            >
              <span>{exercise.name}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {exercise.equipment.replace("_", " ")}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
