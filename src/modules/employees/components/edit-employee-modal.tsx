"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmployeeFieldLabel } from "@/modules/employees/components/employee-field-label";
import { cn } from "@/lib/utils";
import { DIALOG_SHELL_CLASS } from "@/lib/radius";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import {
  FIELD_ERROR_MESSAGE_CLASS,
  FIELD_INVALID_BORDER_CLASS,
} from "@/lib/field-validation";
import { useUpdateStaff } from "@/modules/employees/hooks/use-update-staff";
import { useStaffDetail } from "@/modules/employees/hooks/use-staff-detail";
import type { WarehouseStaffAssignment } from "@/modules/employees/types/warehouse-staff";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  position: string;
};

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  position: "",
};

function assignmentToForm(row: WarehouseStaffAssignment): FormState {
  return {
    firstName: row.user.firstName ?? "",
    lastName: row.user.lastName ?? "",
    email: row.user.email ?? "",
    password: "",
    position: row.user.position ?? "",
  };
}

export type EditEmployeeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffToEdit: WarehouseStaffAssignment | null;
};

export function EditEmployeeModal({ open, onOpenChange, staffToEdit }: EditEmployeeModalProps) {
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const updateStaff = useUpdateStaff();
  const userId = staffToEdit?.user.id ?? null;
  const detailQuery = useStaffDetail(userId, open && staffToEdit != null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const formLocked = updateStaff.isPending || detailQuery.isPending;

  useEffect(() => {
    if (!open || !staffToEdit) return;
    setForm(assignmentToForm(staffToEdit));
    setFieldErrors({});
    setShowPassword(false);
  }, [open, staffToEdit]);

  useEffect(() => {
    if (!open || !detailQuery.data) return;
    setForm(assignmentToForm(detailQuery.data));
  }, [open, detailQuery.data]);

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = t("validationFirstNameRequired");
    if (!form.lastName.trim()) errors.lastName = t("validationLastNameRequired");
    if (!form.email.trim()) errors.email = t("validationEmailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = t("validationEmailInvalid");
    }
    if (form.password.trim() && form.password.trim().length < 8) {
      errors.password = t("validationPasswordMin");
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || userId == null) return;

    try {
      await updateStaff.mutateAsync({
        userId,
        payload: {
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          position: form.position.trim(),
          ...(form.password.trim() ? { password: form.password.trim() } : {}),
        },
      });
      toast.success(t("updateSuccess"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("saveError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(DIALOG_SHELL_CLASS, "max-w-md gap-0 overflow-hidden p-0")}>
        <DialogHeader className="p-6 pb-4 text-start">
          <DialogTitle>{t("editEmployee")}</DialogTitle>
        </DialogHeader>

        <form id="edit-employee-form" onSubmit={handleSubmit} className="space-y-4 px-6 pb-2">
          <div className="space-y-2">
            <EmployeeFieldLabel htmlFor="edit-first-name" required>
              {t("firstNameLabel")}
            </EmployeeFieldLabel>
            <Input
              id="edit-first-name"
              value={form.firstName}
              disabled={formLocked}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              placeholder={t("firstNamePlaceholder")}
              aria-invalid={Boolean(fieldErrors.firstName)}
              className={FIELD_INVALID_BORDER_CLASS}
            />
            {fieldErrors.firstName ? (
              <p className={FIELD_ERROR_MESSAGE_CLASS}>{fieldErrors.firstName}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <EmployeeFieldLabel htmlFor="edit-last-name" required>
              {t("lastNameLabel")}
            </EmployeeFieldLabel>
            <Input
              id="edit-last-name"
              value={form.lastName}
              disabled={formLocked}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              placeholder={t("lastNamePlaceholder")}
              aria-invalid={Boolean(fieldErrors.lastName)}
              className={FIELD_INVALID_BORDER_CLASS}
            />
            {fieldErrors.lastName ? (
              <p className={FIELD_ERROR_MESSAGE_CLASS}>{fieldErrors.lastName}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <EmployeeFieldLabel htmlFor="edit-email" required>
              {t("emailLabel")}
            </EmployeeFieldLabel>
            <Input
              id="edit-email"
              type="email"
              value={form.email}
              disabled={formLocked}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder={t("emailPlaceholder")}
              aria-invalid={Boolean(fieldErrors.email)}
              className={FIELD_INVALID_BORDER_CLASS}
            />
            {fieldErrors.email ? (
              <p className={FIELD_ERROR_MESSAGE_CLASS}>{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <EmployeeFieldLabel htmlFor="edit-password">{t("passwordOptionalLabel")}</EmployeeFieldLabel>
            <div className="relative">
              <Input
                id="edit-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                disabled={formLocked}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder={t("passwordOptionalPlaceholder")}
                aria-invalid={Boolean(fieldErrors.password)}
                className={cn("pe-10", FIELD_INVALID_BORDER_CLASS)}
              />
              <button
                type="button"
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className={FIELD_ERROR_MESSAGE_CLASS}>{fieldErrors.password}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <EmployeeFieldLabel htmlFor="edit-position">{t("positionLabel")}</EmployeeFieldLabel>
            <Input
              id="edit-position"
              value={form.position}
              disabled={formLocked}
              onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
              placeholder={t("positionPlaceholder")}
            />
          </div>
        </form>

        <DialogFooter className="gap-2 p-6 pt-4 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            disabled={formLocked}
            onClick={() => onOpenChange(false)}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            form="edit-employee-form"
            disabled={formLocked}
            className={PRIMARY_BUTTON_CLASS}
          >
            {t("saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
