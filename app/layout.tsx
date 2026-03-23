import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mugly Cafe - Order Management",
  description: "Restaurant order management system for Mugly Cafe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#161b27',
              color: '#e6edf3',
              border: '1px solid #21262d',
            },
          }}
        />
      </body>
    </html>
  );
}
