"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { cn } from "@/lib/utils";
import { SchedulingBoardShell } from "@/shared/components/scheduling/scheduling-board-shell";
import { SchedulingKpiRow } from "@/shared/components/scheduling/scheduling-kpi-row";
import { SchedulingWeekGrid } from "@/shared/components/scheduling/scheduling-week-grid";
import {
  computeSchedulingBoardStats,
  formatSchedulingDayLabel,
  SCHEDULING_DAYS_OF_WEEK,
  toSchedulingGridCells,
  type SchedulingGridCell,
} from "@/shared/lib/scheduling-grid-utils";
import { SchedulingCellDetailPanel } from "@/modules/inbound-sessions/components/scheduling-cell-detail-panel";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { useApproveSchedulingCell } from "@/modules/inbound-sessions/hooks/use-approve-scheduling-cell";
import { useGenerateReceivingSessions } from "@/modules/inbound-sessions/hooks/use-generate-receiving-sessions";
import { useSchedulingBoard } from "@/modules/inbound-sessions/hooks/use-scheduling-board";
import { canApproveSchedulingCell } from "@/modules/inbound-sessions/lib/status-utils";

export function InboundSchedulingBoard() {
  const t = useTranslations("inboundSessions");
  const { data, isPending, isError, error, refetch } = useSchedulingBoard();
  const approveMutation = useApproveSchedulingCell();
  const generateMutation = useGenerateReceivingSessions();
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [generateDay, setGenerateDay] = useState<string>(SCHEDULING_DAYS_OF_WEEK[0]);

  const gridCells = useMemo(
    () => toSchedulingGridCells(data?.cells ?? [], (cell) => cell.receivingDay),
    [data?.cells],
  );
  const stats = useMemo(() => computeSchedulingBoardStats(gridCells), [gridCells]);

  async function handleApprove(cell: SchedulingGridCell) {
    try {
      await approveMutation.mutateAsync(cell.cellId);
      toast.success(t("approveCellSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  async function handleGenerate() {
    try {
      const result = await generateMutation.mutateAsync({ receivingDay: generateDay });
      toast.success(t("generateReceivingSuccess", { count: result.sessions.length }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  return (
    <SchedulingBoardShell
      hint={t("schedulingBoardHint")}
      toolbar={
        <>
          <p className="text-body-md text-muted-foreground">{t("schedulingIntro")}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={generateDay} onValueChange={setGenerateDay}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("selectDay")} />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULING_DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {formatSchedulingDayLabel(day)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              className={cn(PRIMARY_BUTTON_CLASS, "shrink-0")}
              disabled={generateMutation.isPending}
              onClick={() => void handleGenerate()}
            >
              {generateMutation.isPending ? t("generating") : t("generateReceivingSessions")}
            </Button>
          </div>
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
            selectedCellId={selectedCellId}
            onSelectCell={setSelectedCellId}
            onApproveCell={(cell) => void handleApprove(cell)}
            canApprove={canApproveSchedulingCell}
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
        />
      }
    />
  );
}
