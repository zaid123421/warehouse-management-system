"use client";

import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthTextFieldProps = {
  id: string;
  name: string;
  label: string;
  icon: ReactNode;
  inputClassName?: string;
  error?: string;
  rightSlot?: ReactNode;
} & Omit<ComponentProps<typeof Input>, "id" | "name">;

export function AuthTextField({
  id,
  name,
  label,
  icon,
  inputClassName,
  error,
  rightSlot,
  ...inputProps
}: AuthTextFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-white/60">
        {label}
      </Label>
      <div className="relative">
        {icon}
        <Input
          id={id}
          name={name}
          className={inputClassName}
          {...inputProps}
        />
        {rightSlot}
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
