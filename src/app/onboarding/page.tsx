import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed_at) {
    redirect("/dashboard");
  }

  const { data: splits } = await supabase
    .from("training_splits")
    .select("day_of_week, muscle_focus")
    .eq("user_id", user.id);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <OnboardingFlow initialSplits={splits ?? []} />
    </div>
  );
}
