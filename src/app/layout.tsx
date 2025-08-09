import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import AuthPreloader from "../components/AuthPreloader";

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
        <AuthProvider>
          <AuthPreloader>
            {children}
          </AuthPreloader>
        </AuthProvider>
      </body>
    </html>
  );
}
