import { redirect } from "next/navigation";

// Preview root redirects to default locale preview
export default function CMSPreviewRootPage() {
  redirect("/cms/preview/de");
}






