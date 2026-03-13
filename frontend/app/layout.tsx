import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoPilot Outreach - AI-Powered Cold Email Automation",
  description: "Generate hyper-personalized email sequences with AI agents",
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
