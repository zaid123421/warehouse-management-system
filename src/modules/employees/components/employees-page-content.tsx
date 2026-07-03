"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorAlert } from "@/components/ui/error-alert";
import { StyledTable } from "@/components/ui/styled-table";
import { PRIMARY_BUTTON_CLASS, PRIMARY_BUTTON_RESPONSIVE } from "@/lib/primary-button-styles";
import { cn } from "@/lib/utils";
import { AddEmployeeModal } from "@/modules/employees/components/add-employee-modal";
import { EditEmployeeModal } from "@/modules/employees/components/edit-employee-modal";
import { EmployeeDeleteModal } from "@/modules/employees/components/employee-delete-modal";
import { EmployeeStatusModal } from "@/modules/employees/components/employee-status-modal";
import { EmployeeAvatar } from "@/modules/employees/components/employee-avatar";
import { EmployeeStatusBadge } from "@/modules/employees/components/employee-status-badge";
import { useWarehouseStaff } from "@/modules/employees/hooks/use-warehouse-staff";
import { staffFullName } from "@/modules/employees/lib/warehouse-staff-dto";
import {
  filterStaffBySearch,
  filterStaffByStatus,
  formatRelativeTime,
  type StaffStatusFilter,
} from "@/modules/employees/lib/staff-list-utils";
import type { WarehouseStaffAssignment } from "@/modules/employees/types/warehouse-staff";

export function EmployeesPageContent() {
  const t = useTranslations("employees");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StaffStatusFilter>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<WarehouseStaffAssignment | null>(null);

  const { data: allStaff = [], isPending, isError, error, refetch } = useWarehouseStaff();

  const filteredStaff = useMemo(() => {
    const searched = filterStaffBySearch(allStaff, search);
    return filterStaffByStatus(searched, statusFilter);
  }, [allStaff, search, statusFilter]);

  const hasActiveSearch = search.trim().length > 0;
  const emptyText =
    hasActiveSearch && allStaff.length > 0 ? t("noSearchResults") : t("noEmployees");

  function openEditModal(row: WarehouseStaffAssignment) {
    setSelectedStaff(row);
    setEditModalOpen(true);
  }

  function openStatusModal(row: WarehouseStaffAssignment) {
    setSelectedStaff(row);
    setStatusModalOpen(true);
  }

  function openDeleteModal(row: WarehouseStaffAssignment) {
    setSelectedStaff(row);
    setDeleteModalOpen(true);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-body-md text-muted-foreground">{t("intro")}</p>
        </div>
        <Button
          type="button"
          className={cn("shrink-0", PRIMARY_BUTTON_CLASS, PRIMARY_BUTTON_RESPONSIVE)}
          onClick={() => setAddModalOpen(true)}
        >
          <Plus className="size-4" />
          {t("addEmployee")}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-9"
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StaffStatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t("filterStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAllStatuses")}</SelectItem>
            <SelectItem value="active">{t("statusActive")}</SelectItem>
            <SelectItem value="inactive">{t("statusInactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={t("retry")}
        />
      ) : null}

      <StyledTable
        isLoading={isPending}
        rows={filteredStaff}
        keyProp={(row) => row.assignmentId}
        emptyText={emptyText}
        columns={[
          {
            header: t("columnEmployee"),
            render: (row) => (
              <div className="flex items-center gap-3">
                <EmployeeAvatar row={row} />
                <span className="font-medium">{staffFullName(row)}</span>
              </div>
            ),
          },
          {
            header: t("columnEmail"),
            render: (row) => (
              <span className="max-w-[180px] truncate font-mono text-sm" title={row.user.email}>
                {row.user.email || "—"}
              </span>
            ),
          },
          {
            header: t("columnRole"),
            render: (row) => row.user.role.name || "—",
          },
          {
            header: t("columnStatus"),
            render: (row) => (
              <button
                type="button"
                onClick={() => openStatusModal(row)}
                className="cursor-pointer rounded-full transition-opacity hover:opacity-80"
                aria-label={t("changeStatusTitle")}
              >
                <EmployeeStatusBadge active={row.user.active} />
              </button>
            ),
          },
          {
            header: t("columnAssignedSessions"),
            render: () => <span className="text-muted-foreground">—</span>,
          },
          {
            header: t("columnLastActive"),
            render: (row) => (
              <span className="text-muted-foreground">
                {formatRelativeTime(row.user.updatedAt)}
              </span>
            ),
          },
          {
            header: t("columnActions"),
            className: "min-w-[220px]",
            render: (row) => (
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-primary-dark/40 text-primary-dark hover:bg-primary-dark hover:text-white"
                  onClick={() => openEditModal(row)}
                >
                  <Pencil className="size-3.5" />
                  {t("edit")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => openDeleteModal(row)}
                >
                  <Trash2 className="size-3.5" />
                  {t("delete")}
                </Button>
              </div>
            ),
          },
        ]}
      />

      <AddEmployeeModal open={addModalOpen} onOpenChange={setAddModalOpen} />

      <EditEmployeeModal
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open && !statusModalOpen && !deleteModalOpen) setSelectedStaff(null);
        }}
        staffToEdit={editModalOpen ? selectedStaff : null}
      />

      <EmployeeStatusModal
        open={statusModalOpen}
        onOpenChange={(open) => {
          setStatusModalOpen(open);
          if (!open && !editModalOpen && !deleteModalOpen) setSelectedStaff(null);
        }}
        staff={statusModalOpen ? selectedStaff : null}
      />

      <EmployeeDeleteModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open && !editModalOpen && !statusModalOpen) setSelectedStaff(null);
        }}
        staff={deleteModalOpen ? selectedStaff : null}
      />
    </div>
  );
}
