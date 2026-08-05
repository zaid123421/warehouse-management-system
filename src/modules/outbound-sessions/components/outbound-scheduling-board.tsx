"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ErrorAlert } from "@/components/ui/error-alert";
import { SchedulingBoardShell } from "@/shared/components/scheduling/scheduling-board-shell";
import { SchedulingKpiRow } from "@/shared/components/scheduling/scheduling-kpi-row";
import { SchedulingWeekGrid } from "@/shared/components/scheduling/scheduling-week-grid";
import {
  computeSchedulingBoardStats,
  toSchedulingGridCells,
} from "@/shared/lib/scheduling-grid-utils";
import { OutboundSchedulingCellDetailPanel } from "@/modules/outbound-sessions/components/outbound-scheduling-cell-detail-panel";
import { OutboundSessionStatusBadge } from "@/modules/outbound-sessions/components/shared/session-status-badge";
import { useOutboundSchedulingBoard } from "@/modules/outbound-sessions/hooks/use-outbound-scheduling-board";

type OutboundSchedulingBoardProps = {
  onOpenPlanning?: (cellId?: number) => void;
};

export function OutboundSchedulingBoard({ onOpenPlanning }: OutboundSchedulingBoardProps) {
  const t = useTranslations("outboundSessions");
  const { data, isPending, isError, error, refetch } = useOutboundSchedulingBoard();
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);

  const gridCells = useMemo(
    () =>
      toSchedulingGridCells(
        (data?.cells ?? []).map((cell) => ({
          ...cell,
          regionProvinceName: cell.regionCityName || cell.regionProvinceName || "—",
        })),
        (cell) => cell.deliveryDay,
      ),
    [data?.cells],
  );
  const stats = useMemo(() => computeSchedulingBoardStats(gridCells), [gridCells]);

  return (
    <SchedulingBoardShell
      hint={t("schedulingBoardHint")}
      toolbar={
        <p className="text-body-md text-muted-foreground">{t("schedulingIntro")}</p>
      }
      kpiRow={
        <SchedulingKpiRow stats={stats} translationNamespace="outboundSessions" />
      }
      grid={
        <>
          {isError ? (
            <ErrorAlert
              message={error instanceof Error ? error.message : t("errorLoading")}
              onRetry={() => void refetch()}
              retryLabel={t("retry")}
            />
          ) : null}
          <SchedulingWeekGrid
            cells={gridCells}
            selectedCellId={selectedCellId}
            onSelectCell={setSelectedCellId}
            renderStatusBadge={(status) => <OutboundSessionStatusBadge status={status} />}
            translationNamespace="outboundSessions"
            isLoading={isPending}
          />
        </>
      }
      detailPanel={
        <OutboundSchedulingCellDetailPanel
          cellId={selectedCellId}
          onClose={() => setSelectedCellId(null)}
          onOpenPlanning={onOpenPlanning}
        />
      }
    />
  );
}
