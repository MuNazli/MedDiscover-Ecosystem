import "./globals.css";
import "@/lib/envValidation"; // Validate env on boot

export const metadata = {
  title: "MedDiscover – Quality Healthcare, Available Worldwide",
  description: "We help you access trusted clinics and guide you through your treatment journey.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
