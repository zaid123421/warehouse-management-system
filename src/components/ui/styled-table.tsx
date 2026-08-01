"use client";

import React from "react";
import { ChevronDown, ChevronRight, Inbox } from "lucide-react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Column<T> = {
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
};

interface StyledTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyProp: (row: T) => number | string;
  isLoading?: boolean;
  emptyText?: string;
  emptyIcon?: React.ReactNode;
  /** Enable horizontal scroll when columns exceed container width. */
  horizontalScroll?: boolean;
  className?: string;
  /** Render expandable content below the row */
  renderExpanded?: (row: T) => React.ReactNode;
}

export function StyledTable<T>({
  columns,
  rows,
  keyProp,
  isLoading = false,
  emptyText = "No items",
  emptyIcon,
  horizontalScroll = false,
  className,
  renderExpanded,
}: StyledTableProps<T>) {
  const [expandedRows, setExpandedRows] = React.useState<Set<string | number>>(new Set());
  const borderColor = "border-black/5 dark:border-white/5";

  function toggleExpand(key: string | number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div
      className={`rounded-xl border ${borderColor} bg-card ${horizontalScroll ? "overflow-x-auto" : "overflow-hidden"} ${isLoading ? "opacity-70" : ""} ${className ?? ""}`}
    >
      <table
        className={`w-full border-separate border-spacing-0 ${horizontalScroll ? "min-w-[44rem]" : ""}`}
      >
        <TableHeader>
          <TableRow className="border-0 hover:bg-transparent">
            {renderExpanded && (
              <TableHead className={`w-10 bg-[var(--color-surface-light-container)] dark:bg-[var(--color-surface-container-high)] border-b ${borderColor} rounded-ss-xl`} />
            )}
            {columns.map((col, idx) => (
              <TableHead
                key={idx}
                className={`${col.className ?? ""} ${
                  col.align === "right" ? "text-right" :
                  col.align === "left" ? "text-left" : "text-center"
                } bg-[var(--color-surface-light-container)] dark:bg-[var(--color-surface-container-high)] text-foreground text-body-sm font-semibold tracking-wide py-4 px-4 border-b ${borderColor} ${
                  horizontalScroll ? "whitespace-nowrap" : ""
                } ${
                  idx === 0 && !renderExpanded ? "rounded-ss-xl" : ""
                } ${idx === columns.length - 1 ? "rounded-se-xl" : ""}`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className={`text-body-md text-muted-foreground h-32 text-center border-b rounded-es-xl rounded-ee-xl ${borderColor}`}
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-48 text-center rounded-es-xl rounded-ee-xl align-middle"
              >
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  {emptyIcon ?? <Inbox className="mb-3 size-10 opacity-40" />}
                  <span className="text-body-md font-medium">{emptyText}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, rowIndex) => {
              const rowKey = keyProp(row);
              const isExpanded = expandedRows.has(rowKey);
              const isLastRow = rowIndex === rows.length - 1;
              const hasBorder = !isLastRow || isExpanded;
              
              return (
                <React.Fragment key={String(rowKey)}>
                  <TableRow
                    className={`border-0 hover:bg-[var(--color-surface-light)] dark:hover:bg-[var(--color-surface-bright)]/10 transition-colors ${
                      hasBorder && !isExpanded ? "border-b " + borderColor : ""
                    }`}
                  >
                    {renderExpanded && (
                      <TableCell 
                        className={`w-10 px-2 py-3 align-middle ${hasBorder && !isExpanded ? "border-b " + borderColor : ""} ${isLastRow && !isExpanded ? "rounded-es-xl" : ""}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleExpand(rowKey)}
                          className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </button>
                      </TableCell>
                    )}
                    {columns.map((col, ci) => (
                      <TableCell
                        key={ci}
                        className={`${col.className ?? ""} ${
                          col.align === "right" ? "text-right" :
                          col.align === "left" ? "text-left" : "text-center"
                        } text-foreground py-4 px-4 align-middle text-sm ${
                          horizontalScroll ? "whitespace-nowrap" : ""
                        } ${
                          hasBorder && !isExpanded ? "border-b " + borderColor : ""
                        } ${
                          isLastRow && !renderExpanded && ci === 0 && !isExpanded ? "rounded-es-xl" : ""
                        } ${isLastRow && ci === columns.length - 1 && !isExpanded ? "rounded-ee-xl" : ""}`}
                      >
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                  {renderExpanded && isExpanded && (
                    <TableRow className={`border-0 bg-[var(--color-surface-container)] dark:bg-[var(--color-surface-container)] ${!isLastRow ? "border-b border-black/5 dark:border-white/5" : ""}`}>
                      <TableCell 
                        colSpan={columns.length + 1} 
                        className={`p-0 border-l-[3px] border-primary ${isLastRow ? "rounded-es-xl rounded-ee-xl" : ""}`}
                      >
                        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                          {renderExpanded(row)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </table>
    </div>
  );
}

export default StyledTable;
