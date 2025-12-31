import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "@/lib/i18n";

interface LayoutProps {
  children: React.ReactNode;
}

export default function DeLayout({ children }: LayoutProps) {
  const messages = getMessages("de");

  return (
    <NextIntlClientProvider locale="de" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
