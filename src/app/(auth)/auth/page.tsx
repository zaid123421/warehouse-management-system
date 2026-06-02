import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Legacy /auth path — redirects to /login */
export default function AuthRedirectPage() {
  redirect(ROUTES.AUTH.LOGIN);
}
