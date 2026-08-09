"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ErrorAlert } from "@/components/ui/error-alert";
import { SchedulingBoardShell } from "@/shared/components/scheduling/scheduling-board-shell";
import { SchedulingKpiRow } from "@/shared/components/scheduling/scheduling-kpi-row";
import { SchedulingWeekGrid } from "@/shared/components/scheduling/scheduling-week-grid";
import { SchedulingWeekNavigator } from "@/shared/components/scheduling/scheduling-week-navigator";
import { useSchedulingWeek } from "@/shared/hooks/use-scheduling-week";
import {
  computeSchedulingBoardStats,
  toSchedulingGridCells,
} from "@/shared/lib/scheduling-grid-utils";
import { SchedulingCellDetailPanel } from "@/modules/inbound-sessions/components/scheduling-cell-detail-panel";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { useSchedulingBoard } from "@/modules/inbound-sessions/hooks/use-scheduling-board";

type InboundSchedulingBoardProps = {
  onOpenPlanning?: (cellId?: number) => void;
};

export function InboundSchedulingBoard({ onOpenPlanning }: InboundSchedulingBoardProps) {
  const t = useTranslations("inboundSessions");
  const { weekStart, weekStartIso, weekEnd, weekDates, setWeekStart } = useSchedulingWeek();
  const { data, isPending, isError, error, refetch } = useSchedulingBoard({
    weekStart: weekStartIso,
  });
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);

  const gridCells = useMemo(
    () => toSchedulingGridCells(data?.cells ?? [], (cell) => cell.receivingDay),
    [data?.cells],
  );
  const stats = useMemo(() => computeSchedulingBoardStats(gridCells), [gridCells]);

  return (
    <SchedulingBoardShell
      hint={t("schedulingBoardHint")}
      toolbar={
        <>
          <p className="text-body-md text-muted-foreground">{t("schedulingIntro")}</p>
          <SchedulingWeekNavigator
            weekStart={weekStart}
            weekEnd={weekEnd}
            onWeekStartChange={(next) => {
              setSelectedCellId(null);
              setWeekStart(next);
            }}
            translationNamespace="inboundSessions"
          />
        </>
      }
      kpiRow={
        <SchedulingKpiRow stats={stats} translationNamespace="inboundSessions" />
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
            weekDates={weekDates}
            selectedCellId={selectedCellId}
            onSelectCell={setSelectedCellId}
            renderStatusBadge={(status) => <SessionStatusBadge status={status} />}
            translationNamespace="inboundSessions"
            isLoading={isPending}
          />
        </>
      }
      detailPanel={
        <SchedulingCellDetailPanel
          cellId={selectedCellId}
          onClose={() => setSelectedCellId(null)}
          onOpenPlanning={onOpenPlanning}
        />
      }
    />
  );
}
