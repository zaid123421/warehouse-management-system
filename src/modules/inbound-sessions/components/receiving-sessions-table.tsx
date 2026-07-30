"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Eye, Play, Square, UserPlus, X } from "lucide-react";
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
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import {
  useApproveReceivingSession,
  useAssignReceivingSession,
  useCompleteReceivingSession,
  useRejectReceivingSession,
  useStartReceivingSession,
} from "@/modules/inbound-sessions/hooks/use-receiving-session-mutations";
import { useReceivingSessions } from "@/modules/inbound-sessions/hooks/use-receiving-sessions";
import {
  canApproveReceivingSession,
  canAssignReceivingSession,
  canCompleteReceivingSession,
  canStartReceivingSession,
} from "@/modules/inbound-sessions/lib/status-utils";
import type { ReceivingSession } from "@/modules/inbound-sessions/types/receiving-session";

export function ReceivingSessionsTable() {
  const t = useTranslations("inboundSessions");
  const { data = [], isPending, isError, error, refetch } = useReceivingSessions();
  const approveMutation = useApproveReceivingSession();
  const rejectMutation = useRejectReceivingSession();
  const assignMutation = useAssignReceivingSession();
  const startMutation = useStartReceivingSession();
  const completeMutation = useCompleteReceivingSession();
  const [assignSession, setAssignSession] = useState<ReceivingSession | null>(null);
  const [pendingReject, setPendingReject] = useState<ReceivingSession | null>(null);

  async function runAction(
    action: () => Promise<unknown>,
    successKey: "approveSessionSuccess" | "rejectSessionSuccess" | "assignSuccess" | "startSessionSuccess" | "completeSessionSuccess",
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
      <p className="text-body-md text-muted-foreground">{t("receivingIntro")}</p>

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
            header: t("columnTruck"),
            render: (row) => row.inboundTruckLabel ?? "—",
          },
          {
            header: t("columnStatus"),
            render: (row) => <SessionStatusBadge status={row.status} />,
          },
          {
            header: t("columnProgress"),
            render: (row) => <SessionProgressBar value={row.progressPercent ?? 0} />,
          },
          {
            header: t("columnTires"),
            render: (row) => `${row.receivedTires}/${row.expectedTires}`,
          },
          {
            header: t("columnRequests"),
            render: (row) => row.inboundRequests.length.toLocaleString(),
          },
          {
            header: t("columnActions"),
            render: (row) => (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button type="button" size="sm" variant="outline" asChild>
                  <Link href={ROUTES.DASHBOARD.INBOUND_SESSIONS.RECEIVING_DETAIL(row.id)}>
                    <Eye className="size-4" />
                    {t("viewDetails")}
                  </Link>
                </Button>
                {canApproveReceivingSession(row.status) ? (
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
                {row.status === "PENDING_APPROVAL" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={rejectMutation.isPending}
                    onClick={() => setPendingReject(row)}
                  >
                    <X className="size-4" />
                    {t("rejectSession")}
                  </Button>
                ) : null}
                {canAssignReceivingSession(row.status) ? (
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
                {canStartReceivingSession(row.status) ? (
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
                {canCompleteReceivingSession(row.status) ? (
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
              </div>
            ),
          },
        ]}
        rows={data}
        keyProp={(row) => row.id}
        isLoading={isPending}
        emptyText={t("noReceivingSessions")}
        horizontalScroll
      />

      <AssignStaffDialog
        open={assignSession != null}
        onOpenChange={(open) => !open && setAssignSession(null)}
        title={t("assignReceivingTitle")}
        description={t("assignReceivingDescription", { id: assignSession?.id ?? "" })}
        initialStaffIds={assignSession?.assignedStaffUserIds ?? []}
        isPending={assignMutation.isPending}
        onConfirm={async (staffUserIds) => {
          if (!assignSession) return;
          await runAction(
            () => assignMutation.mutateAsync({ sessionId: assignSession.id, payload: { staffUserIds } }),
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
                  await rejectMutation.mutateAsync(pendingReject.id);
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
