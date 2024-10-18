import React, { Suspense } from 'react';
import localFont from "next/font/local";
import "./globals.css";
import { OrderProvider } from '../contexts/OrderContext'; // Adjust the path if necessary

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap your application with OrderProvider */}
        <OrderProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </OrderProvider>
      </body>
    </html>
  );
}
