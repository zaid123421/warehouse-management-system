"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { InboundOperationsDashboard } from "@/modules/inbound-sessions/components/inbound-operations-dashboard";
import { InboundSchedulingBoard } from "@/modules/inbound-sessions/components/inbound-scheduling-board";
import { InboundTransitBoard } from "@/modules/inbound-sessions/components/inbound-transit-board";
import { PutawaySessionsTable } from "@/modules/inbound-sessions/components/putaway-sessions-table";
import { ReceivingSessionsTable } from "@/modules/inbound-sessions/components/receiving-sessions-table";
import { useTransitTrucks } from "@/modules/inbound-sessions/hooks/use-transit-trucks";

const TAB_VALUES = new Set([
  "overview",
  "scheduling",
  "transit",
  "receiving",
  "putaway",
]);

export function InboundSessionsPageContent() {
  const t = useTranslations("inboundSessions");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const activeTab =
    tabFromUrl && TAB_VALUES.has(tabFromUrl) ? tabFromUrl : "overview";

  const { data: transitTrucks = [] } = useTransitTrucks();
  const transitCount = transitTrucks.filter((truck) => truck.ready).length;

  function handleOpenPlanning(cellId?: number) {
    if (!cellId) return;
    router.push(ROUTES.DASHBOARD.INBOUND_SESSIONS.TRUCK_PLANNING(cellId));
  }

  function handleTabChange(value: string) {
    const url = new URL(window.location.href);
    if (value === "overview") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", value);
    }
    router.replace(`${url.pathname}${url.search}`, { scroll: false });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-body-md text-muted-foreground">{t("intro")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="min-h-0 flex-1">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="overview">{t("tabOverview")}</TabsTrigger>
          <TabsTrigger value="scheduling">{t("tabScheduling")}</TabsTrigger>
          <TabsTrigger value="transit" className="group flex items-center gap-2">
            {t("tabTransit")}
            {transitCount > 0 && (
              <span className="flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground group-data-[state=active]:bg-primary-foreground group-data-[state=active]:text-primary">
                {transitCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="receiving">{t("tabReceiving")}</TabsTrigger>
          <TabsTrigger value="putaway">{t("tabPutaway")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <InboundOperationsDashboard />
        </TabsContent>
        <TabsContent value="scheduling" className="mt-4">
          <InboundSchedulingBoard onOpenPlanning={handleOpenPlanning} />
        </TabsContent>
        <TabsContent value="transit" className="mt-4">
          <InboundTransitBoard />
        </TabsContent>
        <TabsContent value="receiving" className="mt-4">
          <ReceivingSessionsTable />
        </TabsContent>
        <TabsContent value="putaway" className="mt-4">
          <PutawaySessionsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
