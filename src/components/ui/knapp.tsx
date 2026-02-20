import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primar" | "sekundaer" | "spokelse";

export interface KnappProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantKlasser: Record<Variant, string> = {
  primar: "bg-slate-900 text-white hover:bg-slate-800",
  sekundaer: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  spokelse: "bg-transparent text-slate-600 hover:bg-slate-100",
};

export const Knapp = React.forwardRef<HTMLButtonElement, KnappProps>(function Knapp(
  { className, variant = "primar", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700/40 disabled:cursor-not-allowed disabled:opacity-60",
        variantKlasser[variant],
        className,
      )}
      {...props}
    />
  );
});
