import type { CookieOptions, Request } from "express";
import { isSecureRequest } from "../httpSecurity";

export function getSessionCookieOptions(
  req: Request,
): Pick<CookieOptions, "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: isSecureRequest(req),
  };
}
