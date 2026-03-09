import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "../providers/query-provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Suspense } from "react";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "TreadX - WMS",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  return (
    <html lang="en">
      <body
        className={`font-english`}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
