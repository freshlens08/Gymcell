import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
        AI Fitness Operating System
      </span>
      <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
        Train smarter with <span className="text-primary">GymCell</span>
      </h1>
      <p className="max-w-md text-lg text-muted-foreground text-balance">
        Workouts, nutrition, AI coaching, and progress tracking — one
        connected system.
      </p>
      <Button
        size="lg"
        className="mt-2"
        nativeButton={false}
        render={<Link href="/signup" />}
      >
        Get started
      </Button>
    </div>
  );
}
