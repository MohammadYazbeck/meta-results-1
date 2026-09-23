import "./globals.css";

import type { Metadata } from "next";
import Script from "next/script";
import { ReactNode } from "react";

const tailwindConfig = `
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          accent: 'var(--accent)',
          danger: 'var(--danger)',
          ink: 'var(--text)',
          line: 'var(--line)',
          muted: 'var(--muted)',
          success: 'var(--success)',
          surface: 'var(--card)',
          surfaceStrong: 'var(--card-strong)'
        },
        boxShadow: {
          panel: 'var(--shadow)'
        },
        fontFamily: {
          body: ['var(--font-body)'],
          display: ['var(--font-display)']
        },
        maxWidth: {
          detail: '1240px',
          shell: '1360px'
        }
      }
    }
  };
`;

export const metadata: Metadata = {
  title: "Meta Spend Dashboard",
  description: "Date-filtered Meta Ads spend reporting built with Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html dir="rtl" lang="ar">
      <head>
        <Script id="tailwind-config" strategy="beforeInteractive">
          {tailwindConfig}
        </Script>
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-transparent text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
