"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { AUTH_PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { registerUseCase } from "@/application/auth/register.use-case";
import { cn } from "@/lib/utils";
import {
  AuthPageShell,
  darkInput,
} from "@/app/(auth)/_components/auth-shell";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const t = useTranslations("register");
  const tAuth = useTranslations("auth");
  const tValidation = useTranslations("validation");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = tValidation("nameRequired");
    if (!email.trim()) next.email = tValidation("emailRequired");
    else if (!EMAIL_REGEX.test(email)) next.email = tValidation("invalidEmail");
    if (!password) next.password = tValidation("passwordRequired");
    else if (password.length < MIN_PASSWORD_LENGTH)
      next.password = tValidation("passwordMin");
    if (password !== confirmPassword)
      next.confirmPassword = tValidation("passwordMismatch");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      await registerUseCase({ name: name.trim(), email: email.trim(), password });
      router.push(`${ROUTES.AUTH.LOGIN}?registered=1`);
      router.refresh();
    } catch {
      setErrors({ form: tCommon("formError") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageShell>
      {/* Back link */}
      <Link
        href={ROUTES.AUTH.LOGIN}
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary-dark hover:underline"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        {tAuth("haveAccount")}
      </Link>

      {/* Heading */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white">{t("title")}</h2>
        <p className="mt-2 text-sm text-white/50">{t("description")}</p>
      </div>

      {/* Form error */}
      {errors.form && (
        <div className="mb-5 rounded-lg border border-error-main/30 bg-error-main/15 px-4 py-3 text-center text-sm text-red-300">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-white/60">
            {t("fullName")}
          </Label>
          <div className="relative">
            <User className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <Input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("fullName")}
              className={cn(darkInput, "ps-11")}
              autoComplete="name"
            />
          </div>
          {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-white/60">
            {tAuth("emailAddress")}
          </Label>
          <div className="relative">
            <Mail className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={cn(darkInput, "ps-11")}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-medium text-white/60">
            {tAuth("passwordLabel")}
          </Label>
          <div className="relative">
            <Lock className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(darkInput, "ps-11 pe-11")}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer text-white/35 transition-colors hover:text-white/70"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-medium text-white/60">
            {t("confirmPassword")}
          </Label>
          <div className="relative">
            <Lock className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(darkInput, "ps-11 pe-11")}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer text-white/35 transition-colors hover:text-white/70"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-400">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className={AUTH_PRIMARY_BUTTON_CLASS}
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </button>
        </div>
      </form>

      {/* Sign in link */}
      <div className="mt-6 border-t border-white/10 pt-6 text-center">
        <span className="text-sm text-white/40">{tAuth("haveAccount")} </span>
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="text-sm font-semibold text-primary-dark hover:underline"
        >
          {tAuth("signIn")}
        </Link>
      </div>
    </AuthPageShell>
  );
}
