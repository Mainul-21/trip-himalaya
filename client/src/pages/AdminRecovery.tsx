import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OFFICIAL_TRIP_HIMALAYA_LOGO } from "@/lib/brand";
import { trpc } from "@/lib/trpc";
import { KeyRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";

export default function AdminRecovery() {
  const [, setLocation] = useLocation();
  const { data: agencyProfile } = trpc.agency.get.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const recover = trpc.adminAuth.recoverPrincipalPassword.useMutation();
  const [formError, setFormError] = useState("");
  const logoUrl = agencyProfile?.logoUrl || OFFICIAL_TRIP_HIMALAYA_LOGO;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (password !== String(form.get("confirmPassword") || "")) {
      setFormError("The new passwords do not match.");
      return;
    }
    setFormError("");
    recover.mutate({
      email: String(form.get("email") || ""),
      setupKey: String(form.get("setupKey") || ""),
      password,
    }, {
      onSuccess: () => setLocation("/admin/login"),
    });
  }

  return <main className="grid min-h-screen place-items-center bg-[#eef4f2] px-4 py-10"><div className="w-full max-w-md overflow-hidden rounded-[1.5rem] border border-[#d7e3de] bg-white shadow-[0_28px_70px_rgba(18,61,91,.15)]"><div className="bg-[#123d5b] p-7 text-white"><span className="grid size-11 place-items-center overflow-hidden rounded-xl border border-white/25 bg-white p-1 shadow-sm"><img src={logoUrl} alt="Trip Himalaya" className="size-full object-contain" /></span><p className="mt-5 text-xs font-extrabold uppercase tracking-[.14em] text-[#f39a48]">Principal administrator only</p><h1 className="display mt-2 text-4xl font-bold">Reset access.</h1><p className="mt-3 text-sm leading-6 text-white/70">Use the recovery secret stored in your deployment environment to create a new principal password.</p></div><form onSubmit={submit} className="p-7"><div className="grid gap-5"><div><Label htmlFor="email">Principal email address</Label><Input id="email" name="email" type="email" autoComplete="username" className="mt-2 h-11" required /></div><div><Label htmlFor="setupKey">Recovery secret</Label><Input id="setupKey" name="setupKey" type="password" autoComplete="off" className="mt-2 h-11" required /><p className="mt-1.5 text-xs leading-5 text-slate-500">This is the `INITIAL_ADMIN_SETUP_KEY` value from Vercel. It is never displayed or saved in the browser.</p></div><div><Label htmlFor="password">New password</Label><Input id="password" name="password" type="password" autoComplete="new-password" minLength={12} className="mt-2 h-11" required /></div><div><Label htmlFor="confirmPassword">Confirm new password</Label><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} className="mt-2 h-11" required /></div></div><Button disabled={recover.isPending} className="mt-7 h-12 w-full gap-2 rounded-xl bg-[#e9781c] text-xs font-extrabold uppercase tracking-[.1em] hover:bg-[#d86b12]"><KeyRound className="size-4" />{recover.isPending ? "Resetting access…" : "Set new principal password"}</Button>{(formError || recover.error) && <p className="mt-4 text-sm text-red-600">{formError || recover.error?.message}</p>}<p className="mt-5 text-center text-xs leading-5 text-slate-500"><Link href="/admin/login" className="font-bold text-[#123d5b] underline underline-offset-4">Back to secure sign in</Link></p></form></div></main>;
}
