"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useApproveOutboundTruck } from "@/modules/outbound-sessions/hooks/use-outbound-truck-mutations";
import {
  outboundMutationInvalidationKeys,
  outboundQueryKeys,
} from "@/modules/outbound-sessions/hooks/query-keys";
import { useOutboundPlanningPool } from "@/modules/outbound-sessions/hooks/use-outbound-planning-pool";
import { useOutboundPlanningTrucks } from "@/modules/outbound-sessions/hooks/use-outbound-planning-trucks";
import { useOutboundSchedulingCell } from "@/modules/outbound-sessions/hooks/use-outbound-scheduling-cell";
import { getStatusLabel } from "@/modules/outbound-sessions/lib/status-utils";
import { OutboundError } from "@/modules/outbound-sessions/lib/outbound-error";
import {
  assignOutboundRequestToTruck,
  createOutboundTruck,
  deleteOutboundTruck,
} from "@/modules/outbound-sessions/services/outbound-truck.service";
import type {
  OutboundPlanningPoolRequest,
  OutboundTruckRequestLink,
} from "@/modules/outbound-sessions/types/outbound-truck";

type DraftTruck = {
  localId: string;
  serverTruckId?: number;
  label: string;
  assignedRequestIds: number[];
};

type OutboundTruckPlanningBoardProps = {
  schedulingCellId: number;
};

function createLocalId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toPersistedDraft(
  truck: {
    id: number;
    label?: string;
    assignedRequests: OutboundTruckRequestLink[];
  },
  fallbackLabel: string,
): DraftTruck {
  return {
    localId: `server-${truck.id}`,
    serverTruckId: truck.id,
    label: truck.label ?? fallbackLabel,
    assignedRequestIds: truck.assignedRequests.map((request) => request.outboundRequestId),
  };
}

