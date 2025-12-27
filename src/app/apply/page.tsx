import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n";

// Apply page redirects to default locale
export default function ApplyPage() {
  redirect(`/${DEFAULT_LOCALE}/apply`);
}
