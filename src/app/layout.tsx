import type { Metadata, Viewport } from 'next';
import '@/index.css';

export const metadata: Metadata = {
  title: 'Morde Enterprise Portal | QA OCR, Workers & Vouchers',
  description: 'Enterprise operations portal for Morde: Quality Assurance OCR, Daily Loader Records, and Financial Voucher Management with SAP integration.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#E4022D'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#FAF8F5] text-neutral-900 font-montserrat min-h-screen">
        {children}
      </body>
    </html>
  );
}
