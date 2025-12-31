import { generateLocaleMetadata, LocaleHome } from "@/app/(public)/locale-home";

export function generateMetadata() {
  return generateLocaleMetadata("tr");
}

export default function TrPage() {
  return <LocaleHome locale="tr" />;
}
