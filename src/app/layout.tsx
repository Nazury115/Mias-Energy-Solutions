import type { Metadata } from "next";
import { business } from "@/content/site";
import { pageMetadata, siteUrl } from "@/lib/site-metadata";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...pageMetadata("Mias Energy Solutions | Water & Renewable Energy in Lusaka", business.description, "/"),
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <RevealOnScroll />
      </body>
    </html>
  );
}
