import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Journey Home — Save ahead. Prepare with dignity.", template: "%s · Journey Home" },
  description:
    "Families save a little each month toward professional photography and videography for a loved one's burial.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-canvas">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
