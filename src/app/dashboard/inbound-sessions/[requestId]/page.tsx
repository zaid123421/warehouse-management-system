import { notFound } from "next/navigation";
import { InboundRequestDetailContent } from "@/modules/inbound-sessions/components/inbound-request-detail-content";

type PageProps = {
  params: Promise<{ requestId: string }>;
};

export default async function InboundRequestDetailPage({ params }: PageProps) {
  const { requestId } = await params;
  const id = Number(requestId);
  if (!Number.isFinite(id) || id <= 0) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <InboundRequestDetailContent requestId={id} />
    </div>
  );
}
