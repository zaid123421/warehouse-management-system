import { getTranslations } from "next-intl/server";

export default async function ProfilePage() {
  const t = await getTranslations("dashboard");
  return (
    <div className="space-y-4">
      <h1 className="text-headline-sm font-bold text-foreground">
        {t("profileTitle")}
      </h1>
      <p className="text-body-md text-muted-foreground">{t("profileIntro")}</p>
    </div>
  );
}