export function OutboundTruckPlanningBoard({
  schedulingCellId,
}: OutboundTruckPlanningBoardProps) {
  const t = useTranslations("outboundSessions");
  const tStatus = useTranslations("outboundSessions.statuses");
  const queryClient = useQueryClient();
  const {
    data: cell,
    isPending: cellPending,
    isError: cellError,
    error: cellErr,
    refetch: refetchCell,
  } = useOutboundSchedulingCell(schedulingCellId);
  const {
    data: poolData,
    isPending: poolPending,
    isError: poolError,
    error: poolErr,
    refetch: refetchPool,
  } = useOutboundPlanningPool({ schedulingCellId });
  const {
    data: serverTrucks = [],
    isPending: trucksPending,
    isError: trucksError,
    error: trucksErr,
    refetch: refetchTrucks,
  } = useOutboundPlanningTrucks(
    {
      serviceDate: cell?.serviceDate,
      deliveryDay: cell?.deliveryDay,
    },
    { enabled: Boolean(cell?.serviceDate) },
  );

  const approveMutation = useApproveOutboundTruck();
  const [localDrafts, setLocalDrafts] = useState<DraftTruck[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOverLocalId, setDragOverLocalId] = useState<string | null>(null);
  const [dragOverPool, setDragOverPool] = useState(false);
  const [deletingTruckId, setDeletingTruckId] = useState<number | null>(null);

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
    () => pool.filter((request) => !assignedRequestIds.has(request.outboundRequestId)),
    [pool, assignedRequestIds],
  );

  const requestById = useMemo(() => {
    const map = new Map<number, OutboundPlanningPoolRequest | OutboundTruckRequestLink>();
    for (const request of pool) map.set(request.outboundRequestId, request);
    for (const truck of serverTrucks) {
      for (const request of truck.assignedRequests) {
        if (!map.has(request.outboundRequestId)) {
          map.set(request.outboundRequestId, request);
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
  const isBusy = isSubmitting || approveMutation.isPending || deletingTruckId != null;
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

  function handleAssignLocal(localId: string, outboundRequestId: number) {
    setLocalDrafts((prev) =>
      prev.map((truck) => {
        if (truck.localId === localId) {
          if (truck.assignedRequestIds.includes(outboundRequestId)) return truck;
          return {
            ...truck,
            assignedRequestIds: [...truck.assignedRequestIds, outboundRequestId],
          };
        }
        return {
          ...truck,
          assignedRequestIds: truck.assignedRequestIds.filter((id) => id !== outboundRequestId),
        };
      }),
    );
  }

  function handleUnassignLocal(localId: string, outboundRequestId: number) {
    setLocalDrafts((prev) =>
      prev.map((truck) =>
        truck.localId === localId
          ? {
              ...truck,
              assignedRequestIds: truck.assignedRequestIds.filter((id) => id !== outboundRequestId),
            }
          : truck,
      ),
    );
  }

  async function invalidateAfterMutation() {
    const keys = outboundMutationInvalidationKeys();
    void queryClient.invalidateQueries({
      queryKey: [...outboundQueryKeys.all, "planning-pool"],
    });
    void queryClient.invalidateQueries({ queryKey: keys.planningTrucks });
    void queryClient.invalidateQueries({ queryKey: keys.readyToShip });
    void queryClient.invalidateQueries({ queryKey: keys.picking });
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

    const poolIds = new Set(pool.map((request) => request.outboundRequestId));
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
        const truck = await createOutboundTruck({
          schedulingCellId,
          deliveryDay: String(cell.deliveryDay),
          serviceDate: cell.serviceDate,
        });
        let assignedOnTruck = 0;
        for (const outboundRequestId of draft.assignedRequestIds) {
          try {
            await assignOutboundRequestToTruck(truck.id, outboundRequestId);
            assignedOnTruck += 1;
          } catch (err) {
            if (err instanceof OutboundError && err.status === 409) {
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

  async function handleDeletePersistedTruck(serverTruckId: number) {
    setDeletingTruckId(serverTruckId);
    try {
      await deleteOutboundTruck(serverTruckId);
      await invalidateAfterMutation();
      toast.success(t("truckDeleteSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    } finally {
      setDeletingTruckId(null);
    }
  }

  function handlePoolDragStart(
    event: React.DragEvent<HTMLDivElement>,
    outboundRequestId: number,
  ) {
    event.dataTransfer.setData("text/plain", String(outboundRequestId));
    event.dataTransfer.setData("application/x-source", "pool");
  }

  function handleAssignedDragStart(
    event: React.DragEvent<HTMLDivElement>,
    localId: string,
    outboundRequestId: number,
  ) {
    event.dataTransfer.setData("text/plain", String(outboundRequestId));
    event.dataTransfer.setData("application/x-source", "truck");
    event.dataTransfer.setData("application/x-truck-local-id", localId);
  }

  function handleTruckDrop(event: React.DragEvent<HTMLDivElement>, localId: string) {
    event.preventDefault();
    setDragOverLocalId(null);
    const truck = localDrafts.find((item) => item.localId === localId);
    if (!truck) return;
    const outboundRequestId = Number(event.dataTransfer.getData("text/plain"));
    const source = event.dataTransfer.getData("application/x-source");
    if (!outboundRequestId || (source !== "pool" && source !== "truck")) return;
    handleAssignLocal(localId, outboundRequestId);
  }

  function handlePoolDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOverPool(false);
    const outboundRequestId = Number(event.dataTransfer.getData("text/plain"));
    const source = event.dataTransfer.getData("application/x-source");
    const sourceLocalId = event.dataTransfer.getData("application/x-truck-local-id");
    if (!outboundRequestId || source !== "truck" || !sourceLocalId) return;
    if (!localDrafts.some((truck) => truck.localId === sourceLocalId)) return;
    handleUnassignLocal(sourceLocalId, outboundRequestId);
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
        <div className="space-y-1">
          <p className="text-body-md text-muted-foreground">{t("truckPlanningIntro")}</p>
          <p className="text-body-sm text-muted-foreground">{t("truckApproveLockHint")}</p>
        </div>
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
                  key={request.outboundRequestId}
                  draggable={!isBusy}
                  onDragStart={(event) =>
                    handlePoolDragStart(event, request.outboundRequestId)
                  }
                  className={cn(
                    "rounded-lg border border-[var(--color-surface-light-container)] bg-muted/40 px-3 py-2.5 text-body-sm text-foreground dark:border-[var(--color-surface-container-high)]",
                    !isBusy && "cursor-grab active:cursor-grabbing",
                  )}
                >
                  <span className="font-medium">
                    {t("requestShortLabel", { id: request.outboundRequestId })}
                    {request.dealerName ? (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {request.dealerName}
                      </span>
                    ) : null}
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
                const isDragOver = dragOverLocalId === truck.localId;
                const serverTruck = isPersisted ? serverTrucks.find(t => t.id === truck.serverTruckId) : null;
                const capacityTires = serverTruck?.capacityTires;
                const assignedTires = isPersisted
                  ? (serverTruck?.assignedTires ?? 0)
                  : truck.assignedRequestIds.reduce((sum, id) => {
                      const req = requestById.get(id);
                      return sum + (req && "expectedTireCount" in req ? (req.expectedTireCount ?? 0) : 0);
                    }, 0);

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
                      <div className="flex flex-col gap-1">
                        <h3 className="text-label-lg font-semibold text-foreground">
                          {truck.label}
                        </h3>
                        {(!isPersisted || capacityTires !== undefined) && (
                          <div className="flex flex-col gap-1.5 w-32">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                              <span>{assignedTires} {capacityTires ? `/ ${capacityTires}` : ""} tires</span>
                              {capacityTires && assignedTires > capacityTires && (
                                <span className="text-destructive">Over capacity</span>
                              )}
                            </div>
                            {capacityTires && (
                              <Progress 
                                value={Math.min((assignedTires / capacityTires) * 100, 100)} 
                                className="h-1.5 bg-muted"
                                indicatorClassName={assignedTires > capacityTires ? "bg-destructive" : "bg-primary"}
                              />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {isPersisted ? (
                          <>
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="h-auto px-0 text-primary"
                              disabled={
                                isBusy ||
                                (truck.assignedRequestIds.length === 0 &&
                                  (requestCountByTruckId.get(truck.serverTruckId as number) ??
                                    0) === 0)
                              }
                              onClick={() =>
                                void handleApprove(
                                  truck.serverTruckId as number,
                                  Math.max(
                                    truck.assignedRequestIds.length,
                                    requestCountByTruckId.get(truck.serverTruckId as number) ??
                                      0,
                                  ),
                                )
                              }
                            >
                              {t("approveTruck")}
                            </Button>
                            <button
                              type="button"
                              className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                              aria-label={t("deleteTruck")}
                              disabled={isBusy}
                              onClick={() =>
                                void handleDeletePersistedTruck(truck.serverTruckId as number)
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </>
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
