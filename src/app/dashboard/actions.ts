"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/supabase/require-user";

export async function logQuickLift(exerciseName: string, weight: number, reps: number) {
  const { supabase, userId } = await requireUserId();

  const { data: exercise, error: exerciseError } = await supabase
    .from("exercises")
    .select("id")
    .eq("name", exerciseName)
    .single();

  if (exerciseError || !exercise) {
    throw new Error(exerciseError?.message ?? `Unknown exercise: ${exerciseName}`);
  }

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert({ user_id: userId, name: "Quick Log", completed_at: new Date().toISOString() })
    .select("id")
    .single();

  if (workoutError || !workout) {
    throw new Error(workoutError?.message ?? "Failed to log lift");
  }

  const { data: workoutExercise, error: weError } = await supabase
    .from("workout_exercises")
    .insert({ workout_id: workout.id, exercise_id: exercise.id, order_index: 0 })
    .select("id")
    .single();

  if (weError || !workoutExercise) {
    throw new Error(weError?.message ?? "Failed to log lift");
  }

  const { error: setError } = await supabase.from("sets").insert({
    workout_exercise_id: workoutExercise.id,
    set_number: 1,
    weight,
    reps,
    completed_at: new Date().toISOString(),
  });

  if (setError) throw new Error(setError.message);

  revalidatePath("/dashboard");
}
