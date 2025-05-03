import './globals.css'; // This must be the first import
import './fallback.css'; // Add this as a fallback
import type { Metadata } from "next";
import React from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter', 
  display: 'swap', 
});

export const metadata: Metadata = {
  title: "EWCL Platform",
  description: "Analyze protein collapse risk, per-residue entropy mapping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}> 
      <head>
        <script
          src="https://3dmol.csb.pitt.edu/build/3Dmol-min.js"
          async
        />
      </head>
      <body className="min-h-screen bg-gray-50">  
        {children}
      </body>
    </html>
  );
}
