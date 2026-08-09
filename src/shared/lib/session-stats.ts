export type SessionListStats = {
  pendingApproval: number;
  inProgress: number;
  completed: number;
  completedToday: number;
};

function isCompletedToday(completedAt?: string): boolean {
  if (!completedAt) return false;
  return new Date(completedAt).toDateString() === new Date().toDateString();
}

/** Counts derived only from session status (+ optional completedAt). */
export function computeSessionListStats(
  sessions: { status: string; completedAt?: string }[],
): SessionListStats {
  return {
    pendingApproval: sessions.filter((s) => s.status === "PENDING_APPROVAL").length,
    inProgress: sessions.filter((s) => s.status === "IN_PROGRESS").length,
    completed: sessions.filter((s) => s.status === "COMPLETED").length,
    completedToday: sessions.filter(
      (s) => s.status === "COMPLETED" && isCompletedToday(s.completedAt),
    ).length,
  };
}
