"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Package, Plus, Trash2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Progress } from "@/components/ui/progress";
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

/** Fixed truck capacity used while drafting the plan (before submit). */
const DRAFT_TRUCK_CAPACITY_TIRES = 2000;

/** Prefer API `expectedTireCount`; fall back to `totalVolume` when needed. */
function getExpectedTireCount(
  request?: PlanningPoolRequest | InboundTruckRequestLink | null,
): number {
  if (!request) return 0;
  if ("expectedTireCount" in request && request.expectedTireCount != null) {
    return request.expectedTireCount;
  }
  if ("totalVolume" in request && request.totalVolume != null) {
    return request.totalVolume;
  }
  return 0;
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
      schedulingCellId,
      serviceDate: cell?.serviceDate,
      receivingDay: cell?.receivingDay,
    },
    { enabled: Boolean(cell?.serviceDate && cell?.receivingDay) },
  );

  const approveMutation = useApproveInboundTruck();
  const [localDrafts, setLocalDrafts] = useState<DraftTruck[]>([]);
  const [draftCellId, setDraftCellId] = useState(schedulingCellId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOverLocalId, setDragOverLocalId] = useState<string | null>(null);
  const [dragOverPool, setDragOverPool] = useState(false);

  if (draftCellId !== schedulingCellId) {
    setDraftCellId(schedulingCellId);
    setLocalDrafts([]);
  }

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

  const pool = useMemo(() => poolData ?? [], [poolData]);
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
        let truckVersion = truck.version ?? 0;
        for (const inboundRequestId of draft.assignedRequestIds) {
          try {
            const updated = await assignRequestToTruck(
              truck.id,
              inboundRequestId,
              truckVersion,
            );
            truckVersion = updated.version ?? truckVersion + 1;
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
    const truck = serverTrucks.find((item) => item.id === serverTruckId);
    try {
      await approveMutation.mutateAsync({
        truckId: serverTruckId,
        version: truck?.version ?? 0,
      });
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
    setDragOverLocalId(null);
    const truck = localDrafts.find((item) => item.localId === localId);
    if (!truck) return;
    const inboundRequestId = Number(event.dataTransfer.getData("text/plain"));
    const source = event.dataTransfer.getData("application/x-source");
    if (!inboundRequestId || (source !== "pool" && source !== "truck")) return;
    handleAssignLocal(localId, inboundRequestId);
  }

  function handlePoolDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOverPool(false);
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
          onDragOver={(event) => {
            event.preventDefault();
            setDragOverPool(true);
          }}
          onDragLeave={() => setDragOverPool(false)}
          onDrop={handlePoolDrop}
          className={cn(
            "rounded-xl border border-[var(--color-surface-light-container)] bg-card p-4 transition-colors dark:border-[var(--color-surface-container-high)]",
            dragOverPool && "bg-primary/5 ring-2 ring-primary border-transparent"
          )}
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
                    "flex items-center gap-2 rounded-lg border border-[var(--color-surface-light-container)] bg-muted/40 px-3 py-2.5 text-body-sm text-foreground dark:border-[var(--color-surface-container-high)]",
                    !isBusy && "cursor-grab active:cursor-grabbing",
                  )}
                >
                  <span className="min-w-0 font-medium">
                    {t("requestShortLabel", { id: request.inboundRequestId })}
                    <span className="mt-0.5 block text-xs font-normal text-primary-dark">
                      {t("requestTireCount", {
                        count: getExpectedTireCount(request),
                      })}
                    </span>
                  </span>
                  <span className="ml-auto text-muted-foreground">
                    {getStatusLabel((key) => tStatus(key as never), request.status)}
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
                const isDragOver = dragOverLocalId === truck.localId;
                const serverTruck = isPersisted
                  ? serverTrucks.find((t) => t.id === truck.serverTruckId)
                  : null;
                const capacityTires =
                  serverTruck?.capacityTires && serverTruck.capacityTires > 0
                    ? serverTruck.capacityTires
                    : DRAFT_TRUCK_CAPACITY_TIRES;
                const assignedRequestCount = truck.assignedRequestIds.length;
                const assignedTires = truck.assignedRequestIds.reduce((sum, id) => {
                  return sum + getExpectedTireCount(requestById.get(id));
                }, 0);
                const isOverCapacity = assignedTires > capacityTires;

                return (
                  <div
                    key={truck.localId}
                    onDragOver={(event) => {
                      if (!isPersisted) {
                        event.preventDefault();
                        setDragOverLocalId(truck.localId);
                      }
                    }}
                    onDragLeave={() => setDragOverLocalId(null)}
                    onDrop={(event) => handleTruckDrop(event, truck.localId)}
                    className={cn(
                      "flex min-h-40 flex-col rounded-xl border border-[var(--color-surface-light-container)] bg-card p-4 transition-colors animate-in fade-in zoom-in-95 duration-200 dark:border-[var(--color-surface-container-high)]",
                      isDragOver && "bg-primary/5 ring-2 ring-primary border-transparent"
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <h3 className="text-label-lg font-semibold text-foreground">
                          {truck.label}
                        </h3>
                        <div className="flex w-44 flex-col gap-1.5">
                          <p className="text-xs font-medium text-foreground">
                            {t("truckPlanLiveStats", {
                              requests: assignedRequestCount,
                              tires: assignedTires,
                            })}
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                            <span>
                              {t("truckPlanCapacityStats", {
                                tires: assignedTires,
                                capacity: capacityTires,
                              })}
                            </span>
                            {isOverCapacity ? (
                              <span className="text-destructive">{t("truckOverCapacity")}</span>
                            ) : null}
                          </div>
                          <Progress
                            value={Math.min((assignedTires / capacityTires) * 100, 100)}
                            className="h-1.5 bg-muted"
                            indicatorClassName={
                              isOverCapacity ? "bg-destructive" : "bg-primary"
                            }
                          />
                        </div>
                      </div>
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
                              count:
                                requestCountByTruckId.get(
                                  truck.serverTruckId as number,
                                ) ?? 0,
                            })
                          : t("truckDropHint")}
                      </p>
                    ) : (
                      <div className="flex flex-1 flex-col gap-2">
                        {truck.assignedRequestIds.map((requestId) => {
                          const request = requestById.get(requestId);
                          const tireCount = getExpectedTireCount(request);
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
                              <span className="min-w-0 font-medium">
                                {t("requestShortLabel", { id: requestId })}
                                {request && "dealerName" in request && request.dealerName ? (
                                  <span className="font-normal text-muted-foreground">
                                    {" "}
                                    · {request.dealerName}
                                  </span>
                                ) : null}
                                <span className="mt-0.5 block text-xs font-normal text-primary-dark">
                                  {t("requestTireCount", { count: tireCount })}
                                </span>
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
                className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-transparent px-4 py-6 text-primary transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <Plus className="size-6" />
                </span>
                <span className="text-label-md font-medium tracking-wide">{t("addTruck")}</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
