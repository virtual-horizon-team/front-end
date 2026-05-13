import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk", // optional (for Tailwind)
});

export const metadata: Metadata = {
  title: "Virtual Horizon",
  description: "Virtual Horizon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body
        className={`${spaceGrotesk.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
