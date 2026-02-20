import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/innlogging",
  },
  providers: [
    CredentialsProvider({
      name: "Portalinnlogging",
      credentials: {
        epost: { label: "E-post", type: "email" },
        passord: { label: "Passord", type: "password" },
      },
      async authorize(credentials) {
        const epost = credentials?.epost;
        const passord = credentials?.passord;

        if (!epost || !passord) return null;

        const bruker = await prisma.bruker.findUnique({
          where: { epost },
        });

        if (!bruker || !bruker.aktiv) return null;

        const gyldig = await bcrypt.compare(passord, bruker.passordHash);
        if (!gyldig) return null;

        await prisma.bruker.update({
          where: { id: bruker.id },
          data: { sistInnlogget: new Date() },
        });

        return {
          id: bruker.id,
          navn: bruker.navn,
          epost: bruker.epost,
          rolle: bruker.rolle,
          organisasjonId: bruker.organisasjonId,
          kundeselskapId: bruker.kundeselskapId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.navn = user.navn;
        token.epost = user.epost;
        token.rolle = user.rolle;
        token.organisasjonId = user.organisasjonId;
        token.kundeselskapId = user.kundeselskapId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        navn: token.navn,
        epost: token.epost,
        rolle: token.rolle,
        organisasjonId: token.organisasjonId,
        kundeselskapId: token.kundeselskapId,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
