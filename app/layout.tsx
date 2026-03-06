import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import AuthControls from "@/components/AuthControls";

export const metadata = {
  title: "Deal Calculator",
  description: "Real estate deal calculator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeToggle />
        <AuthControls />
        {children}
      </body>
    </html>
  );
}
