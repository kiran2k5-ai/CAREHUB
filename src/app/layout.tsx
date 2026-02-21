import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import { AuthPreloader } from "../components/AuthPreloader";
import { ToastProvider } from "../components/ToastProvider";
import { React19CompatInit } from "../components/React19CompatInit";
import "../lib/react19Compat"; // Suppress React 19 warnings from third-party libs

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Doctor Booking System",
  description: "Book appointments with doctors online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <React19CompatInit />
        <AuthProvider>
          <AuthPreloader>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthPreloader>
        </AuthProvider>
      </body>
    </html>
  );
}
