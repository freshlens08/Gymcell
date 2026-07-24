import Link from "next/link";
import { Dumbbell, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createWorkout } from "@/app/dashboard/workouts/actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function WorkoutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("id, name, started_at, completed_at")
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground">Your training history.</p>
        </div>
        <form action={createWorkout}>
          <Button type="submit">
            <Plus />
            New workout
          </Button>
        </form>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          Couldn&apos;t load workouts: {error.message}
        </p>
      )}

      {workouts && workouts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Dumbbell className="size-6 text-primary" />
            </div>
            <p className="font-medium">No workouts yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Start your first workout to begin tracking sets, reps, and progress.
            </p>
          </CardContent>
        </Card>
      )}

      {workouts && workouts.length > 0 && (
        <div className="flex flex-col gap-3">
          {workouts.map((workout) => (
            <Link key={workout.id} href={`/dashboard/workouts/${workout.id}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{workout.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(workout.started_at)}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {workout.completed_at ? "Completed" : "In progress"}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
