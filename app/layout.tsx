import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "Notex",
    template: "%s | Notex",
  },
  description: "A modern note-taking app for productivity",
  keywords: [
    "notes",
    "productivity",
    "notex",
    "knowledge base",
    "note taking app",
  ],
  authors: [{ name: "Notex Team" }],
  creator: "Notex",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL!),

  openGraph: {
    title: "Notex",
    description: "Smart notes for modern thinking",
    url: process.env.NEXT_PUBLIC_URL!,
    siteName: "Notex",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Notex Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Notex",
    description: "Smart notes for modern thinking",
    images: ["/logo.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

const Roboto = localFont({
  src: [
    {
      path: "../public/fonts/Roboto-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/fonts/Roboto-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    { path: "../public/fonts/Roboto-Bold.ttf", weight: "700", style: "normal" },
    {
      path: "../public/fonts/Roboto-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Roboto-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Roboto-Light.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Roboto-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    { path: "../public/fonts/Roboto-Thin.ttf", weight: "100", style: "normal" },
  ],
  variable: "--font-roboto",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={Roboto.variable}>
      <body className="font-roboto antialiased">
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors closeButton={true} />
      </body>
    </html>
  );
}
