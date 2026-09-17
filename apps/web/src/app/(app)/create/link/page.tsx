import { Suspense } from "react";
import { CreateLinkPanel } from "@/components/create/create-link-panel";

export default function CreateLinkPage() {
  return (
    <Suspense>
      <CreateLinkPanel />
    </Suspense>
  );
}
