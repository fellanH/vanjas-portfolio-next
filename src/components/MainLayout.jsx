"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { contentfulClient } from "@/lib/contentfulClient";

export default function MainLayout({ children }) {
  // State for navigation data
  const [categories, setCategories] = useState([]);
  const [aboutInfo, setAboutInfo] = useState(null);
  const [loadingNav, setLoadingNav] = useState(true);
  const [errorNav, setErrorNav] = useState(null);

  useEffect(() => {
    // Fetches categories and about info from Contentful
    const fetchNavData = async () => {
      setLoadingNav(true);
      setErrorNav(null);
      try {
        // Fetch categories
        const categoryPromise = contentfulClient.getEntries({
          content_type: "categories", // Assuming 'categories' is the correct ID
          select: "sys.id,fields.name,fields.slug", // Select necessary fields
          order: "fields.name",
        });

        // Fetch about info
        const aboutPromise = contentfulClient.getEntries({
          content_type: "about", // Assuming 'about' is the correct ID
          limit: 1,
        });

        // Wait for both fetches to complete
        const [categoryResponse, aboutResponse] = await Promise.all([
          categoryPromise,
          aboutPromise,
        ]);

        setCategories(categoryResponse.items || []);

        if (aboutResponse.items.length > 0) {
          setAboutInfo(aboutResponse.items[0].fields);
        } else {
          console.warn("No 'about' entry found for navigation.");
          // Set aboutInfo to an empty object or keep it null based on how Navigation handles it
          setAboutInfo({}); // Provide default empty object if needed
        }
      } catch (error) {
        console.error("Error fetching navigation data (client-side):", error);
        setErrorNav("Failed to load navigation data.");
      } finally {
        setLoadingNav(false);
      }
    };

    fetchNavData();
  }, []); // Empty dependency array, fetch once on mount

  return (
    <div className="page-wrapper">
      <div className="main-wrapper">
        {/* Render Navigation with fetched state data, handle loading/error */}
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
        {/* Render the page content passed as children */}
        {children}
      </div>
    </div>
  );
}
