"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/supabase/require-user";

export async function createWorkout() {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("workouts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create workout");
  }

  revalidatePath("/dashboard/workouts");
  redirect(`/dashboard/workouts/${data.id}`);
}

export async function deleteWorkout(workoutId: string) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/workouts");
  revalidatePath("/dashboard");
  redirect("/dashboard/workouts");
}

export async function completeWorkout(workoutId: string) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("workouts")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", workoutId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/workouts/${workoutId}`);
  revalidatePath("/dashboard");
}

export async function renameWorkout(workoutId: string, name: string) {
  const { supabase } = await requireUserId();

  const trimmed = name.trim();
  if (!trimmed) return;

  const { error } = await supabase
    .from("workouts")
    .update({ name: trimmed })
    .eq("id", workoutId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/workouts/${workoutId}`);
}

export async function addExerciseToWorkout(workoutId: string, exerciseId: string) {
  const { supabase } = await requireUserId();

  const { count } = await supabase
    .from("workout_exercises")
    .select("id", { count: "exact", head: true })
    .eq("workout_id", workoutId);

  const { error } = await supabase.from("workout_exercises").insert({
    workout_id: workoutId,
    exercise_id: exerciseId,
    order_index: count ?? 0,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/workouts/${workoutId}`);
}

export async function removeExerciseFromWorkout(workoutExerciseId: string, workoutId: string) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("id", workoutExerciseId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/workouts/${workoutId}`);
}

export async function addSet(
  workoutExerciseId: string,
  workoutId: string,
  setNumber: number,
) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("sets").insert({
    workout_exercise_id: workoutExerciseId,
    set_number: setNumber,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/workouts/${workoutId}`);
}

export async function updateSet(
  setId: string,
  workoutId: string,
  values: { weight?: number | null; reps?: number | null },
) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("sets")
    .update({ ...values, completed_at: new Date().toISOString() })
    .eq("id", setId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/workouts/${workoutId}`);
}

export async function deleteSet(setId: string, workoutId: string) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("sets").delete().eq("id", setId);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/workouts/${workoutId}`);
}
