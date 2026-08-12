"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Eye, PackagePlus, Play, Search, Square, X } from "lucide-react";
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
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { useReceivingSessionDetail } from "@/modules/inbound-sessions/hooks/use-receiving-session-detail";
import {
  useApproveReceivingSession,
  useAssignReceivingSession,
  useCompleteReceivingSession,
  useRejectReceivingSession,
  useStartReceivingSession,
} from "@/modules/inbound-sessions/hooks/use-receiving-session-mutations";
import { useReceivingSessions } from "@/modules/inbound-sessions/hooks/use-receiving-sessions";
import { usePutawaySessions } from "@/modules/inbound-sessions/hooks/use-putaway-sessions";
import {
  canApproveReceivingSession,
  canAssignReceivingSession,
  canCompleteReceivingSession,
  canStartReceivingSession,
} from "@/modules/inbound-sessions/lib/status-utils";
import type { ReceivingSession } from "@/modules/inbound-sessions/types/receiving-session";
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

export function ReceivingSessionsTable() {
  const t = useTranslations("inboundSessions");
  const { data = [], isPending, isError, error, refetch } = useReceivingSessions();
  const { data: putawaySessions = [] } = usePutawaySessions();
  const highlightId = useHighlightId();
  useScrollToHighlight(highlightId);
  const approveMutation = useApproveReceivingSession();
  const rejectMutation = useRejectReceivingSession();
  const assignMutation = useAssignReceivingSession();
  const startMutation = useStartReceivingSession();
  const completeMutation = useCompleteReceivingSession();
  const [assignSession, setAssignSession] = useState<ReceivingSession | null>(null);
  const [pendingReject, setPendingReject] = useState<ReceivingSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { resolveNames } = useStaffNameMap(true);

  const { data: detailData, isFetching: isDetailFetching } = useReceivingSessionDetail(
    assignSession?.id ?? 0,
    { enabled: assignSession != null },
  );

  const stats = useMemo(() => computeSessionListStats(data), [data]);

  const putawayIdByReceiving = useMemo(() => {
    const map = new Map<number, number>();
    for (const session of putawaySessions) {
      if (session.receivingSessionId && !map.has(session.receivingSessionId)) {
        map.set(session.receivingSessionId, session.id);
      }
    }
    return map;
  }, [putawaySessions]);

  const filteredData = useMemo(() => {
    let result = data;
    if (dateFilter) {
      result = result.filter((session) => (session.createdAt || "").includes(dateFilter));
    }
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (session) =>
          String(session.id).includes(lowerQuery) ||
          (session.inboundTruckLabel?.toLowerCase() || "").includes(lowerQuery),
      );
    }
    return result;
  }, [data, searchQuery, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  async function runAction(
    action: () => Promise<unknown>,
    successKey:
      | "approveSessionSuccess"
      | "rejectSessionSuccess"
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
        <p className="text-body-md text-muted-foreground">{t("receivingIntro")}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full sm:w-[180px]"
            aria-label={t("selectServiceDate")}
          />
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("searchReceivingPlaceholder")}
              className="h-10 bg-card pl-9"
            />
          </div>
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
          label={t("sessionStatCompletedToday")}
          value={stats.completedToday}
          tone="muted"
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
          <p className="text-body-md text-muted-foreground">{t("noReceivingSessions")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedData.map((session) => {
              const staffNames = resolveNames(session.assignedStaffUserIds);
              const linkedPutawayId = putawayIdByReceiving.get(session.id);
              const isHighlighted = highlightId === session.id;
              return (
                <SessionListCard
                  key={session.id}
                  accent={sessionStatusAccent(session.status)}
                  selected={isHighlighted}
                  className={isHighlighted ? "ring-2 ring-emerald-500/50" : undefined}
                  data-highlight-id={session.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <p className="text-label-lg font-semibold text-foreground">
                        {t("receivingSessionLabel", { id: session.id })}
                        {session.inboundTruckLabel
                          ? ` · ${session.inboundTruckLabel}`
                          : ""}
                      </p>
                      {session.exceptionScanCount ? (
                        <p className="text-body-sm text-amber-700 dark:text-amber-400">
                          {t("sessionExceptions", { count: session.exceptionScanCount })}
                        </p>
                      ) : null}
                    </div>
                    <SessionStatusBadge status={session.status} />
                  </div>

                  <div className="mt-3">
                    <AssignedStaffRow
                      names={staffNames}
                      notAssignedLabel={t("sessionNotAssigned")}
                      assignedLabel={t("assignedStaffLabel")}
                      assignLabel={t("assignStaff")}
                      addStaffLabel={t("addStaff")}
                      canAssign={
                        canAssignReceivingSession(session.status) &&
                        (session.assignedStaffUserIds?.length ?? 0) === 0
                      }
                      onAssign={() => setAssignSession(session)}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-body-sm sm:grid-cols-3">
                    <span className="text-muted-foreground">
                      {t("sessionExpected")}:{" "}
                      <span className="font-medium text-foreground">
                        {session.expectedTires}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {t("sessionReceived")}:{" "}
                      <span className="font-medium text-foreground">
                        {session.receivedTires}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {t("columnRequests")}:{" "}
                      <span className="font-medium text-foreground">
                        {session.inboundRequests.length}
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
                      {t("receivingPendingApprovalHint")}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" asChild>
                      <Link href={ROUTES.DASHBOARD.INBOUND_SESSIONS.RECEIVING_DETAIL(session.id)}>
                        <Eye className="size-4" />
                        {t("viewDetails")}
                      </Link>
                    </Button>
                    {canApproveReceivingSession(session.status) ? (
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
                    {session.status === "PENDING_APPROVAL" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={rejectMutation.isPending}
                        onClick={() => setPendingReject(session)}
                      >
                        <X className="size-4" />
                        {t("rejectSession")}
                      </Button>
                    ) : null}
                    {canStartReceivingSession(session.status) ? (
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
                    {canCompleteReceivingSession(session.status) ? (
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
                        disabled={!linkedPutawayId}
                        asChild={Boolean(linkedPutawayId)}
                      >
                        {linkedPutawayId ? (
                          <Link
                            href={buildTabHighlightHref(
                              ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST,
                              "putaway",
                              linkedPutawayId,
                            )}
                          >
                            <PackagePlus className="size-4" />
                            {t("goToPutawayAction")}
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <PackagePlus className="size-4" />
                            {t("goToPutawayAction")}
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
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <AssignStaffDialog
        open={assignSession != null}
        onOpenChange={(open) => !open && setAssignSession(null)}
        title={t("assignReceivingTitle")}
        description={t("assignReceivingDescription", { id: assignSession?.id ?? "" })}
        initialStaffIds={
          detailData?.assignedStaffUserIds ?? assignSession?.assignedStaffUserIds ?? []
        }
        isPending={assignMutation.isPending || isDetailFetching}
        onConfirm={async (staffUserIds) => {
          if (!assignSession) return;
          await runAction(
            () =>
              assignMutation.mutateAsync({
                sessionId: assignSession.id,
                payload: {
                  staffUserIds,
                  version: assignSession.version ?? 0,
                },
              }),
            "assignSuccess",
          );
          setAssignSession(null);
        }}
      />

      <Dialog open={pendingReject != null} onOpenChange={(open) => !open && setPendingReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectSessionConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("rejectSessionConfirmDescription", { id: pendingReject?.id ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingReject(null)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={rejectMutation.isPending}
              onClick={() =>
                void runAction(async () => {
                  if (!pendingReject) return;
                  await rejectMutation.mutateAsync({
                    sessionId: pendingReject.id,
                    version: pendingReject.version ?? 0,
                  });
                  setPendingReject(null);
                }, "rejectSessionSuccess")
              }
            >
              {rejectMutation.isPending ? t("saving") : t("rejectSession")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
