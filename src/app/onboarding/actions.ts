"use server";

import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/supabase/require-user";
import { SPLIT_TEMPLATES, type SplitTemplateId } from "@/lib/split-templates";
import type { Database } from "@/lib/supabase/database.types";

type ExperienceLevel = Database["public"]["Enums"]["experience_level"];
type WorkoutLocation = Database["public"]["Enums"]["workout_location"];

export type OnboardingPayload = {
  heightInches: number | null;
  currentWeightLbs: number | null;
  goalWeightLbs: number | null;
  experienceLevel: ExperienceLevel | null;
  workoutLocation: WorkoutLocation | null;
  workoutsPerWeek: number | null;
  prs: {
    benchLbs: number | null;
    benchReps: number | null;
    squatLbs: number | null;
    squatReps: number | null;
    deadliftLbs: number | null;
    deadliftReps: number | null;
  };
  splitTemplateId: SplitTemplateId | null;
};

export async function completeOnboarding(payload: OnboardingPayload) {
  const { supabase, userId } = await requireUserId();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      height_inches: payload.heightInches,
      current_weight_lbs: payload.currentWeightLbs,
      goal_weight_lbs: payload.goalWeightLbs,
      experience_level: payload.experienceLevel,
      workout_location: payload.workoutLocation,
      workouts_per_week: payload.workoutsPerWeek,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) throw new Error(profileError.message);

  const prEntries = [
    { name: "Barbell Bench Press", weight: payload.prs.benchLbs, reps: payload.prs.benchReps },
    { name: "Barbell Back Squat", weight: payload.prs.squatLbs, reps: payload.prs.squatReps },
    { name: "Barbell Deadlift", weight: payload.prs.deadliftLbs, reps: payload.prs.deadliftReps },
  ].filter((entry) => entry.weight !== null);

  if (prEntries.length > 0) {
    const { data: exercises } = await supabase
      .from("exercises")
      .select("id, name")
      .in(
        "name",
        prEntries.map((entry) => entry.name),
      );

    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        user_id: userId,
        name: "Starting Point",
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (workoutError || !workout) {
      throw new Error(workoutError?.message ?? "Failed to log starting PRs");
    }

    for (const [index, entry] of prEntries.entries()) {
      const exerciseId = exercises?.find((exercise) => exercise.name === entry.name)?.id;
      if (!exerciseId) continue;

      const { data: workoutExercise, error: weError } = await supabase
        .from("workout_exercises")
        .insert({ workout_id: workout.id, exercise_id: exerciseId, order_index: index })
        .select("id")
        .single();

      if (weError || !workoutExercise) continue;

      await supabase.from("sets").insert({
        workout_exercise_id: workoutExercise.id,
        set_number: 1,
        weight: entry.weight,
        reps: entry.reps ?? 1,
        completed_at: new Date().toISOString(),
      });
    }
  }

  if (payload.splitTemplateId) {
    const template = SPLIT_TEMPLATES.find((t) => t.id === payload.splitTemplateId);
    if (template) {
      const rows = template.days.map((focuses, dayOfWeek) => ({
        user_id: userId,
        day_of_week: dayOfWeek,
        muscle_focus: focuses,
      }));

      await supabase.from("training_splits").upsert(rows, { onConflict: "user_id,day_of_week" });
    }
  }

  redirect("/dashboard");
}
