import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n";

// Root page redirects to default locale
export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
