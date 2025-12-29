import { redirect } from "next/navigation";

// CMS root redirects to dashboard
export default function CMSPage() {
  redirect("/cms/dashboard");
}





