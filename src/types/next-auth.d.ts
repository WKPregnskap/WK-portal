import { Rolle } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      navn: string;
      epost: string;
      rolle: Rolle;
      organisasjonId: string;
      kundeselskapId: string | null;
    };
  }

  interface User {
    id: string;
    navn: string;
    epost: string;
    rolle: Rolle;
    organisasjonId: string;
    kundeselskapId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    navn: string;
    epost: string;
    rolle: Rolle;
    organisasjonId: string;
    kundeselskapId: string | null;
  }
}
