import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { AuthPromptHost } from "@/components/AuthPromptHost";
import { AppFooter } from "@/components/AppFooter";
import { CartProvider } from "@/components/CartProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { MeasureUnitProvider } from "@/components/MeasureUnitProvider";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cocktale — Learn, collect, and taste",
  description:
    "Discover cocktails matched to weather, popularity, and your taste history. Collect favorites and keep a tasting journal.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png", sizes: "any" }],
    shortcut: "/logo.png",
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0908",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col overflow-x-hidden"
        style={{
          fontFamily:
            "var(--font-body), 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', 'Noto Sans Arabic', 'Noto Sans Hebrew', 'Noto Naskh Arabic', 'Apple SD Gothic Neo', 'Hiragino Sans', 'Noto Sans JP', 'Noto Sans KR', 'Noto Sans Thai', 'Noto Sans Bengali', 'Noto Sans Devanagari', sans-serif",
        }}
      >
        <LanguageProvider>
          <MeasureUnitProvider>
            <AuthProvider>
              <CartProvider>
                {children}
                <AppFooter />
                <AuthPromptHost />
              </CartProvider>
            </AuthProvider>
          </MeasureUnitProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
