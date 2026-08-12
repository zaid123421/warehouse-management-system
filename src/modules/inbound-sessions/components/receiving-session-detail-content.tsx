"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft, Check, Play, Square, X } from "lucide-react";
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
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { AssignStaffDialog } from "@/modules/inbound-sessions/components/shared/assign-staff-dialog";
import { SessionProgressBar } from "@/modules/inbound-sessions/components/shared/session-progress-bar";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { InboundRequestDetailExpandedRow } from "@/modules/inbound-sessions/components/inbound-request-detail-expanded-row";
import { usePutawaySessions } from "@/modules/inbound-sessions/hooks/use-putaway-sessions";
import { useReceivingSessionDetail } from "@/modules/inbound-sessions/hooks/use-receiving-session-detail";
import {
  useApproveReceivingSession,
  useAssignReceivingSession,
  useCompleteReceivingSession,
  useRejectReceivingSession,
  useStartReceivingSession,
} from "@/modules/inbound-sessions/hooks/use-receiving-session-mutations";
import {
  canApproveReceivingSession,
  canAssignReceivingSession,
  canCompleteReceivingSession,
  canStartReceivingSession,
} from "@/modules/inbound-sessions/lib/status-utils";
import { AssignedStaffRow } from "@/shared/components/sessions/assigned-staff-row";
import {
  formatSessionTimestamp,
  SessionTimeline,
} from "@/shared/components/sessions/session-timeline";
import { buildTabHighlightHref } from "@/shared/hooks/use-highlight-id";
import { useStaffNameMap } from "@/shared/hooks/use-staff-name-map";

type ReceivingSessionDetailContentProps = {
  sessionId: number;
};

export function ReceivingSessionDetailContent({ sessionId }: ReceivingSessionDetailContentProps) {
  const t = useTranslations("inboundSessions");
  const { data, isPending, isError, error, refetch } = useReceivingSessionDetail(sessionId);
  const { data: putawaySessions = [] } = usePutawaySessions();
  const { resolveNames } = useStaffNameMap(true);
  const approveMutation = useApproveReceivingSession();
  const rejectMutation = useRejectReceivingSession();
  const assignMutation = useAssignReceivingSession();
  const startMutation = useStartReceivingSession();
  const completeMutation = useCompleteReceivingSession();
  const [assignOpen, setAssignOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const linkedPutawayId = useMemo(() => {
    const match = putawaySessions.find((session) => session.receivingSessionId === sessionId);
    return match?.id ?? null;
  }, [putawaySessions, sessionId]);

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
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  const staffNames = resolveNames(data?.assignedStaffUserIds);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <Button type="button" variant="ghost" size="sm" className="mb-2 -ms-2" asChild>
          <Link href={`${ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST}?tab=receiving`}>
            <ArrowLeft className="size-4" />
            {t("backToInbound")}
          </Link>
        </Button>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("receivingDetailTitle", { id: sessionId })}
        </h1>
        <p className="mt-1 text-body-md text-muted-foreground">{t("receivingDetailIntro")}</p>
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
              <SessionStatusBadge status={data.status} />
              {data.inboundTruckLabel ? (
                <span className="text-body-sm text-muted-foreground">{data.inboundTruckLabel}</span>
              ) : null}
              <span className="text-body-sm text-muted-foreground">
                {t("columnRequests")}: {data.inboundRequests.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              {canApproveReceivingSession(data.status) ? (
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
              {data.status === "PENDING_APPROVAL" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={rejectMutation.isPending}
                  onClick={() => setRejectOpen(true)}
                >
                  <X className="size-4" />
                  {t("rejectSession")}
                </Button>
              ) : null}
              {canStartReceivingSession(data.status) ? (
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
              {canCompleteReceivingSession(data.status) ? (
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
                      {t("goToPutawayAction")}
                    </Link>
                  ) : (
                    <span>{t("goToPutawayAction")}</span>
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
              canAssignReceivingSession(data.status) &&
              (data.assignedStaffUserIds?.length ?? 0) === 0
            }
            onAssign={() => setAssignOpen(true)}
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField
              label={t("columnTires")}
              value={`${data.receivedTires}/${data.expectedTires}`}
            />
            <DetailField
              label={t("columnRequests")}
              value={String(data.inboundRequests.length)}
            />
            {data.exceptionScanCount != null ? (
              <DetailField
                label={t("columnExceptions")}
                value={String(data.exceptionScanCount)}
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
                  render: (row) => `#${row.inboundRequestId}`,
                },
                {
                  header: t("columnDealer"),
                  render: (row) => row.dealerName ?? "—",
                },
                {
                  header: t("columnStatus"),
                  render: (row) => <SessionStatusBadge status={row.status} />,
                },
              ]}
              rows={data.inboundRequests}
              keyProp={(row) => row.inboundRequestId}
              emptyText={t("noLinkedRequests")}
              horizontalScroll
              renderExpanded={(row) => (
                <InboundRequestDetailExpandedRow requestId={row.inboundRequestId} />
              )}
            />
          </section>
        </div>
      )}

      <AssignStaffDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        title={t("assignReceivingTitle")}
        description={t("assignReceivingDescription", { id: sessionId })}
        initialStaffIds={data?.assignedStaffUserIds ?? []}
        isPending={assignMutation.isPending}
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

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectSessionConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("rejectSessionConfirmDescription", { id: sessionId })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={rejectMutation.isPending}
              onClick={() =>
                void runAction(async () => {
                  if (!data) return;
                  await rejectMutation.mutateAsync({
                    sessionId: data.id,
                    version: data.version ?? 0,
                  });
                  setRejectOpen(false);
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
