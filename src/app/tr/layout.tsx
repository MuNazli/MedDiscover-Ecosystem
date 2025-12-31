import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "@/lib/i18n";

interface LayoutProps {
  children: React.ReactNode;
}

export default function TrLayout({ children }: LayoutProps) {
  const messages = getMessages("tr");

  return (
    <NextIntlClientProvider locale="tr" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
