import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function startOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: totalCount }, { count: weekCount }, { data: recentWorkouts }] =
    await Promise.all([
      supabase
        .from("workouts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id),
      supabase
        .from("workouts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("started_at", startOfWeek()),
      supabase
        .from("workouts")
        .select("id, name, started_at, completed_at")
        .eq("user_id", user!.id)
        .order("started_at", { ascending: false })
        .limit(5),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to GymCell.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">This week</p>
            <p className="text-3xl font-semibold tracking-tight">{weekCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">Total workouts</p>
            <p className="text-3xl font-semibold tracking-tight">{totalCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {recentWorkouts && recentWorkouts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Dumbbell className="size-6 text-primary" />
            </div>
            <p className="font-medium">No workouts logged yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Your training history, PRs, and progress will show up here once you log your
              first workout.
            </p>
          </CardContent>
        </Card>
      )}

      {recentWorkouts && recentWorkouts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Recent workouts</h2>
          {recentWorkouts.map((workout) => (
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
