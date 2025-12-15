import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";


const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "School Calendar",
  description: "School calendar and schedule management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${lexend.variable} font-display antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

