"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Cookies from "js-cookie";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LOCALE_COOKIE = "NEXT_LOCALE";

const LOCALES = [
  { value: "ar", label: "عربي" },
  { value: "en", label: "English" },
] as const;

export function LocaleSwitcher() {
  const router = useRouter();
  const locale = useLocale();

  function handleChange(value: string) {
    Cookies.set(LOCALE_COOKIE, value);
    router.refresh();
  }

  const currentLabel = LOCALES.find((l) => l.value === locale)?.label ?? locale;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 min-w-[7rem] justify-between gap-2"
          aria-label="Language"
        >
          <span>{currentLabel}</span>
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => handleChange(value)}
            className={cn(
              value === locale && "bg-primary text-primary-foreground",
              "data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
            )}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
