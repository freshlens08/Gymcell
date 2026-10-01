import type { Metadata, Viewport } from "next";

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "PinPoint · Golf club & swing tracker",
  description: "Track every club in your bag and analyze every swing with PinPoint Bluetooth tags.",
  appleWebApp: { title: "PinPoint", capable: true, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0c1a14",
  viewportFit: "cover",
};

export default function PinPointLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pinpoint min-h-dvh">
      {children}
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
