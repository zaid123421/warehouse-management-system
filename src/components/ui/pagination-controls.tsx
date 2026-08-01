"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationControlsProps) {
  const t = useTranslations("common");

  return (
    <div className={`flex items-center justify-center gap-4 mt-6 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        className="size-8 rounded-full border-black/10 dark:border-white/10 bg-card"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label={t?.("previousPage") ?? "Previous page"}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-body-sm font-medium text-foreground bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-md">
        {currentPage} <span className="text-muted-foreground mx-1">of</span> {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="size-8 rounded-full border-black/10 dark:border-white/10 bg-card"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label={t?.("nextPage") ?? "Next page"}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
