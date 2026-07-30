"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Package, Plus, Trash2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { cn } from "@/lib/utils";
import { useApproveInboundTruck } from "@/modules/inbound-sessions/hooks/use-inbound-truck-mutations";
import {
  inboundMutationInvalidationKeys,
  inboundQueryKeys,
} from "@/modules/inbound-sessions/hooks/query-keys";
import { usePlanningPool } from "@/modules/inbound-sessions/hooks/use-planning-pool";
import { usePlanningTrucks } from "@/modules/inbound-sessions/hooks/use-planning-trucks";
import { useSchedulingCell } from "@/modules/inbound-sessions/hooks/use-scheduling-cell";
import { getStatusLabel } from "@/modules/inbound-sessions/lib/status-utils";
import {
  assignRequestToTruck,
  createInboundTruck,
} from "@/modules/inbound-sessions/services/inbound-truck.service";
import type {
  InboundTruckRequestLink,
  PlanningPoolRequest,
} from "@/modules/inbound-sessions/types/inbound-truck";
import { InboundError } from "@/modules/inbound-sessions/lib/inbound-error";

type DraftTruck = {
  localId: string;
  serverTruckId?: number;
  label: string;
  assignedRequestIds: number[];
};

type InboundTruckPlanningBoardProps = {
  schedulingCellId: number;
};

function createLocalId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toPersistedDraft(
  truck: {
    id: number;
    label?: string;
    assignedRequests: InboundTruckRequestLink[];
  },
  fallbackLabel: string,
): DraftTruck {
  return {
    localId: `server-${truck.id}`,
    serverTruckId: truck.id,
    label: truck.label ?? fallbackLabel,
    assignedRequestIds: truck.assignedRequests.map((request) => request.inboundRequestId),
  };
}

