import { generateLocaleMetadata, LocaleHome } from "@/app/(public)/locale-home";

export function generateMetadata() {
  return generateLocaleMetadata("de");
}

export default function DePage() {
  return <LocaleHome locale="de" />;
}
