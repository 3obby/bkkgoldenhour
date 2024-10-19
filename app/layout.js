import React, { Suspense } from 'react';
import localFont from "next/font/local";
import "./globals.css";
import { OrderProvider } from '../contexts/OrderContext'; // Adjust the path if necessary
import Loading from './loading'; // Add this import

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
  title: "EUPHORIA",
  description: "<3",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap your application with OrderProvider */}
        <OrderProvider>
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </OrderProvider>
      </body>
    </html>
  );
}
