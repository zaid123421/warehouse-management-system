"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Check,
  Eye,
  PackagePlus,
  Play,
  Search,
  Square,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { StyledTable } from "@/components/ui/styled-table";
import { ROUTES } from "@/constants/routes";
import { formatCount } from "@/lib/format-number";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { AssignStaffDialog } from "@/modules/inbound-sessions/components/shared/assign-staff-dialog";
import { SessionProgressBar } from "@/modules/inbound-sessions/components/shared/session-progress-bar";
import { OutboundSessionStatusBadge } from "@/modules/outbound-sessions/components/shared/session-status-badge";
import { usePickingSessionDetail } from "@/modules/outbound-sessions/hooks/use-picking-session-detail";
import {
  useApprovePickingSession,
  useAssignPickingSession,
  useCancelPickingSession,
  useCompletePickingSession,
  useStartPickingSession,
} from "@/modules/outbound-sessions/hooks/use-picking-session-mutations";
import { usePickingSessions } from "@/modules/outbound-sessions/hooks/use-picking-sessions";
import {
  canApprovePickingSession,
  canAssignPickingSession,
  canCancelPickingSession,
  canCompletePickingSession,
  canStartPickingSession,
  formatDayLabel,
} from "@/modules/outbound-sessions/lib/status-utils";
import type { PickingSession } from "@/modules/outbound-sessions/types/picking-session";

export function PickingSessionsTable() {
  const t = useTranslations("outboundSessions");
  const { data = [], isPending, isError, error, refetch } = usePickingSessions();
  const approveMutation = useApprovePickingSession();
  const cancelMutation = useCancelPickingSession();
  const assignMutation = useAssignPickingSession();
  const startMutation = useStartPickingSession();
  const completeMutation = useCompletePickingSession();
  const [assignSession, setAssignSession] = useState<PickingSession | null>(null);
  const [pendingCancel, setPendingCancel] = useState<PickingSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: detailData, isFetching: isDetailFetching } = usePickingSessionDetail(assignSession?.id ?? 0, {
    enabled: assignSession != null,
  });

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter((session) => 
      String(session.id).includes(lowerQuery) || 
      (session.serviceDate || "").includes(lowerQuery)
    );
  }, [data, searchQuery]);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  async function runAction(
    action: () => Promise<unknown>,
    successKey:
      | "approveSessionSuccess"
      | "cancelSessionSuccess"
      | "assignSuccess"
      | "startSessionSuccess"
      | "completeSessionSuccess",
  ) {
    try {
      await action();
      toast.success(t(successKey));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2 w-full sm:max-w-sm">
          <p className="text-body-md text-muted-foreground">{t("pickingIntro")}</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, assignee, date..."
              className="pl-9 h-10 w-full bg-card"
            />
          </div>
        </div>
      </div>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={t("retry")}
        />
      ) : null}

      <div className="flex flex-col gap-4">
        <StyledTable
          rows={paginatedData}
          columns={[
            { header: t("columnSession"), render: (row) => `#${row.id}` },
            {
              header: t("columnServiceDate"),
              render: (row) => row.serviceDate ?? "—",
            },
            {
              header: t("columnTruck"),
              render: (row) =>
                row.outboundTruckLabel ??
                (row.outboundTruckId ? `#${row.outboundTruckId}` : "—"),
            },
            {
              header: t("columnDay"),
              render: (row) => (row.deliveryDay ? formatDayLabel(row.deliveryDay) : "—"),
            },
            {
              header: t("columnStatus"),
              render: (row) => <OutboundSessionStatusBadge status={row.status} />,
            },
            {
              header: t("columnProgress"),
              render: (row) => <SessionProgressBar value={row.progressPercent ?? 0} />,
            },
            {
              header: t("columnTires"),
              render: (row) => {
                const picked = row.pickedTires ?? row.completedCount ?? 0;
                return `${picked}/${row.expectedTires}`;
              },
            },
            {
              header: t("columnRequests"),
              render: (row) =>
                formatCount(row.outboundRequestCount ?? row.outboundRequests.length),
            },
            {
              header: t("columnActions"),
              render: (row) => (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button type="button" size="sm" variant="outline" asChild>
                    <Link href={ROUTES.DASHBOARD.OUTBOUND_SESSIONS.PICKING_DETAIL(row.id)}>
                      <Eye className="size-4" />
                      {t("viewDetails")}
                    </Link>
                  </Button>
                  {canApprovePickingSession(row.status) ? (
                    <Button
                      type="button"
                      size="sm"
                      className={PRIMARY_BUTTON_CLASS}
                      disabled={approveMutation.isPending}
                      onClick={() =>
                        void runAction(
                          () => approveMutation.mutateAsync(row.id),
                          "approveSessionSuccess",
                        )
                      }
                    >
                      <Check className="size-4" />
                      {t("approveSession")}
                    </Button>
                  ) : null}
                  {canCancelPickingSession(row.status) ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={cancelMutation.isPending}
                      onClick={() => setPendingCancel(row)}
                    >
                      <Trash2 className="size-4" />
                      {t("cancelSession")}
                    </Button>
                  ) : null}
                  {canAssignPickingSession(row.status) ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setAssignSession(row)}
                    >
                      <UserPlus className="size-4" />
                      {t("assignStaff")}
                    </Button>
                  ) : null}
                  {canStartPickingSession(row.status) ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={startMutation.isPending}
                      onClick={() =>
                        void runAction(
                          () => startMutation.mutateAsync(row.id),
                          "startSessionSuccess",
                        )
                      }
                    >
                      <Play className="size-4" />
                      {t("startSession")}
                    </Button>
                  ) : null}
                  {canCompletePickingSession(row.status) ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={completeMutation.isPending}
                      onClick={() =>
                        void runAction(
                          () => completeMutation.mutateAsync(row.id),
                          "completeSessionSuccess",
                        )
                      }
                    >
                      <Square className="size-4" />
                      {t("completeSession")}
                    </Button>
                  ) : null}
                  {row.status === "COMPLETED" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                      asChild
                    >
                      <Link href={`${ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST}?tab=ready-to-ship`}>
                        <PackagePlus className="size-4" />
                        {t("readyToShipHintAction") || "Check Ready Trucks"}
                      </Link>
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
          keyProp={(row) => row.id}
          isLoading={isPending}
          emptyText={t("noPickingSessions")}
          horizontalScroll
        />

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <AssignStaffDialog
        open={assignSession != null}
        onOpenChange={(open) => !open && setAssignSession(null)}
        title={t("assignPickingTitle")}
        description={t("assignPickingDescription", { id: assignSession?.id ?? "" })}
        initialStaffIds={detailData?.assignedStaffUserIds ?? assignSession?.assignedStaffUserIds ?? []}
        isPending={assignMutation.isPending || isDetailFetching}
        translationNamespace="outboundSessions"
        onConfirm={async (staffUserIds) => {
          if (!assignSession) return;
          await runAction(
            () =>
              assignMutation.mutateAsync({
                sessionId: assignSession.id,
                payload: { staffUserIds },
              }),
            "assignSuccess",
          );
          setAssignSession(null);
        }}
      />

      <Dialog open={pendingCancel != null} onOpenChange={(open) => !open && setPendingCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cancelSessionConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("cancelSessionConfirmDescription", { id: pendingCancel?.id ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingCancel(null)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={() =>
                void runAction(async () => {
                  if (!pendingCancel) return;
                  await cancelMutation.mutateAsync(pendingCancel.id);
                  setPendingCancel(null);
                }, "cancelSessionSuccess")
              }
            >
              {cancelMutation.isPending ? t("saving") : t("cancelSession")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
