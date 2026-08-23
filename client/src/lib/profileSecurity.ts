export async function completeSensitiveProfileChange(logout: () => Promise<unknown>, navigate: (path: string) => void) {
  try {
    await logout();
  } catch {
    // Server-side session invalidation already completed. A failed client cookie
    // cleanup must not block the required fresh administrator sign-in.
  } finally {
    navigate("/admin/login");
  }
}
