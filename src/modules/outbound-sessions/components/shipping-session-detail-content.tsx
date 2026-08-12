"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft, Check, Play, Square, Trash2 } from "lucide-react";
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
import { useShippingSessionDetail } from "@/modules/outbound-sessions/hooks/use-shipping-session-detail";
import {
  useApproveShippingSession,
  useAssignShippingSession,
  useCancelShippingSession,
  useCompleteShippingSession,
  useStartShippingSession,
} from "@/modules/outbound-sessions/hooks/use-shipping-session-mutations";
import {
  canApproveShippingSession,
  canAssignShippingSession,
  canCancelShippingSession,
  canCompleteShippingSession,
  canStartShippingSession,
  formatDayLabel,
  formatDealerSummary,
} from "@/modules/outbound-sessions/lib/status-utils";
import { AssignedStaffRow } from "@/shared/components/sessions/assigned-staff-row";
import {
  formatSessionTimestamp,
  SessionTimeline,
} from "@/shared/components/sessions/session-timeline";
import { useStaffNameMap } from "@/shared/hooks/use-staff-name-map";

type ShippingSessionDetailContentProps = {
  sessionId: number;
};

export function ShippingSessionDetailContent({ sessionId }: ShippingSessionDetailContentProps) {
  const t = useTranslations("outboundSessions");
  const { data, isPending, isError, error, refetch } = useShippingSessionDetail(sessionId);
  const { resolveNames } = useStaffNameMap(true);
  const approveMutation = useApproveShippingSession();
  const cancelMutation = useCancelShippingSession();
  const assignMutation = useAssignShippingSession();
  const startMutation = useStartShippingSession();
  const completeMutation = useCompleteShippingSession();
  const [assignOpen, setAssignOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const staffNames = resolveNames(data?.assignedStaffUserIds);

  const remainingTires = useMemo(() => {
    if (!data) return 0;
    return Math.max(0, data.expectedTires - data.shippedTires - data.missingTires);
  }, [data]);

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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <Button type="button" variant="ghost" size="sm" className="mb-2 -ms-2" asChild>
          <Link href={`${ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST}?tab=shipping`}>
            <ArrowLeft className="size-4" />
            {t("backToOutbound")}
          </Link>
        </Button>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("shippingDetailTitle", { id: sessionId })}
        </h1>
        <p className="mt-1 text-body-md text-muted-foreground">{t("shippingDetailIntro")}</p>
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
              {data.outboundTruckLabel ? (
                <span className="text-body-sm text-muted-foreground">{data.outboundTruckLabel}</span>
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
                {t("columnRequests")}: {data.outboundRequests.length}
              </span>
              <span className="text-body-sm text-muted-foreground">
                {formatDealerSummary(data.outboundRequests, t("unknownDealer"))}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              {canApproveShippingSession(data.status) ? (
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
              {canCancelShippingSession(data.status) ? (
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
              {canStartShippingSession(data.status) ? (
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
              {canCompleteShippingSession(data.status) ? (
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
            </div>
          </div>

          <AssignedStaffRow
            names={staffNames}
            notAssignedLabel={t("sessionNotAssigned")}
            assignedLabel={t("assignedStaffLabel")}
            assignLabel={t("assignStaff")}
            addStaffLabel={t("addStaff")}
            canAssign={
              canAssignShippingSession(data.status) &&
              (data.assignedStaffUserIds?.length ?? 0) === 0
            }
            onAssign={() => setAssignOpen(true)}
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label={t("shippingTotalTires")} value={formatCount(data.expectedTires)} />
            <DetailField label={t("shippingScanned")} value={formatCount(data.shippedTires)} />
            <DetailField label={t("shippingRemaining")} value={formatCount(remainingTires)} />
          </div>

          {data.missingTires > 0 ? (
            <p className="text-body-sm text-amber-700 dark:text-amber-400">
              {t("shippingMissingCount", { count: data.missingTires })}
            </p>
          ) : (
            <p className="text-body-sm text-emerald-700 dark:text-emerald-400">
              {t("shippingNoMissing")}
            </p>
          )}

          <SessionProgressBar
            value={data.progressPercent ?? 0}
            label={t("shippingScanProgress", {
              shipped: data.shippedTires,
              expected: data.expectedTires,
            })}
          />

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
            <h2 className="text-label-lg font-semibold text-foreground">
              {t("shippingLinkedRequestsTitle")}
            </h2>
            <StyledTable
              columns={[
                {
                  header: t("columnRequestId"),
                  render: (row) => `#${row.outboundRequestId}`,
                },
                {
                  header: t("columnDealer"),
                  render: (row) => row.dealerName ?? t("unknownDealer"),
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
              <h2 className="text-label-lg font-semibold text-foreground">
                {t("shippingManifestTitle")}
              </h2>
              <StyledTable
                columns={[
                  {
                    header: t("columnTireId"),
                    render: (row) =>
                      row.tireUniqueId ?? (row.tireId ? `#${row.tireId}` : "—"),
                  },
                  {
                    header: t("shippingColumnCustomer"),
                    render: (row) => row.customerName ?? row.dealerName ?? "—",
                  },
                  {
                    header: t("columnStatus"),
                    render: (row) => (
                      <OutboundSessionStatusBadge
                        status={row.lineStatus ?? row.status ?? "—"}
                      />
                    ),
                  },
                  {
                    header: t("shippingColumnScannedAt"),
                    render: (row) => row.scannedAt ?? "—",
                  },
                ]}
                rows={data.lines}
                keyProp={(row) =>
                  row.tireUniqueId ??
                  String(row.outboundRequestLineId ?? row.tireId ?? "line")
                }
                emptyText={t("shippingNoManifestLines")}
                horizontalScroll
              />
            </section>
          ) : null}
        </div>
      )}

      <AssignStaffDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        title={t("assignShippingTitle")}
        description={t("assignShippingDescription", { id: sessionId })}
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
            <DialogTitle>{t("cancelShippingConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("cancelShippingConfirmDescription", { id: sessionId })}
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
