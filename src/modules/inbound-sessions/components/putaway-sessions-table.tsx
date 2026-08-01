"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Eye, Play, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
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
import { usePutawaySessions } from "@/modules/inbound-sessions/hooks/use-putaway-sessions";
import {
  canApprovePutawaySession,
  canAssignPutawaySession,
  canStartPutawaySession,
} from "@/modules/inbound-sessions/lib/status-utils";
import type { PutawaySession } from "@/modules/inbound-sessions/types/putaway-session";

export function PutawaySessionsTable() {
  const t = useTranslations("inboundSessions");
  const { data, isPending, isError, error, refetch } = usePutawaySessions();
  const approveMutation = useApprovePutawaySession();
  const assignMutation = useAssignPutawaySession();
  const startMutation = useStartPutawaySession();
  const [assignSession, setAssignSession] = useState<PutawaySession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const { data: detailData, isFetching: isDetailFetching } = usePutawaySessionDetail(assignSession?.id ?? 0, {
    enabled: assignSession != null,
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = data;
    if (dateFilter) {
      result = result.filter(session => (session.createdAt || "").includes(dateFilter));
    }
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((session) => 
        String(session.id).includes(lowerQuery) || 
        (session.zoneName?.toLowerCase() || "").includes(lowerQuery)
      );
    }
    return result;
  }, [data, searchQuery, dateFilter]);

  async function handleApprove(session: PutawaySession) {
    try {
      await approveMutation.mutateAsync({
        sessionId: session.id,
        version: session.version ?? 0,
      });
      toast.success(t("approveSessionSuccess"));
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
            className="w-full sm:w-[180px] h-10"
            aria-label={t("selectServiceDate")}
          />
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, zone..."
              className="pl-9 h-10 bg-card"
            />
          </div>
        </div>
      </div>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={t("retry")}
        />
      ) : null}

      <StyledTable<PutawaySession>
        rows={filteredData}
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
                    onClick={() => void handleApprove(row)}
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
                {canStartPutawaySession(row.status) ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={startMutation.isPending}
                    onClick={async () => {
                      try {
                        await startMutation.mutateAsync({
                          sessionId: row.id,
                          version: row.version ?? 0,
                        });
                        toast.success(t("startSessionSuccess"));
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : t("actionError"));
                      }
                    }}
                  >
                    <Play className="size-4" />
                    {t("startSession")}
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
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
        initialStaffIds={detailData?.assignedStaffUserIds ?? assignSession?.assignedStaffUserIds ?? []}
        isPending={assignMutation.isPending || isDetailFetching}
        onConfirm={async (staffUserIds) => {
          if (!assignSession) return;
          try {
            await assignMutation.mutateAsync({
              sessionId: assignSession.id,
              payload: {
                staffUserIds,
                version: assignSession.version ?? 0,
              },
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
