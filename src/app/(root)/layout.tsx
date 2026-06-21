import { TenLabsNav, TenLabsFooter } from "@/components/landing";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-white dark:bg-black transition-colors">
      {/* Navigation */}
      <TenLabsNav variant="sticky" />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <TenLabsFooter />
    </div>
  );
}
