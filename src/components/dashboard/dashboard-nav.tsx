import Link from "next/link";
import { UserMenu } from "@/components/dashboard/user-menu";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/workouts", label: "Workouts" },
  { href: "/dashboard/closet", label: "Closet" },
];

export function DashboardNav({ email, fullName }: { email: string; fullName?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            Gym<span className="text-primary">Cell</span>
          </Link>
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <UserMenu email={email} fullName={fullName} />
      </div>
    </header>
  );
}
