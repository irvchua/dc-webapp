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
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: "linear-gradient(180deg, #f7f9fc 0%, #eef2f7 100%)",
          minHeight: "100vh",
          color: "#1f2937",
        }}
      >
        {children}
      </body>
    </html>
  );
}
