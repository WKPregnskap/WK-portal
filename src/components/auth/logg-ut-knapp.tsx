"use client";

import { signOut } from "next-auth/react";
import { Knapp } from "@/components/ui/knapp";

export function LoggUtKnapp() {
  return (
    <Knapp
      variant="sekundaer"
      onClick={() => signOut({ callbackUrl: "/innlogging" })}
      className="text-xs"
      type="button"
    >
      Logg ut
    </Knapp>
  );
}
