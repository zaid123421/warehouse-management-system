import { notFound } from "next/navigation";
import { ReceivingSessionDetailContent } from "@/modules/inbound-sessions/components/receiving-session-detail-content";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function ReceivingSessionDetailPage({ params }: PageProps) {
  const { sessionId } = await params;
  const id = Number(sessionId);
  if (!Number.isFinite(id) || id <= 0) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ReceivingSessionDetailContent sessionId={id} />
    </div>
  );
}
