import { cn } from "@/lib/utils/cn";

export function Kort({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflate-kort", className)} {...props} />;
}

export function KortTittel({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-slate-900", className)} {...props} />;
}

export function KortInnhold({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
