"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Check,
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
import { Skeleton } from "@/components/ui/skeleton";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { cn } from "@/lib/utils";
import { AssignStaffDialog } from "@/modules/inbound-sessions/components/shared/assign-staff-dialog";
import { SessionProgressBar } from "@/modules/inbound-sessions/components/shared/session-progress-bar";
import { ShippingSessionDetailPanel } from "@/modules/outbound-sessions/components/shipping-session-detail-panel";
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
  isTodayServiceDate,
} from "@/modules/outbound-sessions/lib/status-utils";
import type { ShippingSession } from "@/modules/outbound-sessions/types/shipping-session";

export function ShippingSessionsBoard() {
  const t = useTranslations("outboundSessions");
  const { data = [], isPending, isError, error, refetch } = useShippingSessions();
  const approveMutation = useApproveShippingSession();
  const cancelMutation = useCancelShippingSession();
  const assignMutation = useAssignShippingSession();
  const startMutation = useStartShippingSession();
  const completeMutation = useCompleteShippingSession();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [assignSession, setAssignSession] = useState<ShippingSession | null>(null);
  const [pendingCancel, setPendingCancel] = useState<ShippingSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: detailData, isFetching: isDetailFetching } = useShippingSessionDetail(assignSession?.id ?? 0, {
    enabled: assignSession != null,
  });

  const stats = useMemo(() => computeShippingSessionStats(data), [data]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter((session) => 
      String(session.id).includes(lowerQuery) || 
      (session.outboundTruckLabel?.toLowerCase() || "").includes(lowerQuery) ||
      (session.serviceDate || "").includes(lowerQuery) ||
      session.outboundRequests.some(req => (req.dealerName || "").toLowerCase().includes(lowerQuery))
    );
  }, [data, searchQuery]);

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
    if (!isTodayServiceDate(session.serviceDate)) {
      toast.error(t("shippingServiceDateGuard"));
      return;
    }
    await runAction(() => startMutation.mutateAsync(session.id), "startSessionSuccess");
  }

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body-md text-muted-foreground">{t("shippingIntro")}</p>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, truck, dealer..."
              className="pl-9 bg-card"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:max-w-md">
          <StatPill label={t("shippingStatPending")} value={stats.pendingApproval} tone="warning" />
          <StatPill label={t("shippingStatInProgress")} value={stats.inProgress} tone="default" />
          <StatPill
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
          <div className="space-y-3">
            {filteredData.map((session) => {
              const remaining = Math.max(
                0,
                session.expectedTires - session.shippedTires - session.missingTires,
              );
              const isSelected = selectedSessionId === session.id;
              const canStartToday = isTodayServiceDate(session.serviceDate);
              return (
                <article
                  key={session.id}
                  className={cn(
                    "rounded-xl border-2 bg-card p-4 transition-colors",
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]",
                  )}
                >
                  <button
                    type="button"
                    className="w-full text-start"
                    onClick={() => setSelectedSessionId(session.id)}
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
                      <span>{t("shippingTotalTires")}: {session.expectedTires}</span>
                      <span>{t("shippingScanned")}: {session.shippedTires}</span>
                      <span>{t("shippingRemaining")}: {remaining}</span>
                    </div>

                    <div className="mt-3">
                      <SessionProgressBar value={session.progressPercent ?? 0} />
                    </div>
                  </button>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {canApproveShippingSession(session.status) ? (
                      <Button
                        type="button"
                        size="sm"
                        className={PRIMARY_BUTTON_CLASS}
                        disabled={approveMutation.isPending}
                        onClick={() =>
                          void runAction(
                            () => approveMutation.mutateAsync(session.id),
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
                    {canAssignShippingSession(session.status) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setAssignSession(session)}
                      >
                        <UserPlus className="size-4" />
                        {t("assignStaff")}
                      </Button>
                    ) : null}
                    {canStartShippingSession(session.status) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={startMutation.isPending || !canStartToday}
                        title={!canStartToday ? t("shippingServiceDateGuard") : undefined}
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
                            () => completeMutation.mutateAsync(session.id),
                            "completeSessionSuccess",
                          )
                        }
                      >
                        <Square className="size-4" />
                        {t("completeSession")}
                      </Button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <aside className="w-full shrink-0 xl:w-[24rem]">
        <ShippingSessionDetailPanel
          sessionId={selectedSessionId}
          onClose={() => setSelectedSessionId(null)}
        />
      </aside>

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

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "warning" | "muted";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-center",
        tone === "warning"
          ? "border-amber-500/30 bg-amber-500/10"
          : "border-[var(--color-surface-light-container)] bg-card dark:border-[var(--color-surface-container-high)]",
      )}
    >
      <p className="text-body-sm text-muted-foreground">{label}</p>
      <p className="text-headline-sm font-bold text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}
