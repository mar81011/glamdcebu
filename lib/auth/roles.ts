export type AdminRole = "owner" | "developer";

export function isOwnerRole(role: string | null | undefined): boolean {
  return role === "owner";
}

export function isDeveloperRole(role: string | null | undefined): boolean {
  return role === "developer";
}
