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
    <div className="p-4 bg-card rounded-lg m-4 border shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-label-md font-semibold text-foreground">
          {t("requestTireSetsTitle", { id: requestId })}
        </h4>
        <span className="text-body-sm text-muted-foreground">
          {data.receivedTireCount} / {data.expectedTireCount} {t("tiresReceived")}
        </span>
      </div>

      {data.lines.length === 0 ? (
        <p className="text-body-sm text-muted-foreground text-center py-4">
          {t("noTiresInRequest")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 font-medium">{t("columnTireId")}</th>
                <th className="pb-2 font-medium">{t("columnLocation")}</th>
                <th className="pb-2 font-medium">{t("columnStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y text-foreground">
              {data.lines.map((line: InboundRequestLine) => (
                <tr key={line.id} className="group">
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <span className="font-medium bg-muted px-2 py-0.5 rounded-md text-xs">
                      {line.tireUniqueId || `#${line.id}`}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 whitespace-nowrap text-muted-foreground">
                    {line.reservedPositionBarcode || "—"}
                  </td>
                  <td className="py-2.5">
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
