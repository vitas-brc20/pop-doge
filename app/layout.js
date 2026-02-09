import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Popdoge - The Ultimate Doge Clicker Game",
  description: "Click the Doge and help your country climb the leaderboard! A fun, real-time clicker game inspired by Popcat.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script src="https://shop-api.e-ncp.com/payments/ncp_pay.js" strategy="beforeInteractive" />
        <Script src="https://spay.kcp.co.kr/plugin/kcp_spay_hub.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
