import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** الصفحة الرئيسية: توجيه المستخدم إلى تسجيل الدخول */
export default function Home() {
  redirect(ROUTES.AUTH.LOGIN);
}
