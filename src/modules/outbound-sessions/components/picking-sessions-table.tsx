"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
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
import { useReadyToShipTrucks } from "@/modules/outbound-sessions/hooks/use-ready-to-ship-trucks";
import {
  canApprovePickingSession,
  canAssignPickingSession,
  canCancelPickingSession,
  canCompletePickingSession,
  canStartPickingSession,
  formatDayLabel,
} from "@/modules/outbound-sessions/lib/status-utils";
import type { PickingSession } from "@/modules/outbound-sessions/types/picking-session";
import { AssignedStaffRow } from "@/shared/components/sessions/assigned-staff-row";
import {
  SessionListCard,
  sessionStatusAccent,
} from "@/shared/components/sessions/session-list-card";
import { SessionStatPill } from "@/shared/components/sessions/session-stat-pill";
import {
  formatSessionTimestamp,
  SessionTimeline,
} from "@/shared/components/sessions/session-timeline";
import {
  buildTabHighlightHref,
  useHighlightId,
  useScrollToHighlight,
} from "@/shared/hooks/use-highlight-id";
import { useStaffNameMap } from "@/shared/hooks/use-staff-name-map";
import { computeSessionListStats } from "@/shared/lib/session-stats";

export function PickingSessionsTable() {
  const t = useTranslations("outboundSessions");
  const { data = [], isPending, isError, error, refetch } = usePickingSessions();
  const { data: readyTrucks = [] } = useReadyToShipTrucks();
  const highlightId = useHighlightId();
  useScrollToHighlight(highlightId);
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
  const { resolveNames } = useStaffNameMap(true);

  const { data: detailData, isFetching: isDetailFetching } = usePickingSessionDetail(
    assignSession?.id ?? 0,
    { enabled: assignSession != null },
  );

  const stats = useMemo(() => computeSessionListStats(data), [data]);

  const readyTruckIds = useMemo(() => {
    return new Set(readyTrucks.map((truck) => truck.truckId));
  }, [readyTrucks]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(
      (session) =>
        String(session.id).includes(lowerQuery) ||
        (session.serviceDate || "").includes(lowerQuery) ||
        (session.dealerName?.toLowerCase() || "").includes(lowerQuery) ||
        (session.outboundTruckLabel?.toLowerCase() || "").includes(lowerQuery),
    );
  }, [data, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-md text-muted-foreground">{t("pickingIntro")}</p>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPickingPlaceholder")}
            className="h-10 w-full bg-card pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:max-w-lg">
        <SessionStatPill
          label={t("sessionStatPending")}
          value={stats.pendingApproval}
          tone="warning"
        />
        <SessionStatPill
          label={t("sessionStatInProgress")}
          value={stats.inProgress}
          tone="success"
        />
        <SessionStatPill
          label={t("sessionStatCompleted")}
          value={stats.completed}
          tone="default"
        />
      </div>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={t("retry")}
        />
      ) : null}

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-surface-light-container)] bg-card px-4 py-12 text-center dark:border-[var(--color-surface-container-high)]">
          <p className="text-body-md text-muted-foreground">{t("noPickingSessions")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedData.map((session) => {
              const picked = session.pickedTires ?? session.completedCount ?? 0;
              const remaining = Math.max(0, session.expectedTires - picked);
              const staffNames = resolveNames(session.assignedStaffUserIds);
              const canGoReadyToShip =
                session.status === "COMPLETED" &&
                session.outboundTruckId != null &&
                readyTruckIds.has(session.outboundTruckId);
              const isHighlighted = highlightId === session.id;
              return (
                <SessionListCard
                  key={session.id}
                  accent={sessionStatusAccent(session.status)}
                  selected={isHighlighted}
                  data-highlight-id={session.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <p className="text-label-lg font-semibold text-foreground">
                        {t("pickingSessionLabel", { id: session.id })}
                        {session.dealerName ? ` · ${session.dealerName}` : ""}
                      </p>
                      <p className="text-body-sm font-medium text-foreground">
                        {session.serviceDate
                          ? `${t("columnServiceDate")}: ${session.serviceDate}`
                          : null}
                        {session.serviceDate && session.deliveryDay ? " · " : null}
                        {session.deliveryDay
                          ? formatDayLabel(session.deliveryDay)
                          : null}
                      </p>
                      <p className="text-body-sm text-muted-foreground">
                        {session.outboundTruckLabel ??
                          (session.outboundTruckId
                            ? t("truckLabel", { id: session.outboundTruckId })
                            : t("sessionNoTruck"))}
                      </p>
                    </div>
                    <OutboundSessionStatusBadge status={session.status} />
                  </div>

                  <div className="mt-3">
                    <AssignedStaffRow
                      names={staffNames}
                      notAssignedLabel={t("sessionNotAssigned")}
                      assignedLabel={t("assignedStaffLabel")}
                      assignLabel={t("assignStaff")}
                      addStaffLabel={t("addStaff")}
                      canAssign={canAssignPickingSession(session.status)}
                      onAssign={() => setAssignSession(session)}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-body-sm sm:grid-cols-3">
                    <span className="text-muted-foreground">
                      {t("sessionPicked")}:{" "}
                      <span className="font-medium text-foreground">{picked}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {t("sessionRemaining")}:{" "}
                      <span className="font-medium text-foreground">{remaining}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {t("columnRequests")}:{" "}
                      <span className="font-medium text-foreground">
                        {session.outboundRequestCount ?? session.outboundRequests.length}
                      </span>
                    </span>
                  </div>

                  <div className="mt-3">
                    <SessionProgressBar
                      value={session.progressPercent ?? 0}
                      label={t("columnProgress")}
                    />
                  </div>

                  <div className="mt-3">
                    <SessionTimeline
                      steps={[
                        {
                          key: "created",
                          label: t("timelineCreated"),
                          value: formatSessionTimestamp(session.createdAt),
                        },
                        {
                          key: "approved",
                          label: t("timelineApproved"),
                          value: formatSessionTimestamp(session.approvedAt),
                        },
                        {
                          key: "started",
                          label: t("timelineStarted"),
                          value: formatSessionTimestamp(session.startedAt),
                        },
                        {
                          key: "completed",
                          label: t("timelineCompleted"),
                          value: formatSessionTimestamp(session.completedAt),
                        },
                      ]}
                    />
                  </div>

                  {session.status === "PENDING_APPROVAL" ? (
                    <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-body-sm text-amber-800 dark:text-amber-300">
                      {t("pickingPendingApprovalHint")}
                    </p>
                  ) : null}

                  {session.exceptionScanCount ? (
                    <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-body-sm text-destructive">
                      {t("sessionExceptions", { count: session.exceptionScanCount })}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" asChild>
                      <Link href={ROUTES.DASHBOARD.OUTBOUND_SESSIONS.PICKING_DETAIL(session.id)}>
                        <Eye className="size-4" />
                        {t("viewDetails")}
                      </Link>
                    </Button>
                    {canApprovePickingSession(session.status) ? (
                      <Button
                        type="button"
                        size="sm"
                        className={PRIMARY_BUTTON_CLASS}
                        disabled={approveMutation.isPending}
                        onClick={() =>
                          void runAction(
                            () =>
                              approveMutation.mutateAsync({
                                sessionId: session.id,
                                version: session.version ?? 0,
                              }),
                            "approveSessionSuccess",
                          )
                        }
                      >
                        <Check className="size-4" />
                        {t("approveSession")}
                      </Button>
                    ) : null}
                    {canCancelPickingSession(session.status) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={cancelMutation.isPending}
                        onClick={() => setPendingCancel(session)}
                      >
                        <Trash2 className="size-4" />
                        {t("cancelSession")}
                      </Button>
                    ) : null}
                    {canStartPickingSession(session.status) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={startMutation.isPending}
                        onClick={() =>
                          void runAction(
                            () =>
                              startMutation.mutateAsync({
                                sessionId: session.id,
                                version: session.version ?? 0,
                              }),
                            "startSessionSuccess",
                          )
                        }
                      >
                        <Play className="size-4" />
                        {t("startSession")}
                      </Button>
                    ) : null}
                    {canCompletePickingSession(session.status) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={completeMutation.isPending}
                        onClick={() =>
                          void runAction(
                            () =>
                              completeMutation.mutateAsync({
                                sessionId: session.id,
                                version: session.version ?? 0,
                              }),
                            "completeSessionSuccess",
                          )
                        }
                      >
                        <Square className="size-4" />
                        {t("completeSession")}
                      </Button>
                    ) : null}
                    {session.status === "COMPLETED" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                        disabled={!canGoReadyToShip}
                        asChild={canGoReadyToShip}
                      >
                        {canGoReadyToShip && session.outboundTruckId ? (
                          <Link
                            href={buildTabHighlightHref(
                              ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST,
                              "ready-to-ship",
                              session.outboundTruckId,
                            )}
                          >
                            <PackagePlus className="size-4" />
                            {t("readyToShipHintAction")}
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <PackagePlus className="size-4" />
                            {t("readyToShipHintAction")}
                          </span>
                        )}
                      </Button>
                    ) : null}
                  </div>
                </SessionListCard>
              );
            })}
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <AssignStaffDialog
        open={assignSession != null}
        onOpenChange={(open) => !open && setAssignSession(null)}
        title={t("assignPickingTitle")}
        description={t("assignPickingDescription", { id: assignSession?.id ?? "" })}
        initialStaffIds={
          detailData?.assignedStaffUserIds ?? assignSession?.assignedStaffUserIds ?? []
        }
        isPending={assignMutation.isPending || isDetailFetching}
        translationNamespace="outboundSessions"
        onConfirm={async (staffUserIds) => {
          if (!assignSession) return;
          await runAction(
            () =>
              assignMutation.mutateAsync({
                sessionId: assignSession.id,
                payload: {
                  staffUserIds,
                  version: detailData?.version ?? assignSession.version ?? 0,
                },
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
                  await cancelMutation.mutateAsync({
                    sessionId: pendingCancel.id,
                    version: pendingCancel.version ?? 0,
                  });
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
