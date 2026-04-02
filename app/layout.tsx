import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "경조사 관리 | 편리한 인맥 관리 전문 서비스",
  description: "스마트하게 관리하는 현대인의 경조사비 매니저",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.trustedTypes && window.trustedTypes.createPolicy) {
                if (!window.trustedTypes.defaultPolicy) {
                  window.trustedTypes.createPolicy('default', {
                    createHTML: (string) => string,
                    createScriptURL: (string) => string,
                    createScript: (string) => string,
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="app-container">
            <main className="main-content">
              {children}
            </main>
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
