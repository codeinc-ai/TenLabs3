import { TenLabsFooter } from "@/components/landing";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* No TenLabsNav here - company pages have their own TopBar */}
      <main className="flex-1">{children}</main>
      <TenLabsFooter />
    </div>
  );
}
