import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EmployeeStatusBadgeProps = {
  active: boolean;
  className?: string;
};

export function EmployeeStatusBadge({ active, className }: EmployeeStatusBadgeProps) {
  const t = useTranslations("employees");
  return (
    <Badge
      className={cn(
        "rounded-full border-0 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide",
        active
          ? "bg-emerald-600 text-white hover:bg-emerald-600"
          : "bg-muted text-muted-foreground hover:bg-muted",
        className,
      )}
    >
      {active ? t("statusActive") : t("statusInactive")}
    </Badge>
  );
}
