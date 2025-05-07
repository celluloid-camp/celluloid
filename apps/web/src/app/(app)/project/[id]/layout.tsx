export default function ProjectLayout({
  children,
  panel,
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <>
      {children}
      {panel}
    </>
  );
}
