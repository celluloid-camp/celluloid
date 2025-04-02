import { auth } from "@celluloid/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role !== "admin") {
    redirect("/");
  }

  return children;
}
