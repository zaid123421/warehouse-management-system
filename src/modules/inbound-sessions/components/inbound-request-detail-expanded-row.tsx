"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import TokenService from "@/infrastructure/auth/token-service";
import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { SessionStatusBadge } from "./shared/session-status-badge";

type InboundRequestLine = {
  id: number;
  tireUniqueId?: string;
  reservedPositionBarcode?: string;
  status: string;
};

type InboundRequestDetail = {
  id: number;
  expectedTireCount: number;
  receivedTireCount: number;
  lines: InboundRequestLine[];
};

export function InboundRequestDetailExpandedRow({ requestId }: { requestId: number }) {
  const t = useTranslations("inboundSessions");
  
  const { data, isPending, isError } = useQuery({
    queryKey: ["inboundRequest", requestId],
    queryFn: async () => {
      const res = await api.get<{ data: InboundRequestDetail }>(ENDPOINTS.WMS_INBOUND_REQUESTS.BY_ID(requestId));
      return res.data?.data || res.data;
    },
    enabled: Boolean(TokenService.getAccessToken()) && requestId > 0,
    staleTime: 60_000,
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        <span className="text-body-sm">{t("loadingDetails")}</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 text-center text-sm text-destructive">
        {t("errorLoadingDetails")}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-[var(--color-surface-container)] rounded-lg m-3 sm:m-4 border border-black/5 dark:border-white/5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-body-md font-bold text-primary flex items-center gap-2">
          {t("requestTireSetsTitle", { id: requestId })}
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-body-sm text-muted-foreground uppercase tracking-wide font-medium">
            {t("tiresReceived")} <span className="text-foreground ml-1">{data.receivedTireCount} / {data.expectedTireCount}</span>
          </span>
        </div>
      </div>

      {data.lines.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)] p-6 text-center text-muted-foreground">
          {t("noTiresInRequest")}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 text-muted-foreground">
                <th className="py-3 px-4 font-semibold tracking-wide">{t("columnTireId")}</th>
                <th className="py-3 px-4 font-semibold tracking-wide">{t("columnLocation")}</th>
                <th className="py-3 px-4 font-semibold tracking-wide text-right">{t("columnStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-foreground">
              {data.lines.map((line: InboundRequestLine) => (
                <tr key={line.id} className="group hover:bg-[var(--color-surface-light)] dark:hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
                      <span className="font-mono font-medium tracking-tight text-foreground">
                        {line.tireUniqueId || `#${line.id}`}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground font-medium">
                    {line.reservedPositionBarcode || "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <SessionStatusBadge status={line.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
