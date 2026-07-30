import { Suspense } from "react";
import { InboundSessionsPageContent } from "@/modules/inbound-sessions/components/inbound-sessions-page-content";

export default function InboundSessionsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={null}>
        <InboundSessionsPageContent />
      </Suspense>
    </div>
  );
}
