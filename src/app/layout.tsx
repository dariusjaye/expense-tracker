import "./globals.css";
import { Metadata } from 'next';
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { AppProvider } from "@/lib/contexts/AppContext";
import { DeepgramProvider } from "@/lib/contexts/DeepgramContext";
import Navigation from "@/components/Navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Business Expense Tracker",
  description: "Track and manage your business expenses with OCR receipt scanning",
};

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <DeepgramProvider>
            <div className="app-layout">
              <Navigation />
              <div className="main-content">
                {children}
              </div>
            </div>
          </DeepgramProvider>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootLayoutContent>
          {children}
        </RootLayoutContent>
      </body>
    </html>
  );
}
