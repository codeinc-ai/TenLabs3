import { TenLabsNav, TenLabsFooter, ThreadsWave } from "@/components/landing";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Navigation */}
      <TenLabsNav variant="sticky" />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Threads wave - above footer */}
      <ThreadsWave />

      {/* Footer */}
      <TenLabsFooter />
    </div>
  );
}
