"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";
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
import { useCreateStaff } from "@/modules/employees/hooks/use-create-staff";

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

export type AddEmployeeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddEmployeeModal({ open, onOpenChange }: AddEmployeeModalProps) {
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const createStaff = useCreateStaff();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm(emptyForm);
      setFieldErrors({});
      setShowPassword(false);
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = t("validationFirstNameRequired");
    if (!form.lastName.trim()) errors.lastName = t("validationLastNameRequired");
    if (!form.email.trim()) errors.email = t("validationEmailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = t("validationEmailInvalid");
    }
    if (!form.password.trim()) errors.password = t("validationPasswordRequired");
    else if (form.password.trim().length < 8) {
      errors.password = t("validationPasswordMin");
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createStaff.mutateAsync({
        email: form.email.trim(),
        password: form.password.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        position: form.position.trim(),
        active: true,
      });
      toast.success(t("createSuccess"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("saveError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(DIALOG_SHELL_CLASS, "max-w-md gap-0 overflow-hidden p-0")}>
        <DialogHeader className="p-6 pb-4 text-start">
          <DialogTitle>{t("addEmployee")}</DialogTitle>
        </DialogHeader>

        <form id="add-employee-form" onSubmit={handleSubmit} className="space-y-4 px-6 pb-2">
          <div className="space-y-2">
            <EmployeeFieldLabel htmlFor="add-first-name" required>
              {t("firstNameLabel")}
            </EmployeeFieldLabel>
            <Input
              id="add-first-name"
              value={form.firstName}
              disabled={createStaff.isPending}
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
            <EmployeeFieldLabel htmlFor="add-last-name" required>
              {t("lastNameLabel")}
            </EmployeeFieldLabel>
            <Input
              id="add-last-name"
              value={form.lastName}
              disabled={createStaff.isPending}
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
            <EmployeeFieldLabel htmlFor="add-email" required>
              {t("emailLabel")}
            </EmployeeFieldLabel>
            <Input
              id="add-email"
              type="email"
              value={form.email}
              disabled={createStaff.isPending}
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
            <EmployeeFieldLabel htmlFor="add-password" required>
              {t("passwordLabel")}
            </EmployeeFieldLabel>
            <div className="relative">
              <Input
                id="add-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                disabled={createStaff.isPending}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder={t("passwordPlaceholder")}
                aria-invalid={Boolean(fieldErrors.password)}
                className={cn("pe-10", FIELD_INVALID_BORDER_CLASS)}
              />
              <button
                type="button"
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                aria-pressed={showPassword}
              >
                <Eye className="size-4" />
              </button>
            </div>
            {fieldErrors.password ? (
              <p className={FIELD_ERROR_MESSAGE_CLASS}>{fieldErrors.password}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <EmployeeFieldLabel htmlFor="add-position">{t("positionLabel")}</EmployeeFieldLabel>
            <Input
              id="add-position"
              value={form.position}
              disabled={createStaff.isPending}
              onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
              placeholder={t("positionPlaceholder")}
            />
          </div>
        </form>

        <DialogFooter className="gap-2 p-6 pt-4 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            disabled={createStaff.isPending}
            onClick={() => onOpenChange(false)}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            form="add-employee-form"
            disabled={createStaff.isPending}
            className={PRIMARY_BUTTON_CLASS}
          >
            {t("createAccount")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
