import { notFound } from "next/navigation";
import { TruckPlanningPageContent } from "@/modules/inbound-sessions/components/truck-planning-page-content";

type PageProps = {
  params: Promise<{ cellId: string }>;
};

export default async function TruckPlanningPage({ params }: PageProps) {
  const { cellId } = await params;
  const id = Number(cellId);
  if (!Number.isFinite(id) || id <= 0) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TruckPlanningPageContent schedulingCellId={id} />
    </div>
  );
}
