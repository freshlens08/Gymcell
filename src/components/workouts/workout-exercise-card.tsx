"use client";

import { useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addSet, removeExerciseFromWorkout } from "@/app/dashboard/workouts/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SetRow } from "@/components/workouts/set-row";

type Set = {
  id: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
};

export function WorkoutExerciseCard({
  workoutExerciseId,
  workoutId,
  exerciseName,
  sets,
}: {
  workoutExerciseId: string;
  workoutId: string;
  exerciseName: string;
  sets: Set[];
}) {
  const [isPending, startTransition] = useTransition();
  const nextSetNumber = sets.length + 1;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{exerciseName}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() =>
            startTransition(() => removeExerciseFromWorkout(workoutExerciseId, workoutId))
          }
        >
          <Trash2 />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {sets.map((set) => (
          <SetRow key={set.id} set={set} workoutId={workoutId} />
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          disabled={isPending}
          onClick={() =>
            startTransition(() => addSet(workoutExerciseId, workoutId, nextSetNumber))
          }
        >
          <Plus />
          Add set
        </Button>
      </CardContent>
    </Card>
  );
}
