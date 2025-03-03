import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { DeepgramProvider } from "@/lib/contexts/DeepgramContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getBaseUrl } from "@/lib/utils/urlUtils";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your expenses with ease",
  metadataBase: new URL(getBaseUrl()),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <DeepgramProvider>
              <main className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="main-content">
                  {children}
                </div>
              </main>
            </DeepgramProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
