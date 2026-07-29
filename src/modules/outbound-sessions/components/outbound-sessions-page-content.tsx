"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OutboundSchedulingBoard } from "@/modules/outbound-sessions/components/outbound-scheduling-board";
import { PickingSessionsTable } from "@/modules/outbound-sessions/components/picking-sessions-table";
import { ShippingSessionsBoard } from "@/modules/outbound-sessions/components/shipping-sessions-board";

export function OutboundSessionsPageContent() {
  const t = useTranslations("outboundSessions");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-body-md text-muted-foreground">{t("intro")}</p>
      </div>

      <Tabs defaultValue="scheduling" className="min-h-0 flex-1">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="scheduling">{t("tabScheduling")}</TabsTrigger>
          <TabsTrigger value="picking">{t("tabPicking")}</TabsTrigger>
          <TabsTrigger value="shipping">{t("tabShipping")}</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduling" className="mt-4">
          <OutboundSchedulingBoard />
        </TabsContent>
        <TabsContent value="picking" className="mt-4">
          <PickingSessionsTable />
        </TabsContent>
        <TabsContent value="shipping" className="mt-4">
          <ShippingSessionsBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
