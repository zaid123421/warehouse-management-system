"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { Mail, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";
import { AUTH_PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { toast } from "sonner";
import {
  ForgotPasswordError,
  requestPasswordResetUseCase,
} from "@/application/auth/forgot-password.use-case";
import { cn } from "@/lib/utils";
import {
  AuthPageShell,
  darkInput,
} from "@/app/(auth)/_components/auth-shell";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function obfuscateEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***.***";
  const masked = (local?.[0] ?? "?") + "***";
  return `${masked}@${domain}`;
}

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const tForgot = (key: string, values?: Record<string, string>) =>
    t(`forgotPassword.${key}`, values);
  const tValidation = useTranslations("validation");

  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail =
      (e.currentTarget.elements.namedItem("email") as HTMLInputElement)?.value?.trim() ?? "";
    if (!trimmedEmail) {
      setEmailError(tValidation("emailRequired"));
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError(tValidation("invalidEmail"));
      return;
    }
    setEmailError("");
    setIsRequesting(true);
    try {
      await requestPasswordResetUseCase({ email: trimmedEmail });
      setEmail(trimmedEmail);
      setIsSuccess(true);
    } catch (err) {
      toast.error(
        err instanceof ForgotPasswordError
          ? err.message.trim() || tForgot("requestFailed")
          : tForgot("requestFailed"),
      );
    } finally {
      setIsRequesting(false);
    }
  }

  return (
    <AuthPageShell>
      {/* Back link */}
      <Link
        href={isSuccess ? ROUTES.AUTH.FORGOT_PASSWORD : ROUTES.AUTH.LOGIN}
        onClick={
          isSuccess
            ? (ev) => {
                ev.preventDefault();
                setIsSuccess(false);
                setEmail("");
              }
            : undefined
        }
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary-dark hover:underline"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        {isSuccess ? tForgot("tryAnotherEmail") : tForgot("backToSignIn")}
      </Link>

      {!isSuccess ? (
        <>
          {/* Icon + heading */}
          <div className="mb-10 text-center">
            <div className="mb-5 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary-dark/15">
                <KeyRound className="size-8 text-primary-dark" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">
              {tForgot("title")}
            </h2>
            <p className="mt-2 text-sm text-white/50">
              {tForgot("subtitle")}
            </p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-white/60">
                {t("emailAddress")}
              </Label>
              <div className="relative">
                <Mail className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={tForgot("emailPlaceholder")}
                  autoComplete="email"
                  className={cn(darkInput, "ps-11")}
                  required
                />
              </div>
              {emailError && (
                <p className="text-sm text-red-400">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isRequesting}
              className={AUTH_PRIMARY_BUTTON_CLASS}
            >
              {isRequesting ? tForgot("submitting") : tForgot("submitButton")}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-6 text-center">
            <span className="text-sm text-white/40">
              {tForgot("rememberPassword")}{" "}
            </span>
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="text-sm font-semibold text-primary-dark hover:underline"
            >
              {t("signIn")}
            </Link>
          </div>
        </>
      ) : (
        <>
          {/* Success state */}
          <div className="mb-10 text-center">
            <div className="mb-5 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-success-dark/15">
                <CheckCircle2 className="size-8 text-success-dark" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">
              {tForgot("successTitle")}
            </h2>
            <p className="mt-3 text-sm text-white/50">
              {tForgot("successDescription", { email: obfuscateEmail(email) })}
            </p>
            <p className="mt-3 text-sm text-white/35">
              {tForgot("spamHint")}
            </p>
          </div>

          <Link
            href={`${ROUTES.AUTH.LOGIN}?sent=1`}
            className={AUTH_PRIMARY_BUTTON_CLASS}
          >
            {tForgot("backToSignIn")}
          </Link>
        </>
      )}
    </AuthPageShell>
  );
}
