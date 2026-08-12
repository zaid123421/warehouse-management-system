"use client";

import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AssignedStaffRowProps = {
  names: string[];
  notAssignedLabel: string;
  assignedLabel: string;
  /** @deprecated Kept for call-site compatibility; assign is one-time only. */
  addStaffLabel?: string;
  /** Label when nobody assigned yet. */
  assignLabel: string;
  canAssign: boolean;
  onAssign: () => void;
  className?: string;
};

export function AssignedStaffRow({
  names,
  notAssignedLabel,
  assignedLabel,
  assignLabel,
  canAssign,
  onAssign,
  className,
}: AssignedStaffRowProps) {
  const hasStaff = names.length > 0;
  // Staff assignment is one-time: hide the button after the first successful assign.
  const showAssignButton = canAssign && !hasStaff;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex size-7 shrink-0 items-center justify-center rounded-full",
            hasStaff ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          <Users className="size-3.5" />
        </span>
        {hasStaff ? (
          <div className="min-w-0">
            <p className="text-body-sm text-muted-foreground">{assignedLabel}</p>
            <div className="mt-0.5 flex flex-wrap gap-1.5">
              {names.map((name) => (
                <span
                  key={name}
                  className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-body-sm font-medium text-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-body-sm text-muted-foreground">{notAssignedLabel}</p>
        )}
      </div>
      {showAssignButton ? (
        <Button type="button" size="sm" variant="outline" onClick={onAssign}>
          <UserPlus className="size-4" />
          {assignLabel}
        </Button>
      ) : null}
    </div>
  );
}
