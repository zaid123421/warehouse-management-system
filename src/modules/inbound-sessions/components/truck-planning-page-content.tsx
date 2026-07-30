"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { InboundTruckPlanningBoard } from "@/modules/inbound-sessions/components/inbound-truck-planning-board";
import { useSchedulingCell } from "@/modules/inbound-sessions/hooks/use-scheduling-cell";
import { formatSchedulingDayLabel } from "@/shared/lib/scheduling-grid-utils";

type TruckPlanningPageContentProps = {
  schedulingCellId: number;
};

export function TruckPlanningPageContent({ schedulingCellId }: TruckPlanningPageContentProps) {
  const t = useTranslations("inboundSessions");
  const { data: cell } = useSchedulingCell(schedulingCellId);

  const subtitle = cell
    ? [
        cell.serviceDate,
        formatSchedulingDayLabel(cell.receivingDay),
        cell.regionProvinceName ?? "—",
      ]
        .filter(Boolean)
        .join(" · ")
    : t("cellDetailLoading");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <Button type="button" variant="ghost" size="sm" className="mb-2 -ms-2" asChild>
          <Link href={`${ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST}?tab=scheduling`}>
            <ArrowLeft className="size-4" />
            {t("backToInbound")}
          </Link>
        </Button>
        <h1 className="text-headline-sm font-bold text-foreground">{t("truckPlanningTitle")}</h1>
        <p className="mt-1 text-body-md text-muted-foreground">
          {t("truckPlanningPageIntro", { cellId: schedulingCellId, detail: subtitle })}
        </p>
      </div>

      <InboundTruckPlanningBoard schedulingCellId={schedulingCellId} />
    </div>
  );
}
