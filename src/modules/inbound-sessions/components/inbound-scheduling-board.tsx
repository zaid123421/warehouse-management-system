"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ErrorAlert } from "@/components/ui/error-alert";
import { SchedulingBoardShell } from "@/shared/components/scheduling/scheduling-board-shell";
import { SchedulingKpiRow } from "@/shared/components/scheduling/scheduling-kpi-row";
import { SchedulingWeekGrid } from "@/shared/components/scheduling/scheduling-week-grid";
import {
  computeSchedulingBoardStats,
  toSchedulingGridCells,
  type SchedulingGridCell,
} from "@/shared/lib/scheduling-grid-utils";
import { SchedulingCellDetailPanel } from "@/modules/inbound-sessions/components/scheduling-cell-detail-panel";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { useApproveSchedulingCell } from "@/modules/inbound-sessions/hooks/use-approve-scheduling-cell";
import { useSchedulingBoard } from "@/modules/inbound-sessions/hooks/use-scheduling-board";
import { canApproveSchedulingCell } from "@/modules/inbound-sessions/lib/status-utils";

type InboundSchedulingBoardProps = {
  onOpenPlanning?: (cellId?: number) => void;
};

export function InboundSchedulingBoard({ onOpenPlanning }: InboundSchedulingBoardProps) {
  const t = useTranslations("inboundSessions");
  const { data, isPending, isError, error, refetch } = useSchedulingBoard();
  const approveMutation = useApproveSchedulingCell();
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);

  const gridCells = useMemo(
    () => toSchedulingGridCells(data?.cells ?? [], (cell) => cell.receivingDay),
    [data?.cells],
  );
  const stats = useMemo(() => computeSchedulingBoardStats(gridCells), [gridCells]);

  async function handleApprove(cell: SchedulingGridCell) {
    const source = data?.cells.find((item) => item.cellId === cell.cellId);
    try {
      await approveMutation.mutateAsync({
        cellId: cell.cellId,
        version: source?.version ?? 0,
      });
      toast.success(t("approveCellSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  return (
    <SchedulingBoardShell
      hint={t("schedulingBoardHint")}
      toolbar={<p className="text-body-md text-muted-foreground">{t("schedulingIntro")}</p>}
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
            selectedCellId={selectedCellId}
            onSelectCell={setSelectedCellId}
            onApproveCell={(cell) => void handleApprove(cell)}
            canApprove={(cell) => canApproveSchedulingCell(cell.status)}
            isApprovePending={approveMutation.isPending}
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
