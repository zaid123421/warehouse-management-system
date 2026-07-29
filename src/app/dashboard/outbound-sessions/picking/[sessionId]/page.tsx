import { notFound } from "next/navigation";
import { PickingSessionDetailContent } from "@/modules/outbound-sessions/components/picking-session-detail-content";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function PickingSessionDetailPage({ params }: PageProps) {
  const { sessionId } = await params;
  const id = Number(sessionId);
  if (!Number.isFinite(id) || id <= 0) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PickingSessionDetailContent sessionId={id} />
    </div>
  );
}
