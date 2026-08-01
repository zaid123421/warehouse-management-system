import { Suspense } from "react";
import { OutboundSessionsPageContent } from "@/modules/outbound-sessions/components/outbound-sessions-page-content";

export default function OutboundSessionsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={null}>
        <OutboundSessionsPageContent />
      </Suspense>
    </div>
  );
}
