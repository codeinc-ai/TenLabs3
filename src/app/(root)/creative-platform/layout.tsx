export default function CreativePlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* No TenLabsNav here - page has its own MiniHeader */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
