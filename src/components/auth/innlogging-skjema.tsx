"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Knapp } from "@/components/ui/knapp";

export function InnloggingSkjema() {
  const router = useRouter();
  const [epost, setEpost] = useState("admin@wkpregnskap.no");
  const [passord, setPassord] = useState("Admin123!");
  const [feil, setFeil] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);

  async function vedSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeil(null);
    setLaster(true);

    const result = await signIn("credentials", {
      epost,
      passord,
      redirect: false,
    });

    setLaster(false);

    if (!result?.ok) {
      setFeil("Innlogging feilet. Sjekk e-post og passord.");
      return;
    }

    router.push("/portal");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={vedSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="epost">
          E-post
        </label>
        <Input id="epost" type="email" value={epost} onChange={(e) => setEpost(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="passord">
          Passord
        </label>
        <Input
          id="passord"
          type="password"
          value={passord}
          onChange={(e) => setPassord(e.target.value)}
          required
        />
      </div>

      {feil ? <p className="text-sm text-red-700">{feil}</p> : null}
      <Knapp type="submit" className="w-full" disabled={laster}>
        {laster ? "Logger inn..." : "Logg inn"}
      </Knapp>
      <p className="text-xs text-slate-500">Demo: admin@wkpregnskap.no / Admin123!</p>
    </form>
  );
}
