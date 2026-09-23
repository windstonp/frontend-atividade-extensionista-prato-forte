export function Screen({
  children,
  escura = false,
}: {
  children: React.ReactNode;
  escura?: boolean;
}) {
  return (
    <div
      className={`mx-auto flex min-h-dvh w-full max-w-[430px] flex-col ${
        escura ? "bg-tinta text-neve" : "bg-papel"
      }`}
    >
      {children}
    </div>
  );
}
