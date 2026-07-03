/** Shared typography classes for warehouse visualization UI. */
export const vizTypography = {
  columnHeading:
    "text-label-sm font-semibold uppercase tracking-[0.12em] text-primary-dark/85",
  panelTitle: "text-title-lg font-bold leading-tight tracking-tight text-foreground",
  panelSubtitle: "text-body-sm font-normal text-muted-foreground",
  sectionTitle: "text-title-md font-semibold text-foreground",
  breadcrumbMuted: "text-label-md font-normal text-muted-foreground",
  breadcrumbActive: "text-label-md font-semibold text-foreground",
  listTitleEmphasis: "truncate text-title-md font-bold leading-snug text-foreground",
  listTitleDefault: "truncate text-body-md font-semibold leading-snug text-foreground",
  listSubtitle: "mt-0.5 line-clamp-2 text-body-sm font-normal text-muted-foreground",
  metaBadge:
    "inline-flex rounded-md bg-muted/70 px-2 py-0.5 text-label-sm font-medium tabular-nums text-muted-foreground",
  statLabel: "text-label-sm font-medium uppercase tracking-wide text-muted-foreground",
  statValueHighlight: "mt-1 text-title-lg font-bold tabular-nums text-primary-dark",
  statValueDefault: "mt-1 text-body-md font-semibold tabular-nums text-foreground",
  statValueMuted: "mt-1 text-body-sm font-medium tabular-nums text-muted-foreground",
  progressLabel: "text-label-md font-normal text-muted-foreground",
  progressValue: "text-label-md font-bold tabular-nums text-primary-dark",
  hint: "text-center text-body-sm font-normal italic text-muted-foreground",
  empty: "text-body-sm font-normal text-muted-foreground",
  tablePrimary: "text-body-md font-medium text-foreground",
  tableMono: "font-mono text-label-md text-muted-foreground",
  tableMuted: "text-body-sm text-muted-foreground",
} as const;

export const VIZ_STAT_EMPHASIS = {
  total: "highlight",
  occupied: "highlight",
  empty: "default",
  reservedInbound: "muted",
  reservedOutbound: "muted",
} as const;

export type VizStatEmphasis = (typeof VIZ_STAT_EMPHASIS)[keyof typeof VIZ_STAT_EMPHASIS];

export function vizStatValueClass(key: keyof typeof VIZ_STAT_EMPHASIS): string {
  const emphasis = VIZ_STAT_EMPHASIS[key];
  if (emphasis === "highlight") return vizTypography.statValueHighlight;
  if (emphasis === "muted") return vizTypography.statValueMuted;
  return vizTypography.statValueDefault;
}
