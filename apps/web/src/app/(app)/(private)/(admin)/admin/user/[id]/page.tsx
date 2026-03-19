import { Suspense } from "react";
import { UserDetails } from "@/components/admin/details/user";
import { caller } from "@/lib/trpc/server";
import UserPageLoading from "./loading";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await caller.admin.getUserById({
    id,
  });
  return (
    <Suspense fallback={<UserPageLoading />}>
      <UserDetails data={user} />
    </Suspense>
  );
}
