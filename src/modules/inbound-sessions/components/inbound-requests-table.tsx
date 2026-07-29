"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Eye, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StyledTable } from "@/components/ui/styled-table";
import { ROUTES } from "@/constants/routes";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { useAcceptInboundRequest } from "@/modules/inbound-sessions/hooks/use-accept-inbound-request";
import { useInboundRequests } from "@/modules/inbound-sessions/hooks/use-inbound-requests";
import { useRejectInboundRequest } from "@/modules/inbound-sessions/hooks/use-reject-inbound-request";
import {
  canAcceptInboundRequest,
  canRejectInboundRequest,
  formatDayLabel,
  INBOUND_REQUEST_STATUS_FILTERS,
} from "@/modules/inbound-sessions/lib/status-utils";
import type { InboundRequest } from "@/modules/inbound-sessions/types/inbound-request";

export function InboundRequestsTable() {
  const t = useTranslations("inboundSessions");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingReject, setPendingReject] = useState<InboundRequest | null>(null);
  const params = useMemo(
    () => (statusFilter === "all" ? undefined : { status: statusFilter }),
    [statusFilter],
  );
  const { data = [], isPending, isError, error, refetch } = useInboundRequests(params);
  const acceptMutation = useAcceptInboundRequest();
  const rejectMutation = useRejectInboundRequest();

  async function handleAccept(request: InboundRequest) {
    try {
      await acceptMutation.mutateAsync(request.id);
      toast.success(t("acceptSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  async function handleReject() {
    if (!pendingReject) return;
    try {
      await rejectMutation.mutateAsync(pendingReject.id);
      toast.success(t("rejectSuccess"));
      setPendingReject(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-md text-muted-foreground">{t("requestsIntro")}</p>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder={t("filterStatus")} />
          </SelectTrigger>
          <SelectContent>
            {INBOUND_REQUEST_STATUS_FILTERS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {t(item.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={t("retry")}
        />
      ) : null}

      <StyledTable
        columns={[
          { header: t("columnRequestId"), render: (row) => `#${row.id}` },
          { header: t("columnDealer"), render: (row) => row.dealerName ?? "—" },
          {
            header: t("columnDay"),
            render: (row) => (row.receivingDay ? formatDayLabel(row.receivingDay) : "—"),
          },
          {
            header: t("columnExpectedTires"),
            render: (row) => row.expectedTireCount.toLocaleString(),
          },
          {
            header: t("columnStatus"),
            render: (row) => <SessionStatusBadge status={row.status} />,
          },
          {
            header: t("columnActions"),
            render: (row) => (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button type="button" size="sm" variant="outline" asChild>
                  <Link href={ROUTES.DASHBOARD.INBOUND_SESSIONS.REQUEST_DETAIL(row.id)}>
                    <Eye className="size-4" />
                    {t("viewDetails")}
                  </Link>
                </Button>
                {canAcceptInboundRequest(row.status) ? (
                  <Button
                    type="button"
                    size="sm"
                    className={PRIMARY_BUTTON_CLASS}
                    disabled={acceptMutation.isPending}
                    onClick={() => void handleAccept(row)}
                  >
                    <Check className="size-4" />
                    {t("acceptRequest")}
                  </Button>
                ) : null}
                {canRejectInboundRequest(row.status) ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={rejectMutation.isPending}
                    onClick={() => setPendingReject(row)}
                  >
                    <X className="size-4" />
                    {t("rejectRequest")}
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
        rows={data}
        keyProp={(row) => row.id}
        isLoading={isPending}
        emptyText={t("noInboundRequests")}
        horizontalScroll
      />

      <Dialog open={pendingReject != null} onOpenChange={(open) => !open && setPendingReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("rejectConfirmDescription", { id: pendingReject?.id ?? "" })}
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
              onClick={() => void handleReject()}
            >
              {rejectMutation.isPending ? t("saving") : t("rejectRequest")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
