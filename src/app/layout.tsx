import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "WK Portal",
    template: "%s | WK Portal",
  },
  description: "Kundeportal for Werner Klausen Regnskap AS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>{children}</body>
    </html>
  );
}
