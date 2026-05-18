import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Revyze",
    template: "%s — Revyze",
  },
  description:
    "Revise smarter for Cambridge IGCSE with topic flashcards and timed quizzes. Track your progress and prepare for exams with confidence.",
  keywords: ["IGCSE", "revision", "flashcards", "Cambridge", "quizzes", "exam prep", "GCSE", "study"],
  authors: [{ name: "SEAL Labs" }],
  creator: "SEAL Labs",
  applicationName: "Revyze",
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Revyze",
    title: "Revyze — IGCSE Revision Made Simple",
    description:
      "Revise smarter for Cambridge IGCSE with topic flashcards and timed quizzes.",
  },
  twitter: {
    card: "summary",
    title: "Revyze — IGCSE Revision Made Simple",
    description:
      "Revise smarter for Cambridge IGCSE with topic flashcards and timed quizzes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
