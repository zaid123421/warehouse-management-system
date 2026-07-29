"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InboundOperationsDashboard } from "@/modules/inbound-sessions/components/inbound-operations-dashboard";
import { InboundRequestsTable } from "@/modules/inbound-sessions/components/inbound-requests-table";
import { InboundSchedulingBoard } from "@/modules/inbound-sessions/components/inbound-scheduling-board";
import { PutawaySessionsTable } from "@/modules/inbound-sessions/components/putaway-sessions-table";
import { ReceivingSessionsTable } from "@/modules/inbound-sessions/components/receiving-sessions-table";

export function InboundSessionsPageContent() {
  const t = useTranslations("inboundSessions");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-body-md text-muted-foreground">{t("intro")}</p>
      </div>

      <Tabs defaultValue="overview" className="min-h-0 flex-1">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="overview">{t("tabOverview")}</TabsTrigger>
          <TabsTrigger value="scheduling">{t("tabScheduling")}</TabsTrigger>
          <TabsTrigger value="requests">{t("tabRequests")}</TabsTrigger>
          <TabsTrigger value="receiving">{t("tabReceiving")}</TabsTrigger>
          <TabsTrigger value="putaway">{t("tabPutaway")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <InboundOperationsDashboard />
        </TabsContent>
        <TabsContent value="scheduling" className="mt-4">
          <InboundSchedulingBoard />
        </TabsContent>
        <TabsContent value="requests" className="mt-4">
          <InboundRequestsTable />
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
