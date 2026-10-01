"use client";

import { useState } from "react";
import { ActivityIcon, BriefcaseIcon, HistoryIcon, HomeIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { BagView } from "./bag-view";
import { HistoryView } from "./history-view";
import { HomeView, type Tab } from "./home-view";
import { PinPointWordmark } from "./logo";
import { PinPointProvider, usePinPoint } from "./pinpoint-provider";
import { SwingView } from "./swing-view";

const TABS: { id: Tab; label: string; icon: typeof HomeIcon }[] = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "swing", label: "Swing", icon: ActivityIcon },
  { id: "bag", label: "Bag", icon: BriefcaseIcon },
  { id: "history", label: "History", icon: HistoryIcon },
];

export function PinPointApp({ autoDemo = false }: { autoDemo?: boolean }) {
  return (
    <PinPointProvider autoDemo={autoDemo}>
      <Shell />
    </PinPointProvider>
  );
}

function Shell() {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/85 px-4 py-3 backdrop-blur-md">
        <PinPointWordmark className="text-lg" markClassName="size-7" />
        <ConnectionPill />
      </header>

      <main className="flex-1 px-4 pt-4 pb-28">
        {tab === "home" && <HomeView go={setTab} />}
        {tab === "swing" && <SwingView />}
        {tab === "bag" && <BagView />}
        {tab === "history" && <HistoryView />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <ul className="grid grid-cols-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => {
                  setTab(id);
                  window.scrollTo({ top: 0 });
                }}
                aria-current={tab === id ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  tab === id ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function ConnectionPill() {
  const { status, kind } = usePinPoint();
  const label =
    status === "connected" ? (kind === "demo" ? "Demo" : "Connected") : status === "connecting" ? "Connecting" : "Offline";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        status === "connected" ? "border-primary/40 text-primary" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "connected" ? "bg-primary" : status === "connecting" ? "animate-pulse bg-accent" : "bg-muted-foreground",
        )}
      />
      {label}
    </span>
  );
}
