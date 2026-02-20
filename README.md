# WK-portal

Fristaende projekt for WK Portal. Detta repo ar **inte** kopplat till hemsidan.

## Projektstruktur

```
WK-portal/
  .github/workflows/      # CI
  docs/                   # Arkitektur, roadmap, beslutsunderlag
  public/                 # Statiska filer
  scripts/                # Lokala scripts
  src/
    assets/               # Bilder, ikoner, fonter
    components/           # Delade UI-komponenter
    features/             # Funktionsomraden (t.ex. auth, dashboard)
    layouts/              # Sidlayouter
    pages/                # Sidor / routes
    services/             # API-klienter, datatjanster
    styles/               # Globala stilar, design tokens
    utils/                # Hjalfunktioner
  tests/
    unit/                 # Enhetstester
    e2e/                  # End-to-end tester
```

## Snabbstart

1. Valt teknikstack (exempel: React + Vite, Next.js, eller annan).
2. Implementera i `src/` enligt strukturen ovan.
3. Lagg till tester under `tests/`.

## GitHub-koppling

Nar du har skapat ett tomt repo pa GitHub, koppla det sa har:

```bash
git remote add origin <DIN_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

