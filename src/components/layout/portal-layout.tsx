import Link from "next/link";
import { Rolle } from "@prisma/client";
import { LoggUtKnapp } from "@/components/auth/logg-ut-knapp";

type PortalLayoutProps = {
  children: React.ReactNode;
  navn: string;
  rolle: Rolle;
};

const hovedLenker = [
  { href: "/portal", tekst: "Dashboard" },
  { href: "/portal/bilag", tekst: "Manglende bilag" },
  { href: "/portal/meldinger", tekst: "Meldinger" },
  { href: "/portal/mva", tekst: "MVA" },
];

const adminLenker = [
  { href: "/admin/kunder", tekst: "Kundeadministrasjon" },
  { href: "/admin/systemtilkoblinger", tekst: "Systemtilkoblinger" },
  { href: "/admin/oppgaver", tekst: "Oppgaveoversikt" },
];

export function PortalLayout({ children, navn, rolle }: PortalLayoutProps) {
  const visAdmin = rolle === "ADMIN" || rolle === "REGNSKAPSFORER";

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="seksjon-wrap flex h-16 items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">WK Portal</p>
            <p className="text-sm font-semibold text-slate-900">{navn}</p>
          </div>
          <LoggUtKnapp />
        </div>
      </header>

      <div className="seksjon-wrap grid gap-6 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="overflate-kort h-fit p-4">
          <nav className="space-y-1">
            {hovedLenker.map((lenke) => (
              <Link
                key={lenke.href}
                href={lenke.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {lenke.tekst}
              </Link>
            ))}
          </nav>

          {visAdmin ? (
            <>
              <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
              <nav className="space-y-1">
                {adminLenker.map((lenke) => (
                  <Link
                    key={lenke.href}
                    href={lenke.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {lenke.tekst}
                  </Link>
                ))}
              </nav>
            </>
          ) : null}
        </aside>

        <section className="space-y-6">{children}</section>
      </div>
    </div>
  );
}
