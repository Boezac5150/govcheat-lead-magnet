import { useState } from "react";
import { Link } from "wouter";
import { Loader2, LockKeyhole } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();

  const finish = async () => {
    await utils.auth.me.invalidate();
    window.location.href = "/dashboard";
  };
  const login = trpc.auth.login.useMutation({ onSuccess: finish, onError: e => setError(e.message) });
  const register = trpc.auth.register.useMutation({ onSuccess: finish, onError: e => setError(e.message) });
  const pending = login.isPending || register.isPending;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (mode === "login") login.mutate({ email, password });
    else register.mutate({ name, email, password });
  };

  return (
    <main className="min-h-screen bg-[oklch(0.07_0.01_250)] text-white grid place-items-center px-4 py-12">
      <Card className="w-full max-w-md border-[oklch(0.28_0.04_155)] bg-[oklch(0.1_0.01_250)] text-white shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 text-xl font-black tracking-tight">
            GOV<span className="text-[var(--color-govgreen)]">CHEAT</span>
          </Link>
          <div className="mx-auto grid h-12 w-12 place-items-center border border-[var(--color-govgreen)] text-[var(--color-govgreen)]">
            <LockKeyhole size={22} />
          </div>
          <CardTitle className="text-3xl font-black">{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
          <CardDescription className="text-slate-400">
            {mode === "login" ? "Sign in to manage contracts and bids." : "Build your business profile and start matching."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required minLength={2} autoComplete="name" /></div>}
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={mode === "register" ? 10 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} /></div>
            {mode === "register" && <p className="text-xs text-slate-500">Use at least 10 characters.</p>}
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full bg-[var(--color-govgreen)] font-bold text-black hover:brightness-110" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="mt-6 w-full text-sm text-slate-400 hover:text-[var(--color-govgreen)]">
            {mode === "login" ? "New to GovCheat? Create an account" : "Already have an account? Sign in"}
          </button>
        </CardContent>
      </Card>
    </main>
  );
}
