import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Varsha's Versatile — Professional Anchor for All Occasions",
  description:
    "Varsha Jain is a professional anchor based in India, specializing in weddings, birthday parties, corporate events, and cultural functions. Book your event anchor today.",
  keywords: "anchor, event host, wedding anchor, birthday party host, corporate events, Varsha Jain, Varsha's Versatile",
  openGraph: {
    title: "Varsha's Versatile — Professional Anchor",
    description: "Making every event unforgettable. Weddings, birthdays, corporate events & more.",
    type: "website",
    images: ["/logo.jpg"],
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo.jpg', type: 'image/jpeg' },
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
