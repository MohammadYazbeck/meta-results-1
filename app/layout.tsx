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
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute right-[-6rem] top-[-4rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(0,113,227,0.15),_transparent_68%)] blur-3xl sm:h-96 sm:w-96" />
          <div className="absolute bottom-[-8rem] left-[-5rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.9),_transparent_72%)] blur-3xl sm:h-[26rem] sm:w-[26rem]" />
          <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.7),transparent)]" />
        </div>
        {children}
      </body>
    </html>
  );
}
