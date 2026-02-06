export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* No TenLabsNav here - ProductPageLayout has its own MiniHeader */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
