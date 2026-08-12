"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StyledTable } from "@/components/ui/styled-table";
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
import {
  canApprovePutawaySession,
  canAssignPutawaySession,
  canStartPutawaySession,
} from "@/modules/inbound-sessions/lib/status-utils";
import { AssignedStaffRow } from "@/shared/components/sessions/assigned-staff-row";
import {
  formatSessionTimestamp,
  SessionTimeline,
} from "@/shared/components/sessions/session-timeline";
import { useStaffNameMap } from "@/shared/hooks/use-staff-name-map";

type PutawaySessionDetailContentProps = {
  sessionId: number;
};

export function PutawaySessionDetailContent({ sessionId }: PutawaySessionDetailContentProps) {
  const t = useTranslations("inboundSessions");
  const { data, isPending, isError, error, refetch } = usePutawaySessionDetail(sessionId);
  const { resolveNames } = useStaffNameMap(true);
  const approveMutation = useApprovePutawaySession();
  const assignMutation = useAssignPutawaySession();
  const startMutation = useStartPutawaySession();
  const [assignOpen, setAssignOpen] = useState(false);

  async function runAction(
    action: () => Promise<unknown>,
    successKey: "approveSessionSuccess" | "assignSuccess" | "startSessionSuccess",
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
          <Link href={`${ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST}?tab=putaway`}>
            <ArrowLeft className="size-4" />
            {t("backToInbound")}
          </Link>
        </Button>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("putawayDetailTitle", { id: sessionId })}
        </h1>
        <p className="mt-1 text-body-md text-muted-foreground">{t("putawayDetailIntro")}</p>
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
              {data.zoneName ? (
                <span className="text-body-sm text-muted-foreground">{data.zoneName}</span>
              ) : null}
              {data.receivingSessionId ? (
                <span className="text-body-sm text-muted-foreground">
                  {t("putawayFromReceiving", { id: data.receivingSessionId })}
                </span>
              ) : null}
              <span className="text-body-sm text-muted-foreground">
                {t("columnTires")}: {data.tireCount}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              {canApprovePutawaySession(data.status) ? (
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
              {canStartPutawaySession(data.status) ? (
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
            </div>
          </div>

          <AssignedStaffRow
            names={staffNames}
            notAssignedLabel={t("sessionNotAssigned")}
            assignedLabel={t("assignedStaffLabel")}
            assignLabel={t("assignStaff")}
            addStaffLabel={t("addStaff")}
            canAssign={
              canAssignPutawaySession(data.status) &&
              (data.assignedStaffUserIds?.length ?? 0) === 0
            }
            onAssign={() => setAssignOpen(true)}
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label={t("sessionStored")} value={String(data.completedCount)} />
            <DetailField
              label={t("sessionPendingPutaway")}
              value={String(Math.max(0, data.tireCount - data.completedCount))}
            />
            <DetailField label={t("columnTires")} value={String(data.tireCount)} />
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
            ]}
          />

          <section className="space-y-3">
            <h2 className="text-label-lg font-semibold text-foreground">{t("putawayLinesTitle")}</h2>
            <StyledTable
              columns={[
                {
                  header: t("columnTireId"),
                  render: (row) => row.tireUniqueId ?? (row.tireId ? `#${row.tireId}` : "—"),
                },
                {
                  header: t("columnLocation"),
                  render: (row) => row.reservedLocationBarcode ?? "—",
                },
                {
                  header: t("columnStatus"),
                  render: (row) => (
                    <SessionStatusBadge status={row.lineStatus ?? row.status ?? "—"} />
                  ),
                },
              ]}
              rows={data.lines}
              keyProp={(row) =>
                row.tireUniqueId ?? String(row.tireId ?? row.reservedLocationBarcode ?? "line")
              }
              emptyText={t("noPutawayLines")}
              horizontalScroll
            />
          </section>
        </div>
      )}

      <AssignStaffDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        title={t("assignPutawayTitle")}
        description={t("assignPutawayDescription", { id: sessionId })}
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
