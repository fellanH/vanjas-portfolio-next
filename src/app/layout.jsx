"use client"; // Convert RootLayout to a Client Component

import React, { useState, useEffect } from "react"; // Import hooks
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { contentfulClient } from "@/lib/contentfulClient"; // Import Contentful client
import Navigation from "@/components/Navigation"; // Import Navigation component

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

// Metadata can be exported directly in JS/JSX files
// export const metadata = {
//   title: "Vanjas Portfolio",
//   description: "My portfolio",
// };

// RootLayout is now a Client Component
export default function RootLayout({ children }) {
  // State for navigation data
  const [categories, setCategories] = useState([]);
  const [aboutInfo, setAboutInfo] = useState(null);
  const [loadingNav, setLoadingNav] = useState(true);
  const [errorNav, setErrorNav] = useState(null);

  useEffect(() => {
    const fetchNavData = async () => {
      setLoadingNav(true);
      setErrorNav(null);
      try {
        // Fetch categories
        const categoryResponse = await contentfulClient.getEntries({
          content_type: "categories", // Assuming 'categories' is the correct ID
          select: "sys.id,fields.name,fields.slug", // Select necessary fields
          order: "fields.name",
        });
        setCategories(categoryResponse.items || []);

        // Fetch about info
        const aboutResponse = await contentfulClient.getEntries({
          content_type: "about", // Assuming 'about' is the correct ID
          limit: 1,
        });
        if (aboutResponse.items.length > 0) {
          setAboutInfo(aboutResponse.items[0].fields);
        }
      } catch (error) {
        console.error(
          "Error fetching navigation data in layout (client-side):",
          error
        );
        setErrorNav("Failed to load navigation data.");
      } finally {
        setLoadingNav(false);
      }
    };

    fetchNavData();
  }, []); // Empty dependency array, fetch once on mount

  return (
    <html lang="en">
      {/* Apply the font class to the body */}
      <body className={inter.className}>
        {/* Mimic structure from page.jsx */}
        <div className="page-wrapper">
          <div className="main-wrapper">
            {/* Render Navigation with state data, handle loading/error */}
            {loadingNav ? (
              <div className="page-head">
                <p>Loading navigation...</p>
              </div> // Basic loading indicator
            ) : errorNav ? (
              <div className="page-head">
                <p>Error loading navigation: {errorNav}</p>
              </div> // Basic error indicator
            ) : (
              <Navigation categories={categories} aboutInfo={aboutInfo} />
            )}
            {/* Render the rest of the page content */}
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
