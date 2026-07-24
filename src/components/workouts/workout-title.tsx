"use client";

import { useTransition } from "react";
import { renameWorkout } from "@/app/dashboard/workouts/actions";

export function WorkoutTitle({ workoutId, name }: { workoutId: string; name: string }) {
  const [, startTransition] = useTransition();

  return (
    <input
      defaultValue={name}
      onBlur={(event) => {
        const value = event.target.value.trim();
        if (value && value !== name) {
          startTransition(() => renameWorkout(workoutId, value));
        }
      }}
      className="w-full max-w-md rounded-md bg-transparent px-1 -mx-1 text-2xl font-semibold tracking-tight outline-none focus-visible:bg-accent"
    />
  );
}
