import { Rolle } from "@prisma/client";

export const tillatelser = {
  admin: [Rolle.ADMIN],
  regnskapsforer: [Rolle.ADMIN, Rolle.REGNSKAPSFORER],
  kunde: [Rolle.ADMIN, Rolle.REGNSKAPSFORER, Rolle.KUNDE],
};

export function harRolle(rolle: Rolle, tillatt: Rolle[]) {
  return tillatt.includes(rolle);
}
