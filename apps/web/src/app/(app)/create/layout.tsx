import { Suspense } from "react";
import { CreateLayoutShell } from "@/components/create/create-layout-shell";

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <CreateLayoutShell>{children}</CreateLayoutShell>
    </Suspense>
  );
}
