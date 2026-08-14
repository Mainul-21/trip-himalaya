import { describe, expect, it } from "vitest";
import { assertCredentialAttemptAllowed, clearCredentialFailures, hashPassword, recordCredentialFailure, resetCredentialAttemptStateForTests, verifyPassword } from "./adminAuth";
import { isAdminRole, isPrincipalRole } from "./roles";

describe("credential administrator security", () => {
  it("hashes passwords and verifies only the original credential", async () => {
    const hash = await hashPassword("A_longer_demo_password_2026");
    await expect(verifyPassword("A_longer_demo_password_2026", hash)).resolves.toBe(true);
    await expect(verifyPassword("not-the-password", hash)).resolves.toBe(false);
  });

  it("recognizes the principal and administrator boundaries", () => {
    expect(isAdminRole("principal")).toBe(true);
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("visitor")).toBe(false);
    expect(isPrincipalRole("principal")).toBe(true);
    expect(isPrincipalRole("admin")).toBe(false);
  });

  it("temporarily blocks repeated credential failures while allowing a cleared successful login", () => {
    resetCredentialAttemptStateForTests();
    const now = 1_000;
    for (let index = 0; index < 5; index += 1) recordCredentialFailure("admin@example.com", now + index);
    expect(() => assertCredentialAttemptAllowed("admin@example.com", now + 6)).toThrow("Too many attempts");
    clearCredentialFailures("admin@example.com");
    expect(() => assertCredentialAttemptAllowed("admin@example.com", now + 7)).not.toThrow();
  });
});
