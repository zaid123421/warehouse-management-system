"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Check,
  Eye,
  Play,
  Send,
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
import { StyledTable } from "@/components/ui/styled-table";
import { ROUTES } from "@/constants/routes";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { AssignStaffDialog } from "@/modules/inbound-sessions/components/shared/assign-staff-dialog";
import { SessionProgressBar } from "@/modules/inbound-sessions/components/shared/session-progress-bar";
import { OutboundSessionStatusBadge } from "@/modules/outbound-sessions/components/shared/session-status-badge";
import {
  useApprovePickingSession,
  useAssignPickingSession,
  useCancelPickingSession,
  useCompletePickingSession,
  useDispatchPickingSession,
  useStartPickingSession,
} from "@/modules/outbound-sessions/hooks/use-picking-session-mutations";
import { usePickingSessions } from "@/modules/outbound-sessions/hooks/use-picking-sessions";
import {
  canApprovePickingSession,
  canAssignPickingSession,
  canCancelPickingSession,
  canCompletePickingSession,
  canDispatchPickingSession,
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
  const dispatchMutation = useDispatchPickingSession();
  const [assignSession, setAssignSession] = useState<PickingSession | null>(null);
  const [pendingCancel, setPendingCancel] = useState<PickingSession | null>(null);

  async function runAction(
    action: () => Promise<unknown>,
    successKey:
      | "approveSessionSuccess"
      | "cancelSessionSuccess"
      | "assignSuccess"
      | "startSessionSuccess"
      | "completeSessionSuccess"
      | "dispatchSessionSuccess",
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
      <p className="text-body-md text-muted-foreground">{t("pickingIntro")}</p>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={t("retry")}
        />
      ) : null}

      <StyledTable
        columns={[
          { header: t("columnSession"), render: (row) => `#${row.id}` },
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
              (row.outboundRequestCount ?? row.outboundRequests.length).toLocaleString(),
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
                {canDispatchPickingSession(row.status) ? (
                  <Button
                    type="button"
                    size="sm"
                    className={PRIMARY_BUTTON_CLASS}
                    disabled={dispatchMutation.isPending}
                    onClick={() =>
                      void runAction(
                        () => dispatchMutation.mutateAsync(row.id),
                        "dispatchSessionSuccess",
                      )
                    }
                  >
                    <Send className="size-4" />
                    {t("dispatchSession")}
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
        rows={data}
        keyProp={(row) => row.id}
        isLoading={isPending}
        emptyText={t("noPickingSessions")}
        horizontalScroll
      />

      <AssignStaffDialog
        open={assignSession != null}
        onOpenChange={(open) => !open && setAssignSession(null)}
        title={t("assignPickingTitle")}
        description={t("assignPickingDescription", { id: assignSession?.id ?? "" })}
        initialStaffIds={assignSession?.assignedStaffUserIds ?? []}
        isPending={assignMutation.isPending}
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
