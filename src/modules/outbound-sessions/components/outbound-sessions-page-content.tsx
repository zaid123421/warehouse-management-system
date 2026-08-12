"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { OutboundReadyToShipBoard } from "@/modules/outbound-sessions/components/outbound-ready-to-ship-board";
import { OutboundSchedulingBoard } from "@/modules/outbound-sessions/components/outbound-scheduling-board";
import { PickingSessionsTable } from "@/modules/outbound-sessions/components/picking-sessions-table";
import { ShippingSessionsBoard } from "@/modules/outbound-sessions/components/shipping-sessions-board";
import { useReadyToShipTrucks } from "@/modules/outbound-sessions/hooks/use-ready-to-ship-trucks";

const TAB_VALUES = new Set(["scheduling", "ready-to-ship", "picking", "shipping"]);

export function OutboundSessionsPageContent() {
  const t = useTranslations("outboundSessions");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const activeTab =
    tabFromUrl && TAB_VALUES.has(tabFromUrl) ? tabFromUrl : "scheduling";

  const { data: readyTrucks = [] } = useReadyToShipTrucks();
  const readyCount = readyTrucks.filter((truck) => truck.ready).length;

  function handleOpenPlanning(cellId?: number) {
    if (!cellId) return;
    router.push(ROUTES.DASHBOARD.OUTBOUND_SESSIONS.TRUCK_PLANNING(cellId));
  }

  function handleTabChange(value: string) {
    const url = new URL(window.location.href);
    if (value === "scheduling") {
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
          <TabsTrigger value="scheduling">{t("tabScheduling")}</TabsTrigger>
          <TabsTrigger value="picking">{t("tabPicking")}</TabsTrigger>
          <TabsTrigger value="ready-to-ship" className="group flex items-center gap-2">
            {t("tabReadyToShip")}
            {readyCount > 0 && (
              <span className="flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground group-data-[state=active]:bg-primary-foreground group-data-[state=active]:text-primary">
                {readyCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="shipping">{t("tabShipping")}</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduling" className="mt-4">
          <OutboundSchedulingBoard onOpenPlanning={handleOpenPlanning} />
        </TabsContent>
        <TabsContent value="picking" className="mt-4">
          <PickingSessionsTable />
        </TabsContent>
        <TabsContent value="ready-to-ship" className="mt-4">
          <OutboundReadyToShipBoard />
        </TabsContent>
        <TabsContent value="shipping" className="mt-4">
          <ShippingSessionsBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
