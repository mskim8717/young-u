export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <div className="mx-auto max-w-lg px-4 py-6 pb-24">
        {children}
      </div>
    </div>
  );
}
