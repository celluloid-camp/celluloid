import { Suspense } from "react";
import { CreateSearchPanel } from "@/components/create/create-search-panel";

export default function CreateSearchPage() {
  return (
    <Suspense>
      <CreateSearchPanel />
    </Suspense>
  );
}
