"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Check,
  Eye,
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
import { useShippingSessionDetail } from "@/modules/outbound-sessions/hooks/use-shipping-session-detail";
import {
  useApproveShippingSession,
  useAssignShippingSession,
  useCancelShippingSession,
  useCompleteShippingSession,
  useStartShippingSession,
} from "@/modules/outbound-sessions/hooks/use-shipping-session-mutations";
import { useShippingSessions } from "@/modules/outbound-sessions/hooks/use-shipping-sessions";
import {
  canApproveShippingSession,
  canAssignShippingSession,
  canCancelShippingSession,
  canCompleteShippingSession,
  canStartShippingSession,
  computeShippingSessionStats,
  formatDayLabel,
  formatDealerSummary,
} from "@/modules/outbound-sessions/lib/status-utils";
import type { ShippingSession } from "@/modules/outbound-sessions/types/shipping-session";
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

export function ShippingSessionsBoard() {
  const t = useTranslations("outboundSessions");
  const { data = [], isPending, isError, error, refetch } = useShippingSessions();
  const highlightId = useHighlightId();
  useScrollToHighlight(highlightId);
  const approveMutation = useApproveShippingSession();
  const cancelMutation = useCancelShippingSession();
  const assignMutation = useAssignShippingSession();
  const startMutation = useStartShippingSession();
  const completeMutation = useCompleteShippingSession();
  const [assignSession, setAssignSession] = useState<ShippingSession | null>(null);
  const [pendingCancel, setPendingCancel] = useState<ShippingSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { resolveNames } = useStaffNameMap(true);

  const { data: detailData, isFetching: isDetailFetching } = useShippingSessionDetail(
    assignSession?.id ?? 0,
    {
      enabled: assignSession != null,
    },
  );

  const stats = useMemo(() => computeShippingSessionStats(data), [data]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(
      (session) =>
        String(session.id).includes(lowerQuery) ||
        (session.outboundTruckLabel?.toLowerCase() || "").includes(lowerQuery) ||
        (session.serviceDate || "").includes(lowerQuery) ||
        session.outboundRequests.some((req) =>
          (req.dealerName || "").toLowerCase().includes(lowerQuery),
        ),
    );
  }, [data, searchQuery]);

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

  async function handleStart(session: ShippingSession) {
    await runAction(
      () =>
        startMutation.mutateAsync({
          sessionId: session.id,
          version: session.version ?? 0,
        }),
      "startSessionSuccess",
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-md text-muted-foreground">{t("shippingIntro")}</p>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            placeholder="Search by ID, truck, dealer..."
            className="bg-card pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:max-w-md">
        <SessionStatPill label={t("shippingStatPending")} value={stats.pendingApproval} tone="warning" />
        <SessionStatPill label={t("shippingStatInProgress")} value={stats.inProgress} tone="success" />
        <SessionStatPill
          label={t("shippingStatCompletedToday")}
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
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-surface-light-container)] bg-card px-4 py-12 text-center dark:border-[var(--color-surface-container-high)]">
          <p className="text-body-md text-muted-foreground">{t("noShippingSessions")}</p>
          <p className="mt-2 text-body-sm text-muted-foreground">{t("shippingCreateFromTruckHint")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedData.map((session) => {
              const remaining = Math.max(
                0,
                session.expectedTires - session.shippedTires - session.missingTires,
              );
              const staffNames = resolveNames(session.assignedStaffUserIds);
              const isHighlighted = highlightId === session.id;
              return (
                <SessionListCard
                  key={session.id}
                  accent={sessionStatusAccent(session.status)}
                  selected={isHighlighted}
                  data-highlight-id={session.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-label-lg font-semibold text-foreground">
                        {t("shippingSessionLabel", { id: session.id })}
                        {session.outboundTruckLabel
                          ? ` · ${session.outboundTruckLabel}`
                          : ""}
                      </p>
                      <p className="mt-1 text-body-sm text-muted-foreground">
                        {formatDealerSummary(session.outboundRequests, t("unknownDealer"))}
                        {session.serviceDate ? ` · ${session.serviceDate}` : ""}
                        {session.deliveryDay
                          ? ` · ${formatDayLabel(session.deliveryDay)}`
                          : ""}
                      </p>
                    </div>
                    <OutboundSessionStatusBadge status={session.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-body-sm">
                    <span className="text-muted-foreground">
                      {t("shippingTotalTires")}:{" "}
                      <span className="font-medium text-foreground">{session.expectedTires}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {t("shippingScanned")}:{" "}
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">
                        {session.shippedTires}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {t("shippingRemaining")}:{" "}
                      <span className="font-medium text-primary">{remaining}</span>
                    </span>
                  </div>

                  <div className="mt-3">
                    <SessionProgressBar
                      value={session.progressPercent ?? 0}
                      label={t("columnProgress")}
                    />
                  </div>

                  <div className="mt-3">
                    <AssignedStaffRow
                      names={staffNames}
                      notAssignedLabel={t("sessionNotAssigned")}
                      assignedLabel={t("assignedStaffLabel")}
                      assignLabel={t("assignStaff")}
                      addStaffLabel={t("addStaff")}
                      canAssign={
                        canAssignShippingSession(session.status) &&
                        (session.assignedStaffUserIds?.length ?? 0) === 0
                      }
                      onAssign={() => setAssignSession(session)}
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
                      {t("shippingPendingApprovalHint")}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" asChild>
                      <Link href={ROUTES.DASHBOARD.OUTBOUND_SESSIONS.SHIPPING_DETAIL(session.id)}>
                        <Eye className="size-4" />
                        {t("viewDetails")}
                      </Link>
                    </Button>
                    {canApproveShippingSession(session.status) ? (
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
                    {canCancelShippingSession(session.status) ? (
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
                    {canStartShippingSession(session.status) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={startMutation.isPending}
                        onClick={() => void handleStart(session)}
                      >
                        <Play className="size-4" />
                        {t("startSession")}
                      </Button>
                    ) : null}
                    {canCompleteShippingSession(session.status) ? (
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
        title={t("assignShippingTitle")}
        description={t("assignShippingDescription", { id: assignSession?.id ?? "" })}
        initialStaffIds={detailData?.assignedStaffUserIds ?? assignSession?.assignedStaffUserIds ?? []}
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
            <DialogTitle>{t("cancelShippingConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("cancelShippingConfirmDescription", { id: pendingCancel?.id ?? "" })}
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
