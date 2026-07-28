import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BodyDiagram } from "@/components/dashboard/body-diagram";
import { MuscleRankings } from "@/components/dashboard/muscle-rankings";

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

  const [{ count: totalCount }, { count: weekCount }, { data: personalRecords }] =
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
        .from("personal_records")
        .select("exercise_name, estimated_1rm")
        .eq("user_id", user!.id),
    ]);

  const records = (personalRecords ?? [])
    .filter(
      (record): record is { exercise_name: string; estimated_1rm: number } =>
        record.exercise_name !== null && record.estimated_1rm !== null,
    )
    .map((record) => ({ exercise_name: record.exercise_name, weight: record.estimated_1rm }));

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Body Map</CardTitle>
          </CardHeader>
          <CardContent>
            <BodyDiagram records={records} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Muscle Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <MuscleRankings records={records} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
