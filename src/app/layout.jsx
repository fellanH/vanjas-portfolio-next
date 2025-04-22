// RootLayout is a Server Component again
import { Inter } from "next/font/google";
import "@/app/globals.css";
// Remove client-side imports no longer needed here
// import React, { useState, useEffect } from "react";
// import { contentfulClient } from "@/lib/contentfulClient";
// import Navigation from "@/components/Navigation";
import MainLayout from "@/components/MainLayout"; // Import the new client layout wrapper

const inter = Inter({ subsets: ["latin"] });

// Add back default metadata
export const metadata = {
  title: "Vanja Edevåg Hellström - Portfolio", // Default site title
  description:
    "Selected works by Vanja Edevåg Hellström, architect and designer.", // Default description
  // Add other default meta tags if needed, e.g., icons, openGraph defaults
  icons: {
    icon: "/favicon.ico", // Example, ensure files exist
    apple: "/apple-icon.png",
  },
  // Basic OpenGraph defaults (can be overridden by pages)
  openGraph: {
    title: "Vanja Edevåg Hellström - Portfolio",
    description:
      "Selected works by Vanja Edevåg Hellström, architect and designer.",
    // url: 'YOUR_SITE_URL', // Add your canonical site URL
    siteName: "Vanja Edevåg Hellström Portfolio",
    // images: [ // Add default OG image if you have one
    //   {
    //     url: '/og-image.png', // Must be an absolute URL for external crawlers
    //     width: 1200,
    //     height: 630,
    //   },
    // ],
    locale: "en_US", // Adjust locale if needed
    type: "website",
  },
  // Add other metadata like twitter cards etc. if desired
};

// RootLayout just sets up html, body, and renders the client layout wrapper
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Use the MainLayout client component to handle dynamic nav + children */}
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
