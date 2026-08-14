const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS = 8;
const submissions = new Map<string, { count: number; windowStartedAt: number }>();

export function assertPublicFormSubmissionAllowed(scope: "booking" | "enquiry", email: string, now = Date.now()) {
  const key = `${scope}:${email.toLowerCase()}`;
  const current = submissions.get(key);
  if (!current || now - current.windowStartedAt > WINDOW_MS) {
    submissions.set(key, { count: 1, windowStartedAt: now });
    return;
  }
  if (current.count >= MAX_SUBMISSIONS) throw new Error("Please wait a few minutes before submitting another request.");
  current.count += 1;
}

export function resetPublicFormRateLimitForTests() {
  submissions.clear();
}