export function InboundTruckPlanningBoard({ schedulingCellId }: InboundTruckPlanningBoardProps) {
  const t = useTranslations("inboundSessions");
  const tStatus = useTranslations("inboundSessions.statuses");
  const queryClient = useQueryClient();
  const {
    data: cell,
    isPending: cellPending,
    isError: cellError,
    error: cellErr,
    refetch: refetchCell,
  } = useSchedulingCell(schedulingCellId);
  const {
    data: poolData,
    isPending: poolPending,
    isError: poolError,
    error: poolErr,
    refetch: refetchPool,
  } = usePlanningPool({ schedulingCellId });
  const {
    data: serverTrucks = [],
    isPending: trucksPending,
    isError: trucksError,
    error: trucksErr,
    refetch: refetchTrucks,
  } = usePlanningTrucks(
    {
      serviceDate: cell?.serviceDate,
      receivingDay: cell?.receivingDay,
    },
    { enabled: Boolean(cell?.serviceDate && cell?.receivingDay) },
  );

  const approveMutation = useApproveInboundTruck();
  const [localDrafts, setLocalDrafts] = useState<DraftTruck[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLocalDrafts([]);
  }, [schedulingCellId]);

  const persistedTrucks = useMemo(
    () =>
      serverTrucks.map((truck) =>
        toPersistedDraft(truck, t("truckLabel", { id: truck.id })),
      ),
    [serverTrucks, t],
  );

  const trucks = useMemo(
    () => [...persistedTrucks, ...localDrafts],
    [persistedTrucks, localDrafts],
  );

  const pool = poolData ?? [];
  const assignedRequestIds = useMemo(() => {
    const ids = new Set<number>();
    for (const truck of trucks) {
      for (const requestId of truck.assignedRequestIds) ids.add(requestId);
    }
    return ids;
  }, [trucks]);

  const availablePool = useMemo(
    () => pool.filter((request) => !assignedRequestIds.has(request.inboundRequestId)),
    [pool, assignedRequestIds],
  );

  const requestById = useMemo(() => {
    const map = new Map<number, PlanningPoolRequest | InboundTruckRequestLink>();
    for (const request of pool) map.set(request.inboundRequestId, request);
    for (const truck of serverTrucks) {
      for (const request of truck.assignedRequests) {
        if (!map.has(request.inboundRequestId)) {
          map.set(request.inboundRequestId, request);
        }
      }
    }
    return map;
  }, [pool, serverTrucks]);

  const requestCountByTruckId = useMemo(() => {
    const map = new Map<number, number>();
    for (const truck of serverTrucks) {
      map.set(truck.id, truck.requestCount ?? truck.assignedRequests.length);
    }
    return map;
  }, [serverTrucks]);

  const hasPendingPlan = localDrafts.some((truck) => truck.assignedRequestIds.length > 0);
  const isBusy = isSubmitting || approveMutation.isPending;
  const isLoadingBoard = cellPending || poolPending || (Boolean(cell?.serviceDate) && trucksPending);

  function handleAddTruck() {
    setLocalDrafts((prev) => [
      ...prev,
      {
        localId: createLocalId(),
        label: t("draftTruckLabel", { number: trucks.length + 1 }),
        assignedRequestIds: [],
      },
    ]);
  }

  function handleRemoveDraftTruck(localId: string) {
    setLocalDrafts((prev) => prev.filter((truck) => truck.localId !== localId));
  }

  function handleAssignLocal(localId: string, inboundRequestId: number) {
    setLocalDrafts((prev) =>
      prev.map((truck) => {
        if (truck.localId === localId) {
          if (truck.assignedRequestIds.includes(inboundRequestId)) return truck;
          return {
            ...truck,
            assignedRequestIds: [...truck.assignedRequestIds, inboundRequestId],
          };
        }
        return {
          ...truck,
          assignedRequestIds: truck.assignedRequestIds.filter((id) => id !== inboundRequestId),
        };
      }),
    );
  }

  function handleUnassignLocal(localId: string, inboundRequestId: number) {
    setLocalDrafts((prev) =>
      prev.map((truck) =>
        truck.localId === localId
          ? {
              ...truck,
              assignedRequestIds: truck.assignedRequestIds.filter((id) => id !== inboundRequestId),
            }
          : truck,
      ),
    );
  }

  async function invalidateAfterMutation() {
    const keys = inboundMutationInvalidationKeys();
    void queryClient.invalidateQueries({
      queryKey: [...inboundQueryKeys.all, "planning-pool"],
    });
    void queryClient.invalidateQueries({ queryKey: keys.planningTrucks });
    void queryClient.invalidateQueries({ queryKey: keys.transit });
    void queryClient.invalidateQueries({ queryKey: keys.dashboard });
  }

  async function handleSubmitPlan() {
    if (!cell) {
      toast.error(t("truckCreateCellRequired"));
      return;
    }
    if (!cell.serviceDate) {
      toast.error(t("truckCreateServiceDateRequired"));
      return;
    }

    const poolIds = new Set(pool.map((request) => request.inboundRequestId));
    const toSubmit = localDrafts
      .map((truck) => ({
        ...truck,
        assignedRequestIds: truck.assignedRequestIds.filter((id) => poolIds.has(id)),
      }))
      .filter((truck) => truck.assignedRequestIds.length > 0);

    if (toSubmit.length === 0) {
      toast.error(t("truckPlanSubmitNeedsAssignments"));
      return;
    }

    setIsSubmitting(true);
    try {
      let createdCount = 0;
      let skippedAssignments = 0;
      for (const draft of toSubmit) {
        const truck = await createInboundTruck({
          schedulingCellId,
          receivingDay: cell.receivingDay,
          serviceDate: cell.serviceDate,
        });
        let assignedOnTruck = 0;
        for (const inboundRequestId of draft.assignedRequestIds) {
          try {
            await assignRequestToTruck(truck.id, inboundRequestId);
            assignedOnTruck += 1;
          } catch (err) {
            if (err instanceof InboundError && err.status === 409) {
              skippedAssignments += 1;
              continue;
            }
            throw err;
          }
        }
        if (assignedOnTruck > 0) createdCount += 1;
      }

      setLocalDrafts((prev) =>
        prev.filter((truck) => !toSubmit.some((submitted) => submitted.localId === truck.localId)),
      );
      await invalidateAfterMutation();
      if (skippedAssignments > 0) {
        toast.warning(t("truckPlanSubmitPartialConflict", { skipped: skippedAssignments }));
      }
      toast.success(t("truckPlanSubmitSuccess", { count: createdCount }));
    } catch (err) {
      await invalidateAfterMutation();
      toast.error(err instanceof Error ? err.message : t("actionError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApprove(serverTruckId: number, assignedCount: number) {
    if (assignedCount === 0) {
      toast.error(t("truckApproveNeedsRequests"));
      return;
    }
    try {
      await approveMutation.mutateAsync(serverTruckId);
      toast.success(t("truckApproveSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  function handlePoolDragStart(
    event: React.DragEvent<HTMLDivElement>,
    inboundRequestId: number,
  ) {
    event.dataTransfer.setData("text/plain", String(inboundRequestId));
    event.dataTransfer.setData("application/x-source", "pool");
  }

  function handleAssignedDragStart(
    event: React.DragEvent<HTMLDivElement>,
    localId: string,
    inboundRequestId: number,
  ) {
    event.dataTransfer.setData("text/plain", String(inboundRequestId));
    event.dataTransfer.setData("application/x-source", "truck");
    event.dataTransfer.setData("application/x-truck-local-id", localId);
  }

  function handleTruckDrop(event: React.DragEvent<HTMLDivElement>, localId: string) {
    event.preventDefault();
    const truck = localDrafts.find((item) => item.localId === localId);
    if (!truck) return;
    const inboundRequestId = Number(event.dataTransfer.getData("text/plain"));
    const source = event.dataTransfer.getData("application/x-source");
    if (!inboundRequestId || (source !== "pool" && source !== "truck")) return;
    handleAssignLocal(localId, inboundRequestId);
  }

  function handlePoolDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const inboundRequestId = Number(event.dataTransfer.getData("text/plain"));
    const source = event.dataTransfer.getData("application/x-source");
    const sourceLocalId = event.dataTransfer.getData("application/x-truck-local-id");
    if (!inboundRequestId || source !== "truck" || !sourceLocalId) return;
    if (!localDrafts.some((truck) => truck.localId === sourceLocalId)) return;
    handleUnassignLocal(sourceLocalId, inboundRequestId);
  }

  const loadError = cellError || poolError || trucksError;
  const errorMessage =
    (cellErr instanceof Error && cellErr.message) ||
    (poolErr instanceof Error && poolErr.message) ||
    (trucksErr instanceof Error && trucksErr.message) ||
    t("errorLoading");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-md text-muted-foreground">{t("truckPlanningIntro")}</p>
        <Button
          type="button"
          className={cn(PRIMARY_BUTTON_CLASS, "shrink-0")}
          disabled={isBusy || !hasPendingPlan}
          onClick={() => void handleSubmitPlan()}
        >
          <Check className="size-4" />
          {isSubmitting ? t("saving") : t("submitTruckPlan")}
        </Button>
      </div>

      {loadError ? (
        <ErrorAlert
          message={errorMessage}
          onRetry={() => {
            void refetchCell();
            void refetchPool();
            void refetchTrucks();
          }}
          retryLabel={t("retry")}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]">
        <section
          onDragOver={(event) => event.preventDefault()}
          onDrop={handlePoolDrop}
          className="rounded-xl border border-[var(--color-surface-light-container)] bg-card p-4 dark:border-[var(--color-surface-container-high)]"
        >
          <h2 className="mb-4 flex items-center gap-2 text-label-lg font-semibold text-foreground">
            <Package className="size-4 text-primary" />
            {t("planningPoolTitle")}
          </h2>

          {isLoadingBoard ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : availablePool.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--color-surface-light-container)] px-3 py-8 text-center text-body-sm text-muted-foreground dark:border-[var(--color-surface-container-high)]">
              {t("noPlanningPoolRequests")}
            </p>
          ) : (
            <div className="space-y-2">
              {availablePool.map((request) => (
                <div
                  key={request.inboundRequestId}
                  draggable={!isBusy}
                  onDragStart={(event) =>
                    handlePoolDragStart(event, request.inboundRequestId)
                  }
                  className={cn(
                    "rounded-lg border border-[var(--color-surface-light-container)] bg-muted/40 px-3 py-2.5 text-body-sm text-foreground dark:border-[var(--color-surface-container-high)]",
                    !isBusy && "cursor-grab active:cursor-grabbing",
                  )}
                >
                  <span className="font-medium">
                    {t("requestShortLabel", { id: request.inboundRequestId })}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    ({getStatusLabel((key) => tStatus(key as never), request.status)})
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="min-w-0">
          {isLoadingBoard ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {trucks.map((truck) => {
                const isPersisted = truck.serverTruckId != null;
                return (
                  <div
                    key={truck.localId}
                    onDragOver={(event) => {
                      if (!isPersisted) event.preventDefault();
                    }}
                    onDrop={(event) => handleTruckDrop(event, truck.localId)}
                    className="flex min-h-40 flex-col rounded-xl border border-[var(--color-surface-light-container)] bg-card p-4 dark:border-[var(--color-surface-container-high)]"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3 className="text-label-lg font-semibold text-foreground">
                        {truck.label}
                      </h3>
                      <div className="flex shrink-0 items-center gap-1">
                        {isPersisted ? (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto px-0 text-primary"
                            disabled={isBusy || (truck.assignedRequestIds.length === 0 &&
                              (requestCountByTruckId.get(truck.serverTruckId as number) ?? 0) === 0)}
                            onClick={() =>
                              void handleApprove(
                                truck.serverTruckId as number,
                                Math.max(
                                  truck.assignedRequestIds.length,
                                  requestCountByTruckId.get(truck.serverTruckId as number) ?? 0,
                                ),
                              )
                            }
                          >
                            {t("approveTruck")}
                          </Button>
                        ) : (
                          <button
                            type="button"
                            className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label={t("removeDraftTruck")}
                            disabled={isBusy}
                            onClick={() => handleRemoveDraftTruck(truck.localId)}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {truck.assignedRequestIds.length === 0 ? (
                      <p className="flex-1 text-body-sm text-muted-foreground">
                        {isPersisted &&
                        (requestCountByTruckId.get(truck.serverTruckId as number) ?? 0) > 0
                          ? t("truckAssignedRequestsCount", {
                              count: requestCountByTruckId.get(
                                truck.serverTruckId as number,
                              ),
                            })
                          : t("truckDropHint")}
                      </p>
                    ) : (
                      <div className="flex flex-1 flex-col gap-2">
                        {truck.assignedRequestIds.map((requestId) => {
                          const request = requestById.get(requestId);
                          return (
                            <div
                              key={requestId}
                              draggable={!isPersisted && !isBusy}
                              onDragStart={(event) =>
                                handleAssignedDragStart(event, truck.localId, requestId)
                              }
                              className={cn(
                                "flex items-center justify-between gap-2 rounded-lg border border-[var(--color-surface-light-container)] bg-muted/40 px-3 py-2 text-body-sm text-foreground dark:border-[var(--color-surface-container-high)]",
                                !isPersisted &&
                                  !isBusy &&
                                  "cursor-grab active:cursor-grabbing",
                              )}
                            >
                              <span className="font-medium">
                                {t("requestShortLabel", { id: requestId })}
                                {request && "dealerName" in request && request.dealerName ? (
                                  <span className="font-normal text-muted-foreground">
                                    {" "}
                                    · {request.dealerName}
                                  </span>
                                ) : null}
                              </span>
                              {!isPersisted ? (
                                <button
                                  type="button"
                                  className="rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                  aria-label={t("unassignFromTruck")}
                                  disabled={isBusy}
                                  onClick={() =>
                                    handleUnassignLocal(truck.localId, requestId)
                                  }
                                >
                                  <X className="size-3.5" />
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                disabled={isBusy || !cell}
                onClick={handleAddTruck}
                className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/60 bg-transparent px-4 py-6 text-primary transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex size-10 items-center justify-center rounded-full border border-primary/40">
                  <Plus className="size-5" />
                </span>
                <span className="text-body-md font-medium">{t("addTruck")}</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
