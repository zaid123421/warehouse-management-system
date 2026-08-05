"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** Reads `?highlight=<id>` from the URL for session/truck card focus. */
export function useHighlightId(param = "highlight"): number | null {
  const searchParams = useSearchParams();
  const raw = searchParams.get(param);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** Scroll the highlighted card into view once. */
export function useScrollToHighlight(highlightId: number | null, attr = "data-highlight-id") {
  useEffect(() => {
    if (!highlightId) return;
    const el = document.querySelector(`[${attr}="${highlightId}"]`);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, attr]);
}

export function buildTabHighlightHref(
  listPath: string,
  tab: string,
  highlightId: number,
): string {
  return `${listPath}?tab=${encodeURIComponent(tab)}&highlight=${highlightId}`;
}
