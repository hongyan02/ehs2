import type { Metadata } from "next";
import Providers from "@/config/providers";
import "@/app/globals.css";
import { MainLayout } from "@/features/layout";
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_TITLE,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Toaster />
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
