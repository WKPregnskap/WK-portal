# Architecture Notes

## Mal
- Hall portalen separat fran befintlig hemsida.
- Bygg for modulart arbete per feature.
- Hall testbarhet och tydlig mappstruktur fran start.

## Rekommenderad riktning
- Feature-baserad utveckling under `src/features/`.
- Delade UI-delar under `src/components/`.
- API- och integrationslogik under `src/services/`.
- Teststrategi: `tests/unit/` + `tests/e2e/`.
