import { notFound } from "next/navigation";
import { OutboundTruckPlanningPageContent } from "@/modules/outbound-sessions/components/outbound-truck-planning-page-content";

type PageProps = {
  params: Promise<{ cellId: string }>;
};

export default async function OutboundTruckPlanningPage({ params }: PageProps) {
  const { cellId } = await params;
  const id = Number(cellId);
  if (!Number.isFinite(id) || id <= 0) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <OutboundTruckPlanningPageContent schedulingCellId={id} />
    </div>
  );
}
