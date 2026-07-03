import type { ReactNode } from "react";
import { Label, RequiredMark } from "@/components/ui/label";

type EmployeeFieldLabelProps = {
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
};

export function EmployeeFieldLabel({ htmlFor, required, children }: EmployeeFieldLabelProps) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      {required ? <RequiredMark /> : null}
    </Label>
  );
}
