"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Eye, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { AssignStaffDialog } from "@/modules/inbound-sessions/components/shared/assign-staff-dialog";
import { SessionProgressBar } from "@/modules/inbound-sessions/components/shared/session-progress-bar";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { usePutawaySessionDetail } from "@/modules/inbound-sessions/hooks/use-putaway-session-detail";
import {
  useApprovePutawaySession,
  useAssignPutawaySession,
  useStartPutawaySession,
} from "@/modules/inbound-sessions/hooks/use-putaway-session-mutations";
import { usePutawaySessions } from "@/modules/inbound-sessions/hooks/use-putaway-sessions";
import {
  canApprovePutawaySession,
  canAssignPutawaySession,
  canStartPutawaySession,
} from "@/modules/inbound-sessions/lib/status-utils";
import type { PutawaySession } from "@/modules/inbound-sessions/types/putaway-session";
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
  useHighlightId,
  useScrollToHighlight,
} from "@/shared/hooks/use-highlight-id";
import { useStaffNameMap } from "@/shared/hooks/use-staff-name-map";
import { computeSessionListStats } from "@/shared/lib/session-stats";

export function PutawaySessionsTable() {
  const t = useTranslations("inboundSessions");
  const { data, isPending, isError, error, refetch } = usePutawaySessions();
  const highlightId = useHighlightId();
  useScrollToHighlight(highlightId);
  const approveMutation = useApprovePutawaySession();
  const assignMutation = useAssignPutawaySession();
  const startMutation = useStartPutawaySession();
  const [assignSession, setAssignSession] = useState<PutawaySession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { resolveNames } = useStaffNameMap(true);

  const { data: detailData, isFetching: isDetailFetching } = usePutawaySessionDetail(
    assignSession?.id ?? 0,
    { enabled: assignSession != null },
  );

  const sessions = data ?? [];
  const stats = useMemo(() => computeSessionListStats(sessions), [sessions]);

  const filteredData = useMemo(() => {
    let result = sessions;
    if (dateFilter) {
      result = result.filter((session) => (session.createdAt || "").includes(dateFilter));
    }
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (session) =>
          String(session.id).includes(lowerQuery) ||
          (session.zoneName?.toLowerCase() || "").includes(lowerQuery),
      );
    }
    return result;
  }, [sessions, searchQuery, dateFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  async function runAction(
    action: () => Promise<unknown>,
    successKey: "approveSessionSuccess" | "assignSuccess" | "startSessionSuccess",
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
        <p className="text-body-md text-muted-foreground">{t("putawayIntro")}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 w-full sm:w-[180px]"
            aria-label={t("selectServiceDate")}
          />
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPutawayPlaceholder")}
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
          label={t("sessionStatCompleted")}
          value={stats.completed}
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
          <p className="text-body-md text-muted-foreground">{t("noPutawaySessions")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedData.map((session) => {
              const staffNames = resolveNames(session.assignedStaffUserIds);
              const pendingPutaway = Math.max(0, session.tireCount - session.completedCount);
              return (
                <SessionListCard
                  key={session.id}
                  accent={sessionStatusAccent(session.status)}
                  selected={highlightId === session.id}
                  data-highlight-id={session.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <p className="text-label-lg font-semibold text-foreground">
                        {t("putawaySessionLabel", { id: session.id })}
                        {session.zoneName ? ` · ${session.zoneName}` : ""}
                      </p>
                      {session.receivingSessionId || session.exceptionScanCount ? (
                        <p className="text-body-sm text-muted-foreground">
                          {[
                            session.receivingSessionId
                              ? t("putawayFromReceiving", { id: session.receivingSessionId })
                              : null,
                            session.exceptionScanCount
                              ? t("sessionExceptions", { count: session.exceptionScanCount })
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
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
                      canAssign={canAssignPutawaySession(session.status)}
                      onAssign={() => setAssignSession(session)}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-body-sm sm:grid-cols-3">
                    <span className="text-muted-foreground">
                      {t("sessionStored")}:{" "}
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">
                        {session.completedCount}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {t("sessionPendingPutaway")}:{" "}
                      <span className="font-medium text-primary">{pendingPutaway}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {t("columnTires")}:{" "}
                      <span className="font-medium text-foreground">{session.tireCount}</span>
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
                      ]}
                    />
                  </div>

                  {session.status === "PENDING_APPROVAL" ? (
                    <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-body-sm text-amber-800 dark:text-amber-300">
                      {t("putawayPendingApprovalHint")}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" asChild>
                      <Link href={ROUTES.DASHBOARD.INBOUND_SESSIONS.PUTAWAY_DETAIL(session.id)}>
                        <Eye className="size-4" />
                        {t("viewDetails")}
                      </Link>
                    </Button>
                    {canApprovePutawaySession(session.status) ? (
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
                    {canStartPutawaySession(session.status) ? (
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
        title={t("assignPutawayTitle")}
        description={t("assignPutawayDescription", { id: assignSession?.id ?? "" })}
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
    </div>
  );
}
