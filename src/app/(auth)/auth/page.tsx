"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TokenService from "@/infrastructure/auth/token-service";
import { useAuthStore } from "@/shared/stores/auth-store";
import { ROUTES } from "@/constants/routes";
import { ROLES, type Role } from "@/shared/config/roles";

const MOCK_TOKEN = 'mock-jwt-token-for-base-project';

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setRole = useAuthStore((s) => s.setRole);
  const [showRegisteredMessage, setShowRegisteredMessage] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(ROLES.SUPPLIER);

  useEffect(() => {
    if (searchParams.get('registered') === '1') {
      setShowRegisteredMessage(true);
      router.replace('/auth', { scroll: false });
    }
  }, [searchParams, router]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    TokenService.setRefreshToken(MOCK_TOKEN);
    TokenService.setRole(selectedRole);
    setRole(selectedRole);
    router.push(ROUTES.DASHBOARD.ROOT);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-headline-sm font-bold text-foreground">
            {t("welcome")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("loginDescription")}
          </CardDescription>
        </CardHeader>
        {showRegisteredMessage && (
          <div className="mx-6 rounded-lg bg-success-container p-3 text-center text-sm text-success-onContainer">
            {t("registerSuccess")}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-right">
                {t("email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                className="text-right"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-right">
                {t("password")}
              </Label>
              <Input id="password" name="password" type="password" className="text-right" />
            </div>
            <div className="grid gap-2">
              <Label className="text-right">{t("roleTest")}</Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as Role)}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder={t("roleTest")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLES.ADMIN}>admin</SelectItem>
                  <SelectItem value={ROLES.SUPPLIER}>supplier</SelectItem>
                  <SelectItem value={ROLES.USER}>user</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">
              {t("loginButton")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <Link
                href={ROUTES.AUTH.REGISTER}
                className="font-medium text-primary hover:underline"
              >
                {t("createAccount")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}