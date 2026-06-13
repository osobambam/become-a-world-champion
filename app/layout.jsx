import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  metadataBase: new URL("https://beaworldchampion.com"),
  title: "Be A World Champion",
  description: "All-era squad draft & knockout tournament simulator. Draft your XI, spin the wheel, and chase the trophy.",
  openGraph: {
    title: "Be A World Champion",
    description: "Draft an all-era XI, spin the wheel, and win the tournament.",
    url: "https://beaworldchampion.com",
    siteName: "Be A World Champion",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Be A World Champion",
    description: "Draft an all-era XI, spin the wheel, and win the tournament.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* "Matchday Print" type system — referenced by name in globals.css + inline styles.
            Fraunces = editorial serif display, Archivo = grotesk UI, Spline Sans Mono = box-score numbers */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=Archivo:wght@400;500;600;700;800&family=Spline+Sans+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}<Analytics /></body>
    </html>
  );
}
