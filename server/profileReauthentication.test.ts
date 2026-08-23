import { describe, expect, it, vi } from "vitest";
import { completeSensitiveProfileChange } from "../client/src/lib/profileSecurity";

describe("administrator profile reauthentication", () => {
  it("redirects to administrator login even when client logout cleanup fails", async () => {
    const navigate = vi.fn();
    await expect(completeSensitiveProfileChange(async () => { throw new Error("network unavailable"); }, navigate)).resolves.toBeUndefined();
    expect(navigate).toHaveBeenCalledWith("/admin/login");
  });
});
