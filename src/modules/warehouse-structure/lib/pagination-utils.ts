import type { PageableMeta } from "@/modules/warehouse-structure/types/warehouse-visualization";

export function getPaginationState(pageable: PageableMeta) {
  const totalPages = Math.max(1, Math.ceil(pageable.total / Math.max(pageable.perPage, 1)));
  return {
    totalPages,
    canPrevious: pageable.page > 0,
    canNext: pageable.page + 1 < totalPages,
    currentPage: pageable.page + 1,
  };
}
