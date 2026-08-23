import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { OFFICIAL_TRIP_HIMALAYA_LOGO } from "@/lib/brand";
import { LockKeyhole } from "lucide-react";
import { FormEvent, useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { data, isLoading } = trpc.adminAuth.setupStatus.useQuery();
  const { data: agencyProfile } = trpc.agency.get.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const login = trpc.adminAuth.login.useMutation();
  const logoUrl = agencyProfile?.logoUrl || OFFICIAL_TRIP_HIMALAYA_LOGO;

  useEffect(() => {
    if (!isLoading && data?.needsSetup) setLocation("/admin/setup");
  }, [data, isLoading, setLocation]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    login.mutate(
      { email: String(form.get("email")), password: String(form.get("password")) },
      { onSuccess: () => window.location.assign("/admin") },
    );
  }

  return <main className="grid min-h-screen place-items-center bg-[#eef4f2] px-4 py-10">
    <div className="w-full max-w-md overflow-hidden rounded-[1.5rem] border border-[#d7e3de] bg-white shadow-[0_28px_70px_rgba(18,61,91,.15)]">
      <div className="bg-[#123d5b] p-7 text-white">
        <span className="grid size-11 place-items-center overflow-hidden rounded-xl border border-white/25 bg-white p-1 shadow-sm"><img src={logoUrl} alt="Trip Himalaya" className="size-full object-contain" /></span>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[.14em] text-[#f39a48]">Trip Himalaya</p>
        <h1 className="display mt-2 text-4xl font-bold">Operations sign in.</h1>
        <p className="mt-3 text-sm leading-6 text-white/70">This page is for approved Trip Himalaya administrators only.</p>
      </div>
      <form onSubmit={submit} className="p-7">
        <div className="grid gap-5">
          <div><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" autoComplete="email" className="mt-2 h-11" required /></div>
          <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" className="mt-2 h-11" required /></div>
        </div>
        <Button disabled={login.isPending} className="mt-7 h-12 w-full gap-2 rounded-xl bg-[#e9781c] text-xs font-extrabold uppercase tracking-[.1em] hover:bg-[#d86b12]"><LockKeyhole className="size-4" />{login.isPending ? "Checking access…" : "Sign in securely"}</Button>
        {login.error && <p className="mt-4 text-sm text-red-600">{login.error.message}</p>}
        
  </main>;
}
