import { notFound } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExercisePicker } from "@/components/workouts/exercise-picker";
import { WorkoutExerciseCard } from "@/components/workouts/workout-exercise-card";
import { WorkoutTitle } from "@/components/workouts/workout-title";
import { completeWorkout, deleteWorkout } from "@/app/dashboard/workouts/actions";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: workout }, { data: exercises }, { data: workoutExercises }] = await Promise.all([
    supabase.from("workouts").select("id, name, completed_at").eq("id", id).single(),
    supabase.from("exercises").select("id, name, category, equipment").order("name"),
    supabase
      .from("workout_exercises")
      .select("id, exercise_id, order_index, exercises(name), sets(id, set_number, weight, reps)")
      .eq("workout_id", id)
      .order("order_index"),
  ]);

  if (!workout) {
    notFound();
  }

  const boundCompleteWorkout = completeWorkout.bind(null, id);
  const boundDeleteWorkout = deleteWorkout.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WorkoutTitle workoutId={workout.id} name={workout.name} />
          {workout.completed_at && <Badge variant="secondary">Completed</Badge>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!workout.completed_at && (
            <form action={boundCompleteWorkout}>
              <Button type="submit" variant="outline">
                <Check />
                Complete
              </Button>
            </form>
          )}
          <form action={boundDeleteWorkout}>
            <Button type="submit" variant="ghost" size="icon">
              <Trash2 />
            </Button>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {(workoutExercises ?? []).map((we) => (
          <WorkoutExerciseCard
            key={we.id}
            workoutExerciseId={we.id}
            workoutId={id}
            exerciseName={we.exercises?.name ?? "Exercise"}
            sets={(we.sets ?? []).sort((a, b) => a.set_number - b.set_number)}
          />
        ))}
      </div>

      <ExercisePicker
        workoutId={id}
        exercises={exercises ?? []}
        excludeIds={(workoutExercises ?? []).map((we) => we.exercise_id)}
      />
    </div>
  );
}
