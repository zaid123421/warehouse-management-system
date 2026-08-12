"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft, Check, PackagePlus, Play, Square, Trash2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
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
import { useReadyToShipTrucks } from "@/modules/outbound-sessions/hooks/use-ready-to-ship-trucks";
import {
  canApprovePickingSession,
  canAssignPickingSession,
  canCancelPickingSession,
  canCompletePickingSession,
  canStartPickingSession,
  formatDayLabel,
} from "@/modules/outbound-sessions/lib/status-utils";
import { AssignedStaffRow } from "@/shared/components/sessions/assigned-staff-row";
import {
  formatSessionTimestamp,
  SessionTimeline,
} from "@/shared/components/sessions/session-timeline";
import { buildTabHighlightHref } from "@/shared/hooks/use-highlight-id";
import { useStaffNameMap } from "@/shared/hooks/use-staff-name-map";

type PickingSessionDetailContentProps = {
  sessionId: number;
};

export function PickingSessionDetailContent({ sessionId }: PickingSessionDetailContentProps) {
  const t = useTranslations("outboundSessions");
  const { data, isPending, isError, error, refetch } = usePickingSessionDetail(sessionId);
  const { data: readyTrucks = [] } = useReadyToShipTrucks();
  const { resolveNames } = useStaffNameMap(true);
  const approveMutation = useApprovePickingSession();
  const cancelMutation = useCancelPickingSession();
  const assignMutation = useAssignPickingSession();
  const startMutation = useStartPickingSession();
  const completeMutation = useCompletePickingSession();
  const [assignOpen, setAssignOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

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
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  const staffNames = resolveNames(data?.assignedStaffUserIds);
  const pickedCount = data?.pickedTires ?? data?.completedCount ?? 0;
  const canGoReadyToShip =
    data?.status === "COMPLETED" &&
    data.outboundTruckId != null &&
    readyTrucks.some((truck) => truck.truckId === data.outboundTruckId);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <Button type="button" variant="ghost" size="sm" className="mb-2 -ms-2" asChild>
          <Link href={`${ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST}?tab=picking`}>
            <ArrowLeft className="size-4" />
            {t("backToOutbound")}
          </Link>
        </Button>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("pickingDetailTitle", { id: sessionId })}
        </h1>
        <p className="mt-1 text-body-md text-muted-foreground">{t("pickingDetailIntro")}</p>
      </div>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={t("retry")}
        />
      ) : null}

      {isPending || !data ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <OutboundSessionStatusBadge status={data.status} />
              {data.dealerName ? (
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-body-sm font-medium text-foreground">
                  {data.dealerName}
                </span>
              ) : null}
              {data.serviceDate ? (
                <span className="text-body-sm text-muted-foreground">
                  {t("columnServiceDate")}: {data.serviceDate}
                </span>
              ) : null}
              {data.deliveryDay ? (
                <span className="text-body-sm text-muted-foreground">
                  {formatDayLabel(data.deliveryDay)}
                </span>
              ) : null}
              <span className="text-body-sm text-muted-foreground">
                {t("columnRequests")}:{" "}
                {formatCount(data.outboundRequestCount ?? data.outboundRequests.length)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              {canApprovePickingSession(data.status) ? (
                <Button
                  type="button"
                  size="sm"
                  className={PRIMARY_BUTTON_CLASS}
                  disabled={approveMutation.isPending}
                  onClick={() =>
                    void runAction(
                      () =>
                        approveMutation.mutateAsync({
                          sessionId: data.id,
                          version: data.version ?? 0,
                        }),
                      "approveSessionSuccess",
                    )
                  }
                >
                  <Check className="size-4" />
                  {t("approveSession")}
                </Button>
              ) : null}
              {canCancelPickingSession(data.status) ? (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={cancelMutation.isPending}
                  onClick={() => setCancelOpen(true)}
                >
                  <Trash2 className="size-4" />
                  {t("cancelSession")}
                </Button>
              ) : null}
              {canStartPickingSession(data.status) ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={startMutation.isPending}
                  onClick={() =>
                    void runAction(
                      () =>
                        startMutation.mutateAsync({
                          sessionId: data.id,
                          version: data.version ?? 0,
                        }),
                      "startSessionSuccess",
                    )
                  }
                >
                  <Play className="size-4" />
                  {t("startSession")}
                </Button>
              ) : null}
              {canCompletePickingSession(data.status) ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={completeMutation.isPending}
                  onClick={() =>
                    void runAction(
                      () =>
                        completeMutation.mutateAsync({
                          sessionId: data.id,
                          version: data.version ?? 0,
                        }),
                      "completeSessionSuccess",
                    )
                  }
                >
                  <Square className="size-4" />
                  {t("completeSession")}
                </Button>
              ) : null}
              {data.status === "COMPLETED" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                  disabled={!canGoReadyToShip}
                  asChild={canGoReadyToShip}
                >
                  {canGoReadyToShip && data.outboundTruckId ? (
                    <Link
                      href={buildTabHighlightHref(
                        ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST,
                        "ready-to-ship",
                        data.outboundTruckId,
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
          </div>

          <AssignedStaffRow
            names={staffNames}
            notAssignedLabel={t("sessionNotAssigned")}
            assignedLabel={t("assignedStaffLabel")}
            assignLabel={t("assignStaff")}
            addStaffLabel={t("addStaff")}
            canAssign={
              canAssignPickingSession(data.status) &&
              (data.assignedStaffUserIds?.length ?? 0) === 0
            }
            onAssign={() => setAssignOpen(true)}
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField
              label={t("columnTires")}
              value={`${pickedCount}/${data.expectedTires}`}
            />
            <DetailField
              label={t("columnRequests")}
              value={formatCount(data.outboundRequestCount ?? data.outboundRequests.length)}
            />
            {data.exceptionScanCount != null ? (
              <DetailField
                label={t("columnExceptions")}
                value={formatCount(data.exceptionScanCount)}
              />
            ) : null}
          </div>

          <SessionProgressBar value={data.progressPercent ?? 0} label={t("columnProgress")} />

          <SessionTimeline
            steps={[
              {
                key: "created",
                label: t("timelineCreated"),
                value: formatSessionTimestamp(data.createdAt),
              },
              {
                key: "approved",
                label: t("timelineApproved"),
                value: formatSessionTimestamp(data.approvedAt),
              },
              {
                key: "started",
                label: t("timelineStarted"),
                value: formatSessionTimestamp(data.startedAt),
              },
              {
                key: "completed",
                label: t("timelineCompleted"),
                value: formatSessionTimestamp(data.completedAt),
              },
            ]}
          />

          <section className="space-y-3">
            <h2 className="text-label-lg font-semibold text-foreground">{t("linkedRequestsTitle")}</h2>
            <StyledTable
              columns={[
                {
                  header: t("columnRequestId"),
                  render: (row) => `#${row.outboundRequestId}`,
                },
                {
                  header: t("columnDealer"),
                  render: (row) => row.dealerName ?? data.dealerName ?? "—",
                },
                {
                  header: t("columnServiceDate"),
                  render: () => data.serviceDate ?? "—",
                },
                {
                  header: t("columnVolume"),
                  render: (row) => formatCount(row.totalVolume ?? 0),
                },
                {
                  header: t("columnStatus"),
                  render: (row) => <OutboundSessionStatusBadge status={row.status} />,
                },
              ]}
              rows={data.outboundRequests}
              keyProp={(row) => row.outboundRequestId}
              emptyText={t("noLinkedRequests")}
              horizontalScroll
            />
          </section>

          {data.lines.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-label-lg font-semibold text-foreground">{t("pickingLinesTitle")}</h2>
              <StyledTable
                columns={[
                  {
                    header: t("columnTireId"),
                    render: (row) => row.tireUniqueId ?? (row.tireId ? `#${row.tireId}` : "—"),
                  },
                  {
                    header: t("columnLocation"),
                    render: (row) => row.locationBarcode ?? "—",
                  },
                  {
                    header: t("columnStatus"),
                    render: (row) => (
                      <OutboundSessionStatusBadge
                        status={row.lineStatus ?? row.status ?? "—"}
                      />
                    ),
                  },
                ]}
                rows={data.lines}
                keyProp={(row) =>
                  row.tireUniqueId ?? String(row.tireId ?? row.locationBarcode ?? "line")
                }
                emptyText={t("noPickingLines")}
                horizontalScroll
              />
            </section>
          ) : null}
        </div>
      )}

      <AssignStaffDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        title={t("assignPickingTitle")}
        description={t("assignPickingDescription", { id: sessionId })}
        initialStaffIds={data?.assignedStaffUserIds ?? []}
        isPending={assignMutation.isPending}
        translationNamespace="outboundSessions"
        onConfirm={async (staffUserIds) => {
          if (!data) return;
          await runAction(
            () =>
              assignMutation.mutateAsync({
                sessionId: data.id,
                payload: { staffUserIds, version: data.version ?? 0 },
              }),
            "assignSuccess",
          );
          setAssignOpen(false);
        }}
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cancelSessionConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("cancelSessionConfirmDescription", { id: sessionId })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={() =>
                void runAction(async () => {
                  if (!data) return;
                  await cancelMutation.mutateAsync({
                    sessionId: data.id,
                    version: data.version ?? 0,
                  });
                  setCancelOpen(false);
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

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card px-3 py-2.5 dark:border-white/5">
      <p className="text-body-sm text-muted-foreground">{label}</p>
      <div className="mt-1 text-body-md font-medium text-foreground">{value}</div>
    </div>
  );
}
