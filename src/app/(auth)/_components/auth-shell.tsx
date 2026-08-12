"use client";

import Image from "next/image";
import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export const PANEL_BG = "bg-[#0C1A2B]";

export const darkInput =
  "bg-white/5 border-primary-dark/40 text-white placeholder:text-white/30 " +
  "focus:border-primary-dark focus:bg-white/[0.08] " +
  "focus:shadow-[0_0_0_3px_rgba(14,165,233,0.2)]";

export function AuthLeftPanel() {
  const t = useTranslations("auth");
  return (
    <section className="relative hidden overflow-hidden lg:block">
      <Image
        src="/images/login_left_bg_clean.png"
        alt={t("brandPanelAlt")}
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#0B1929]/60" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-12 py-16">
          <Image
            src="/images/x_blue_square.png"
            alt={t("logoAlt")}
            width={200}
            height={200}
            priority
            className="h-auto w-20 xl:w-28"
          />
          <div className="text-center">
            <h1 className="text-5xl font-black text-white xl:text-6xl">
              TreadX
            </h1>
            <p className="mt-2 text-xl font-semibold text-primary-dark xl:text-2xl">
              {t("warehousePortal")}
            </p>
          </div>
          <div className="h-px w-full max-w-[240px] bg-white/20" />
          <p className="text-sm tracking-wide text-white/55">
            {t("vendorDashboard")}
          </p>
        </div>
      </div>
    </section>
  );
}

export function AuthSecuredBy() {
  const t = useTranslations("auth");
  return (
    <div className="flex items-center justify-center gap-1.5 pb-6 pt-2">
      <Shield className="size-3.5 text-white/25" />
      <span className="text-xs text-white/25">{t("securedBy")}</span>
    </div>
  );
}

export function AuthPageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid min-h-screen", PANEL_BG, "lg:grid-cols-[45fr_55fr]")}>
      <AuthLeftPanel />
      <section className={cn("flex min-h-screen flex-col", PANEL_BG)}>
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-[400px]">
            {/* Mobile logo */}
            <MobileLogo />
            {children}
          </div>
        </div>
        <AuthSecuredBy />
      </section>
    </div>
  );
}

function MobileLogo() {
  const t = useTranslations("auth");
  return (
    <div className="mb-8 flex justify-center lg:hidden">
      <Image
        src="/images/x_blue_square.png"
        alt={t("logoAlt")}
        width={56}
        height={56}
        className="h-14 w-14"
      />
    </div>
  );
}
