"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

type SessionModeProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Session-table mode markers — mutually exclusive with labeled mode */
  canPrevious?: never;
  canNext?: never;
  previousLabel?: never;
  nextLabel?: never;
  pageText?: never;
  onPrevious?: never;
  onNext?: never;
};

type LabeledModeProps = {
  canPrevious: boolean;
  canNext: boolean;
  previousLabel: string;
  nextLabel: string;
  pageLabel?: string;
  pageText: string;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
  currentPage?: never;
  totalPages?: never;
  onPageChange?: never;
};

type PaginationControlsProps = SessionModeProps | LabeledModeProps;

function isLabeledMode(props: PaginationControlsProps): props is LabeledModeProps {
  return typeof (props as LabeledModeProps).onPrevious === "function";
}

export function PaginationControls(props: PaginationControlsProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  if (isLabeledMode(props)) {
    const {
      canPrevious,
      canNext,
      previousLabel,
      nextLabel,
      pageLabel,
      pageText,
      onPrevious,
      onNext,
      className = "",
    } = props;

    return (
      <div
        className={`flex items-center justify-center gap-4 mt-6 ${className}`}
        aria-label={pageLabel}
      >
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-full border-black/10 dark:border-white/10 bg-card"
          onClick={onPrevious}
          disabled={!canPrevious}
          aria-label={previousLabel}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-body-sm font-medium text-foreground bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-md">
          {pageText}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-full border-black/10 dark:border-white/10 bg-card"
          onClick={onNext}
          disabled={!canNext}
          aria-label={nextLabel}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    );
  }

  const { currentPage, totalPages, onPageChange, className = "" } = props;
  const previousLabel = isAr ? "الصفحة السابقة" : "Previous page";
  const nextLabel = isAr ? "الصفحة التالية" : "Next page";
  const pageText = isAr
    ? `${currentPage} من ${totalPages}`
    : `${currentPage} of ${totalPages}`;

  return (
    <div className={`flex items-center justify-center gap-4 mt-6 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        className="size-8 rounded-full border-black/10 dark:border-white/10 bg-card"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label={previousLabel}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-body-sm font-medium text-foreground bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-md">
        {pageText}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="size-8 rounded-full border-black/10 dark:border-white/10 bg-card"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label={nextLabel}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
