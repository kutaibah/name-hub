import { Providers } from "@/components/providers";
import { AppHeader } from "@/components/layout/app-header";
import { DemoControls } from "@/components/cns/demo-controls";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-screen flex flex-col">
      <Providers>
        <AppHeader />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-border py-6 mt-auto">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>Canton Names — Hackathon MVP</p>
              <p>Not affiliated with Digital Asset or Canton Network</p>
            </div>
          </div>
        </footer>
        <DemoControls />
      </Providers>
    </div>
  );
}
