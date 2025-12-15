import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";


const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "School Calendar",
  description: "School calendar and schedule management system",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>📅</text></svg>",
  },
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
        {children}
      </body>
    </html>
  );
}
