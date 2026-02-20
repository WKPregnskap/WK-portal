import { Kort, KortInnhold, KortTittel } from "@/components/ui/kort";
import { InnloggingSkjema } from "@/components/auth/innlogging-skjema";

export default function InnloggingSide() {
  return (
    <main className="seksjon-wrap seksjon-pad">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Werner Klausen Regnskap</p>
          <h1 className="mt-3 text-[var(--tekst-hero)] font-semibold leading-[1.08] text-slate-900">Kundeportal</h1>
          <p className="mt-2 text-sm text-slate-600">Trygg samhandling for bilag, meldinger og økonomisk oversikt.</p>
        </div>

        <Kort>
          <KortInnhold className="space-y-4">
            <KortTittel>Logg inn</KortTittel>
            <InnloggingSkjema />
          </KortInnhold>
        </Kort>
      </div>
    </main>
  );
}
