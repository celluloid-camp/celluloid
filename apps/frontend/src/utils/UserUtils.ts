import type { UserRecord } from "@celluloid/types";
import randomColor from "randomcolor";

export function getUserInitials(username: string): string {
  return username
    .split(/\s+/)
    .map((part) => part.substring(0, 1))
    .join("")
    .substring(0, 2);
}

export function getUserColor(id: string): string {
  return randomColor({ seed: id, luminosity: "bright" });
}

export function isTeacher(user?: UserRecord) {
  return user && user.role === "teacher";
}

export function isAdmin(user?: UserRecord) {
  return user && user.role === "admin";
}
