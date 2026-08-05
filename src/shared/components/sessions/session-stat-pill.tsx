import { formatCount } from "@/lib/format-number";
import { cn } from "@/lib/utils";

export type SessionStatTone = "default" | "success" | "warning" | "muted";

type SessionStatPillProps = {
  label: string;
  value: number;
  tone?: SessionStatTone;
  className?: string;
};

export function SessionStatPill({
  label,
  value,
  tone = "default",
  className,
}: SessionStatPillProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5 text-center",
        tone === "warning" && "border-amber-500/35 bg-amber-500/10",
        tone === "success" && "border-emerald-500/35 bg-emerald-500/10",
        tone === "default" && "border-primary/25 bg-primary/5",
        tone === "muted" &&
          "border-[var(--color-surface-light-container)] bg-card dark:border-[var(--color-surface-container-high)]",
        className,
      )}
    >
      <p className="text-body-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-headline-sm font-bold",
          tone === "warning" && "text-amber-700 dark:text-amber-400",
          tone === "success" && "text-emerald-700 dark:text-emerald-400",
          tone === "default" && "text-primary",
          tone === "muted" && "text-foreground",
        )}
      >
        {formatCount(value)}
      </p>
    </div>
  );
}
