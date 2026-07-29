"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Eye, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { StyledTable } from "@/components/ui/styled-table";
import { ROUTES } from "@/constants/routes";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { AssignStaffDialog } from "@/modules/inbound-sessions/components/shared/assign-staff-dialog";
import { SessionProgressBar } from "@/modules/inbound-sessions/components/shared/session-progress-bar";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import {
  useApprovePutawaySession,
  useAssignPutawaySession,
} from "@/modules/inbound-sessions/hooks/use-putaway-session-mutations";
import { usePutawaySessions } from "@/modules/inbound-sessions/hooks/use-putaway-sessions";
import {
  canApprovePutawaySession,
  canAssignPutawaySession,
} from "@/modules/inbound-sessions/lib/status-utils";
import type { PutawaySession } from "@/modules/inbound-sessions/types/putaway-session";

export function PutawaySessionsTable() {
  const t = useTranslations("inboundSessions");
  const { data = [], isPending, isError, error, refetch } = usePutawaySessions();
  const approveMutation = useApprovePutawaySession();
  const assignMutation = useAssignPutawaySession();
  const [assignSession, setAssignSession] = useState<PutawaySession | null>(null);

  async function handleApprove(sessionId: number) {
    try {
      await approveMutation.mutateAsync(sessionId);
      toast.success(t("approveSessionSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-body-md text-muted-foreground">{t("putawayIntro")}</p>

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
          { header: t("columnZone"), render: (row) => row.zoneName ?? "—" },
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
            render: (row) => `${row.completedCount}/${row.tireCount}`,
          },
          {
            header: t("columnActions"),
            render: (row) => (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button type="button" size="sm" variant="outline" asChild>
                  <Link href={ROUTES.DASHBOARD.INBOUND_SESSIONS.PUTAWAY_DETAIL(row.id)}>
                    <Eye className="size-4" />
                    {t("viewDetails")}
                  </Link>
                </Button>
                {canApprovePutawaySession(row.status) ? (
                  <Button
                    type="button"
                    size="sm"
                    className={PRIMARY_BUTTON_CLASS}
                    disabled={approveMutation.isPending}
                    onClick={() => void handleApprove(row.id)}
                  >
                    <Check className="size-4" />
                    {t("approveSession")}
                  </Button>
                ) : null}
                {canAssignPutawaySession(row.status) ? (
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
              </div>
            ),
          },
        ]}
        rows={data}
        keyProp={(row) => row.id}
        isLoading={isPending}
        emptyText={t("noPutawaySessions")}
        horizontalScroll
      />

      <AssignStaffDialog
        open={assignSession != null}
        onOpenChange={(open) => !open && setAssignSession(null)}
        title={t("assignPutawayTitle")}
        description={t("assignPutawayDescription", { id: assignSession?.id ?? "" })}
        initialStaffIds={assignSession?.assignedStaffUserIds ?? []}
        isPending={assignMutation.isPending}
        onConfirm={async (staffUserIds) => {
          if (!assignSession) return;
          try {
            await assignMutation.mutateAsync({
              sessionId: assignSession.id,
              payload: { staffUserIds },
            });
            toast.success(t("assignSuccess"));
            setAssignSession(null);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : t("actionError"));
          }
        }}
      />
    </div>
  );
}
