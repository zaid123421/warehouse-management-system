"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { OutboundTruckPlanningBoard } from "@/modules/outbound-sessions/components/outbound-truck-planning-board";
import { useOutboundSchedulingCell } from "@/modules/outbound-sessions/hooks/use-outbound-scheduling-cell";
import { formatSchedulingDayLabel } from "@/shared/lib/scheduling-grid-utils";

type OutboundTruckPlanningPageContentProps = {
  schedulingCellId: number;
};

export function OutboundTruckPlanningPageContent({
  schedulingCellId,
}: OutboundTruckPlanningPageContentProps) {
  const t = useTranslations("outboundSessions");
  const { data: cell } = useOutboundSchedulingCell(schedulingCellId);

  const cityName = cell?.regionCityName || cell?.regionProvinceName || "—";
  const subtitle = cell
    ? [cell.serviceDate, formatSchedulingDayLabel(String(cell.deliveryDay)), cityName]
        .filter(Boolean)
        .join(" · ")
    : t("cellDetailLoading");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <Button type="button" variant="ghost" size="sm" className="mb-2 -ms-2" asChild>
          <Link href={`${ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST}?tab=scheduling`}>
            <ArrowLeft className="size-4" />
            {t("backToOutbound")}
          </Link>
        </Button>
        <h1 className="text-headline-sm font-bold text-foreground">{t("truckPlanningTitle")}</h1>
        <p className="mt-1 text-body-md text-muted-foreground">
          {t("truckPlanningPageIntro", { cellId: schedulingCellId, detail: subtitle })}
        </p>
      </div>

      <OutboundTruckPlanningBoard schedulingCellId={schedulingCellId} />
    </div>
  );
}
