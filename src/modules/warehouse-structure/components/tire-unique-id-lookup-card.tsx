"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { FieldError, FieldHint, Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StyledTable } from "@/components/ui/styled-table";
import { PositionStatusBadge } from "@/modules/warehouse-structure/components/position-status-badge";
import { useTireLookup } from "@/modules/warehouse-structure/hooks/use-tire-lookup";
import { TIRE_UNIQUE_ID_LENGTH } from "@/modules/warehouse-structure/types/tire-lookup";

function formatMaybeDate(
  value: string | null,
  format: ReturnType<typeof useFormatter>,
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format.dateTime(date, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function InfoCell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-surface-light-container)] bg-muted/30 px-3 py-2.5 dark:border-[var(--color-surface-container-high)]">
      <p className="text-body-sm text-muted-foreground">{label}</p>
      <div className="mt-1 min-w-0 text-body-md font-semibold text-foreground">{children}</div>
    </div>
  );
}

export function TireUniqueIdLookupCard() {
  const t = useTranslations("warehouseStructure.tireLookup");
  const format = useFormatter();
  const [draft, setDraft] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const digitsOnly = draft.replace(/\D/g, "");
  const isLengthValid =
    digitsOnly.length === 0 || digitsOnly.length === TIRE_UNIQUE_ID_LENGTH;
  const canSearch = digitsOnly.length === TIRE_UNIQUE_ID_LENGTH;

  const query = useTireLookup(submittedId, { enabled: Boolean(submittedId) });

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (!canSearch) return;
    setSubmittedId(digitsOnly);
  }

  const location = query.data?.location ?? null;

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="space-y-2">
          <Label htmlFor="tire-unique-id">{t("uniqueIdLabel")}</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="tire-unique-id"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              placeholder={t("uniqueIdPlaceholder")}
              value={draft}
              maxLength={TIRE_UNIQUE_ID_LENGTH}
              aria-invalid={!isLengthValid}
              onChange={(event) => {
                const next = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, TIRE_UNIQUE_ID_LENGTH);
                setDraft(next);
              }}
              className="font-mono tracking-wide"
            />
            <Button
              type="submit"
              disabled={!canSearch || query.isFetching}
              className="gap-1.5 sm:shrink-0"
            >
              {query.isFetching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              {t("search")}
            </Button>
          </div>
          <FieldHint>{t("uniqueIdHint", { length: TIRE_UNIQUE_ID_LENGTH })}</FieldHint>
          {!isLengthValid ? <FieldError>{t("uniqueIdInvalid")}</FieldError> : null}
        </form>

        {query.isError ? (
          <ErrorAlert
            message={query.error instanceof Error ? query.error.message : t("errorLoading")}
            onRetry={() => void query.refetch()}
            retryLabel={t("retry")}
          />
        ) : null}

        {query.isFetching && !query.data ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : null}

        {query.data ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <InfoCell label={t("fields.tireUniqueId")}>
                <p className="break-all font-mono text-sm">{query.data.tireUniqueId}</p>
              </InfoCell>
              <InfoCell label={t("fields.locationBarcode")}>
                <p className="break-all font-mono text-sm">
                  {location?.locationBarcode || "—"}
                </p>
              </InfoCell>
              <InfoCell label={t("fields.occupancy")}>
                {location?.occupancy ? (
                  <PositionStatusBadge status={location.occupancy} />
                ) : (
                  "—"
                )}
              </InfoCell>
              <InfoCell label={t("fields.positionStatus")}>
                {location?.positionStatus ? (
                  <PositionStatusBadge status={location.positionStatus} />
                ) : (
                  "—"
                )}
              </InfoCell>
              <InfoCell label={t("fields.zoneName")}>
                {location?.zoneName || "—"}
              </InfoCell>
            </div>

            <section className="space-y-2">
              <h3 className="text-label-lg font-semibold text-foreground">
                {t("statusHistoryTitle")}
              </h3>
              <StyledTable
                horizontalScroll
                emptyText={t("emptyStatusHistory")}
                keyProp={(row) => row.id ?? `${row.status}-${row.historyDate ?? ""}`}
                rows={query.data.statusHistory}
                columns={[
                  {
                    header: t("history.historyType"),
                    render: (row) => row.historyType || "—",
                  },
                  {
                    header: t("history.status"),
                    render: (row) => row.status || "—",
                  },
                  {
                    header: t("history.when"),
                    render: (row) => formatMaybeDate(row.historyDate, format),
                  },
                  {
                    header: t("history.notes"),
                    className: "!whitespace-normal max-w-[20rem]",
                    render: (row) => row.notes || "—",
                  },
                ]}
              />
            </section>

            <section className="space-y-2">
              <h3 className="text-label-lg font-semibold text-foreground">
                {t("locationHistoryTitle")}
              </h3>
              <StyledTable
                horizontalScroll
                emptyText={t("emptyLocationHistory")}
                keyProp={(row) => row.id ?? `${row.action}-${row.actionDate ?? ""}`}
                rows={query.data.locationHistory}
                columns={[
                  {
                    header: t("history.action"),
                    render: (row) => (
                      <PositionStatusBadge status={row.action} />
                    ),
                  },
                  {
                    header: t("history.previousLocation"),
                    className: "!whitespace-normal max-w-[14rem]",
                    render: (row) => (
                      <span className="font-mono text-xs">
                        {row.previousLocation || "—"}
                      </span>
                    ),
                  },
                  {
                    header: t("history.newLocation"),
                    className: "!whitespace-normal max-w-[14rem]",
                    render: (row) => (
                      <span className="font-mono text-xs">
                        {row.newLocation || "—"}
                      </span>
                    ),
                  },
                  {
                    header: t("history.when"),
                    render: (row) => formatMaybeDate(row.actionDate, format),
                  },
                  {
                    header: t("history.notes"),
                    className: "!whitespace-normal max-w-[16rem]",
                    render: (row) => row.notes || "—",
                  },
                ]}
              />
            </section>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
