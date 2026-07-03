"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ErrorAlert } from "@/components/ui/error-alert";
import { useAuthStore } from "@/shared/stores/auth-store";
import { ROUTES } from "@/constants/routes";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AUTH_PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { loginUseCase, LoginError } from "@/application/auth/login.use-case";
import { cn } from "@/lib/utils";
import {
  AuthPageShell,
  darkInput,
} from "@/app/(auth)/_components/auth-shell";
import { AuthPageHeading } from "@/app/(auth)/_components/auth-page-heading";
import { AuthTextField } from "@/app/(auth)/_components/auth-text-field";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  const [showRegisteredMessage, setShowRegisteredMessage] = useState(false);
  const [showActivatedMessage, setShowActivatedMessage] = useState(false);
  const [showResetLinkSentMessage, setShowResetLinkSentMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  const isRegisteredSuccess = useMemo(
    () => searchParams.get("registered") === "1",
    [searchParams],
  );
  const isActivatedSuccess = useMemo(
    () => searchParams.get("activated") === "1",
    [searchParams],
  );
  const isResetLinkSent = useMemo(
    () => searchParams.get("sent") === "1",
    [searchParams],
  );

  useEffect(() => {
    if (!isRegisteredSuccess && !isActivatedSuccess && !isResetLinkSent) return;
    if (isRegisteredSuccess) setShowRegisteredMessage(true);
    if (isActivatedSuccess) setShowActivatedMessage(true);
    if (isResetLinkSent) setShowResetLinkSentMessage(true);
    router.replace(ROUTES.AUTH.LOGIN, { scroll: false });
  }, [isRegisteredSuccess, isActivatedSuccess, isResetLinkSent, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitLockRef.current) return;
    setFormError(null);
    const form = e.currentTarget;
    const email =
      (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim() ?? "";
    const password =
      (form.elements.namedItem("password") as HTMLInputElement)?.value ?? "";
    if (!email || !password) {
      setFormError(t("loginFailed"));
      return;
    }
    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      const { role, user } = await loginUseCase({ email, password });
      setSession(role, user);
      router.push(ROUTES.DASHBOARD.ROOT);
    } catch (err) {
      setFormError(
        err instanceof LoginError
          ? err.message.trim() || t("loginFailed")
          : t("loginFailed"),
      );
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageShell>
      <AuthPageHeading
        title={t("welcomeBack")}
        subtitle={t("signInSubtitle")}
      />

      {/* Banners */}
      {showRegisteredMessage && (
        <div className="mb-6 rounded-lg bg-success-dark/20 px-4 py-3 text-center text-label-lg text-success-dark">
          {t("registerSuccess")}
        </div>
      )}
      {showActivatedMessage && (
        <div className="mb-6 rounded-lg bg-success-dark/20 px-4 py-3 text-center text-label-lg text-success-dark">
          {t("activateAccountSuccess")}
        </div>
      )}
      {showResetLinkSentMessage && (
        <div className="mb-6 rounded-lg border border-primary-dark/25 bg-primary-dark/10 px-4 py-3 text-center text-label-lg text-white/80">
          {t("resetLinkSentInfo")}
        </div>
      )}
      {formError ? (
        <ErrorAlert
          message={formError}
          className="mb-6 bg-error-main/15 text-red-300 border-error-main/30"
        />
      ) : null}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthTextField
          id="email"
          name="email"
          label={t("emailAddress")}
          type="email"
          placeholder={t("emailAddress")}
          autoComplete="email"
          required
          icon={<Mail className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />}
          inputClassName={cn(darkInput, "ps-11")}
        />

        <AuthTextField
          id="password"
          name="password"
          label={t("passwordLabel")}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          icon={<Lock className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />}
          inputClassName={cn(darkInput, "ps-11 pe-11")}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer text-white/35 transition-colors hover:text-white/70"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            href={ROUTES.AUTH.FORGOT_PASSWORD}
            className="text-sm font-semibold text-primary-dark hover:underline"
          >
            {t("forgotPassword.title")}
          </Link>
        </div>

        {/* Sign In button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={AUTH_PRIMARY_BUTTON_CLASS}
        >
          {isSubmitting ? t("signingIn") : t("signIn")}
        </button>
      </form>

      {/* Need access */}
      <p className="mt-6 text-center text-sm text-white/35">
        {t("needAccess")}
      </p>
    </AuthPageShell>
  );
}
