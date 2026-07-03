"use client";

import { useTranslations } from "next-intl";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getPaginationState } from "@/modules/warehouse-structure/lib/pagination-utils";
import type { PageableMeta } from "@/modules/warehouse-structure/types/warehouse-visualization";

export type VisualizationPaginationProps = {
  pageable: PageableMeta;
  onPageChange: (page: number) => void;
  className?: string;
};

export function VisualizationPagination({
  pageable,
  onPageChange,
  className,
}: VisualizationPaginationProps) {
  const t = useTranslations("warehouseStructure.viz");
  const { canPrevious, canNext, currentPage, totalPages } = getPaginationState(pageable);

  if (pageable.total <= pageable.perPage) return null;

  return (
    <PaginationControls
      className={className}
      canPrevious={canPrevious}
      canNext={canNext}
      previousLabel={t("paginationPrev")}
      nextLabel={t("paginationNext")}
      pageLabel={t("paginationLabel")}
      pageText={t("pageInfo", { current: currentPage, total: totalPages })}
      onPrevious={() => onPageChange(pageable.page - 1)}
      onNext={() => onPageChange(pageable.page + 1)}
    />
  );
}
