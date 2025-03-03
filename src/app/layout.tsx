import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { AppProvider } from "@/lib/contexts/AppContext";
import { DeepgramProvider } from "@/lib/contexts/DeepgramContext";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Business Expense Tracker",
  description: "Track and manage your business expenses with OCR receipt scanning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}
