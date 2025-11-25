import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickFeedback - Beautiful Feedback Widgets",
  description: "Add a professional feedback system to your site in 60 seconds. No coding required.",
  keywords: ["feedback widget", "customer feedback", "website feedback", "user feedback", "feedback form"],
  authors: [{ name: "QuickFeedback" }],
  openGraph: {
    title: "QuickFeedback - Beautiful Feedback Widgets",
    description: "Add a professional feedback system to your site in 60 seconds. No coding required.",
    url: "https://quickfeedback.co",
    siteName: "QuickFeedback",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickFeedback - Beautiful Feedback Widgets",
    description: "Add a professional feedback system to your site in 60 seconds. No coding required.",
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
