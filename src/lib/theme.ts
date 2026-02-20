export const tema = {
  farger: {
    bakgrunn: "#f8fafc",
    bakgrunnMork: "#0f172a",
    tekst: "#0f172a",
    tekstLys: "#e2e8f0",
    kort: "#ffffff",
    kant: "#e2e8f0",
    primar: "#0f172a",
    primarHover: "#1e293b",
    accent: "#0f6288",
    dempet: "#64748b",
  },
  fonter: {
    hoved: '"Avenir Next", "Satoshi", "Nunito Sans", "Segoe UI", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  spacing: {
    seksjonMobil: "clamp(3rem, 8vw, 4.5rem)",
    seksjonDesktop: "clamp(5rem, 8vw, 7.5rem)",
    tekstHero: "clamp(2.25rem, 5vw, 3.5rem)",
    tekstSeksjon: "clamp(1.75rem, 3vw, 2.125rem)",
  },
} as const;
