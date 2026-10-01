"use client";

import { useSyncExternalStore } from "react";
import {
  ActivityIcon,
  AlertTriangleIcon,
  BluetoothIcon,
  BluetoothOffIcon,
  CpuIcon,
  PlayIcon,
  SparklesIcon,
  SquareIcon,
  TagIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { average } from "@/lib/pinpoint/analysis";
import { CLUBS, clubById } from "@/lib/pinpoint/clubs";
import { bluetoothSupport } from "@/lib/pinpoint/link";
import { TagFlags } from "@/lib/pinpoint/protocol";

import { PinPointMark } from "./logo";
import { usePinPoint } from "./pinpoint-provider";
import { BatteryLabel, Metric, Panel, PanelTitle, ScoreRing } from "./ui";

export type Tab = "home" | "swing" | "bag" | "history";

export function HomeView({ go }: { go: (t: Tab) => void }) {
  const { status } = usePinPoint();
  return status === "connected" ? <Dashboard go={go} /> : <ConnectHero />;
}

const noop = () => () => {};

function ConnectHero() {
  const { status, kind, connect } = usePinPoint();
  const support = useSyncExternalStore(noop, bluetoothSupport, () => "supported" as const);
  const connecting = status === "connecting";

  return (
    <div className="flex flex-col items-center pt-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-primary/15 blur-2xl" />
        <PinPointMark className="size-36" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        Every club. <span className="text-primary">Every swing.</span>
      </h1>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Connect your PinPoint Hub to track every club in your bag and analyze each swing as you hit it.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5">
        <Button
          size="lg"
          className="h-12 rounded-xl text-base"
          disabled={connecting || support !== "supported"}
          onClick={() => connect("bluetooth")}
        >
          <BluetoothIcon />
          {connecting && kind === "bluetooth" ? "Searching…" : "Connect PinPoint Hub"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 rounded-xl text-base"
          disabled={connecting}
          onClick={() => connect("demo")}
        >
          <SparklesIcon />
          {connecting && kind === "demo" ? "Starting demo…" : "Try demo mode"}
        </Button>
        {support !== "supported" && (
          <p className="mt-1 flex items-start gap-1.5 text-left text-xs text-muted-foreground">
            <BluetoothOffIcon className="mt-0.5 size-3.5 shrink-0" />
            {support === "insecure"
              ? "Bluetooth needs a secure (https) connection."
              : "This browser can't use Bluetooth. Use Chrome or Edge on Android, macOS, Windows or ChromeOS, or Bluefy on iPhone."}
          </p>
        )}
      </div>

      <ol className="mt-10 grid w-full grid-cols-3 gap-2 text-left">
        {[
          { icon: TagIcon, title: "Tag", body: "Screw a PinPoint Tag into each grip." },
          { icon: BluetoothIcon, title: "Pair", body: "Clip the Hub to your bag and connect." },
          { icon: ActivityIcon, title: "Swing", body: "Get metrics as soon as you hit." },
        ].map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="rounded-xl border bg-card p-3">
            <Icon className="size-4 text-primary" />
            <div className="mt-2 text-xs font-semibold">
              {i + 1}. {title}
            </div>
            <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{body}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Dashboard({ go }: { go: (t: Tab) => void }) {
  const { deviceName, firmware, battery, kind, tags, swings, sessionActive, toggleSession, disconnect, activeClub } =
    usePinPoint();

  const tagList = Object.values(tags);
  const inBag = tagList.filter((t) => t.flags & TagFlags.InBag || t.flags & TagFlags.Moving).length;
  const missing = tagList.filter((t) => !(t.flags & (TagFlags.InBag | TagFlags.Moving)));
  const lowBattery = tagList.filter((t) => t.flags & TagFlags.LowBattery);

  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const today = swings.filter((s) => s.at >= startOfDay);
  const last = swings[0];

  return (
    <div className="flex flex-col gap-3">
      <Panel className="bg-gradient-to-br from-primary/15 via-card to-card">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <CpuIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{deviceName}</div>
            <div className="text-xs text-muted-foreground">
              Firmware {firmware} · {kind === "demo" ? "Simulated" : "Bluetooth LE"}
            </div>
          </div>
          {battery !== null && <BatteryLabel percent={battery} />}
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            className="h-11 flex-1 rounded-xl"
            variant={sessionActive ? "secondary" : "default"}
            onClick={() => {
              void toggleSession();
              if (!sessionActive) go("swing");
            }}
          >
            {sessionActive ? <SquareIcon /> : <PlayIcon />}
            {sessionActive ? "End session" : `Start session · ${clubById(activeClub)?.short}`}
          </Button>
          <Button className="h-11 rounded-xl" variant="outline" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      </Panel>

      {(missing.length > 0 || lowBattery.length > 0) && (
        <button
          onClick={() => go("bag")}
          className="flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-left"
        >
          <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-accent" />
          <div className="text-sm">
            {missing.map((t) => (
              <div key={t.clubId} className="font-medium">
                {`${clubById(t.clubId)?.name} isn't in your bag`}
              </div>
            ))}
            {lowBattery.map((t) => (
              <div key={t.clubId} className="text-muted-foreground">
                {clubById(t.clubId)?.name} tag battery at {t.battery}%
              </div>
            ))}
            <div className="mt-1 text-xs text-accent">Open Bag →</div>
          </div>
        </button>
      )}

      <Panel>
        <PanelTitle>Today</PanelTitle>
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Swings" value={today.length} />
          <Metric
            label="Avg speed"
            value={today.length ? average(today.map((s) => s.clubSpeedMph)).toFixed(0) : "—"}
            unit="mph"
          />
          <Metric label="Clubs in bag" value={`${inBag}/${CLUBS.length}`} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          action={
            last && (
              <button className="text-xs text-primary" onClick={() => go("swing")}>
                Details →
              </button>
            )
          }
        >
          Last swing
        </PanelTitle>
        {last ? (
          <div className="flex items-center gap-4">
            <ScoreRing score={last.score} size={76} />
            <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Club</span>
              <span className="text-right font-medium">{clubById(last.clubId)?.name}</span>
              <span className="text-muted-foreground">Speed</span>
              <span className="text-right font-mono">{last.clubSpeedMph.toFixed(1)} mph</span>
              <span className="text-muted-foreground">Tempo</span>
              <span className="text-right font-mono">{last.tempoRatio}:1</span>
              <span className="text-muted-foreground">Shape</span>
              <span className="text-right font-medium">{last.shape}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Start a session and take a swing. Your first result will show up here.</p>
        )}
      </Panel>
    </div>
  );
}
