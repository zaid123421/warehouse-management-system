import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WarehouseSceneDynamic } from "@/shared/components/3d/warehouse-scene-dynamic";
import { WarehouseZoneLegend } from "@/shared/components/3d/warehouse-zone-legend";

export default async function InventoryPage() {
  const t = await getTranslations("dashboard");
  return (
    <div className="space-y-4 break-words">
      <h1 className="text-headline-sm font-bold text-foreground">
        {t("inventoryTitle")}
      </h1>
      <p className="text-body-md text-muted-foreground">{t("inventoryIntro")}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t("inventoryRackPreview")}</CardTitle>
          <CardDescription>
            {t("inventoryRackPreviewDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1">
              <WarehouseSceneDynamic />
            </div>
            <WarehouseZoneLegend className="lg:max-w-xs lg:shrink-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
