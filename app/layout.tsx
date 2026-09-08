import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://subhanacademy.in"),
  title: {
    default: "Subhan Academy",
    template: "%s | Subhan Academy"
  },
  description: "Subhan Academy is a premium course platform for practical business launch training.",
  icons: {
    icon: "/images/subhan-academy-logo.png",
    apple: "/images/subhan-academy-logo.png"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers />
        {children}
      </body>
    </html>
  );
}
