'use client';

import "./globals.css";

import { usePathname } from 'next/navigation';

import Header from "@/components/header/index";
import Footer from "@/components/footer/index";
import { Toaster } from "@/components/ui/toaster"

const metadata = {
  title: "Oris Cloud",
  description: "Oris Cloud é uma plataforma de cloud gaming brasileira que disponibiliza instâncias EC2 dedicadas na AWS São Paulo com GPU NVIDIA Tesla T4. Jogue via Parsec ou Moonlight de qualquer dispositivo.",
  icon: "/oris-icon.png",
  icons: {
    icon: "/oris-icon.png",
    shortcut: "/oris-icon.png",
    apple: "/oris-icon.png"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const routeMetadata = {
    '/machines': {
      title: 'Máquinas - Oris Cloud'
    },
    '/terms': {
      title: 'Termos - Oris Cloud'
    },
    '/order': {
      title: 'Plano - Oris Cloud'
    },
    '/order/payment': {
      title: 'Pagamento - Oris Cloud'
    },
  };
  const currentMetadata = routeMetadata[pathname as keyof typeof routeMetadata] || metadata;

  return (
    <html lang="en">
      <head>
        <title>{currentMetadata.title as string}</title>
        <meta name="description" content={metadata.description as string} />
        <link rel="icon" href={metadata.icons.icon} />
        <link rel="shortcut icon" href={metadata.icons.shortcut} />
        <link rel="apple-touch-icon" href={metadata.icons.apple} />
      </head>

      <body className={`antialiased overflow-x-hidden`}>
        <div className="min-h-screen w-screen bg-[rgb(9,9,11)] text-white">
          <Header />
          <main>{children}</main>
          <Footer />
          <Toaster />
        </div>
      </body>
    </html>
  );
};