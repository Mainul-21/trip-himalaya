export type AdminRole = "principal" | "admin";

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return role === "principal" || role === "admin";
}

export function isPrincipalRole(role: string | null | undefined): role is "principal" {
  return role === "principal";
}
