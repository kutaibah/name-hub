import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { DemoControls } from "@/components/cns/demo-controls";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Canton Names - Human-Readable Names for Canton Network",
  description: "Search, register, and manage Canton Name Service (CNS) names. Replace long party identifiers with readable names like alice.unverified.cns.",
  keywords: ["Canton Network", "CNS", "Canton Name Service", "ANS", "blockchain", "Daml"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <Providers>
          <Header />
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
      </body>
    </html>
  );
}
