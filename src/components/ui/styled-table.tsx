"use client";

import React from "react";
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
  /** Enable horizontal scroll when columns exceed container width. */
  horizontalScroll?: boolean;
  className?: string;
}

export function StyledTable<T>({
  columns,
  rows,
  keyProp,
  isLoading = false,
  emptyText = "No items",
  horizontalScroll = false,
  className,
}: StyledTableProps<T>) {
  const borderColor = "border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]";

  return (
    <div
      className={`rounded-xl border-2 ${borderColor} bg-card ${horizontalScroll ? "overflow-x-auto" : "overflow-hidden"} ${isLoading ? "opacity-70" : ""} ${className ?? ""}`}
    >
      <table
        className={`w-full border-separate border-spacing-0 ${horizontalScroll ? "min-w-[44rem]" : ""}`}
      >
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col, idx) => (
              <TableHead
                key={idx}
                className={`${col.className ?? ""} ${
                  col.align === "right" ? "text-right" :
                  col.align === "left" ? "text-left" : "text-center"
                } bg-[var(--color-surface-light-container)] dark:bg-[var(--color-surface-container-high)] text-foreground text-body-sm font-semibold tracking-wide py-3 px-4 border-b-2 ${borderColor} ${
                  horizontalScroll ? "whitespace-nowrap" : ""
                } ${
                  idx === 0 ? "rounded-ss-xl" : ""
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
                className={`text-body-md text-muted-foreground h-32 text-center border-b-2 rounded-es-xl rounded-ee-xl ${borderColor}`}
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-body-md text-muted-foreground h-32 text-center rounded-es-xl rounded-ee-xl"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, rowIndex) => (
              <TableRow
                key={String(keyProp(row))}
                className={`hover:bg-[var(--color-surface-light)] dark:hover:bg-[var(--color-surface-bright)]/10 transition-colors ${
                  rowIndex === rows.length - 1 ? "" : "border-b-2 " + borderColor
                }`}
              >
                {columns.map((col, ci) => (
                  <TableCell
                    key={ci}
                    className={`${col.className ?? ""} ${
                      col.align === "right" ? "text-right" :
                      col.align === "left" ? "text-left" : "text-center"
                    } text-foreground py-3 px-4 align-middle text-sm ${
                      horizontalScroll ? "whitespace-nowrap" : ""
                    } ${
                      rowIndex === rows.length - 1 ? "" : "border-b-2 " + borderColor
                    } ${
                      rowIndex === rows.length - 1 && ci === 0 ? "rounded-es-xl" : ""
                    } ${rowIndex === rows.length - 1 && ci === columns.length - 1 ? "rounded-ee-xl" : ""}`}
                  >
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </table>
    </div>
  );
}

export default StyledTable;
