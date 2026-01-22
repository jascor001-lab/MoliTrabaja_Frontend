export default function EncuestaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#06AB68] flex flex-col overflow-hidden">
      {children}
    </div>
  );
}
