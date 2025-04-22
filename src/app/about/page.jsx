"use client"; // Add use client directive

import React, { useState, useEffect } from "react"; // Import hooks
import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
// Import the shared Contentful client configured for NEXT_PUBLIC_ variables
import { contentfulClient } from "@/lib/contentfulClient";
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation"; // Keep Navigation if still needed visually
import ShimmerImage from "@/components/ShimmerImage"; // Changed import path

// Remove local client initialization and server-side env var checks
// const spaceId = process.env.CONTENTFUL_SPACE_ID;
// ... etc ...
// const client = createClient(...);

// Remove server-side fetch function
// async function getAboutData() { ... }

// This is now a Client Component
export default function AboutPage() {
  // State for about data, loading, and errors
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      // Read the public environment variable client-side
      const aboutContentTypeId =
        process.env.NEXT_PUBLIC_CONTENTFUL_CONTENT_TYPE_ID_ABOUT;

      if (!aboutContentTypeId) {
        console.error(
          "Client Error: NEXT_PUBLIC_CONTENTFUL_CONTENT_TYPE_ID_ABOUT environment variable must be set."
        );
        setError("Configuration error: About content type ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Use the shared client to fetch data
        const response = await contentfulClient.getEntries({
          content_type: aboutContentTypeId,
          "fields.slug": "about", // Fetch the entry with slug 'about'
          limit: 1,
          include: 1, // Include linked assets (the image)
        });

        if (response.items.length > 0) {
          setAboutData(response.items[0]); // Set the entire entry
        } else {
          console.warn(
            "No 'About' page entry found in Contentful with slug 'about'."
          );
          notFound(); // Trigger 404 if entry not found
        }
      } catch (err) {
        console.error(
          "Error fetching data from Contentful (client-side):",
          err
        );
        setError("Failed to load about page data.");
        // Optionally call notFound() here too
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []); // Empty dependency array, run once on mount

  // Render loading state
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="main-wrapper flex justify-center items-center min-h-screen">
          <p>Loading about information...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="page-wrapper">
        <div className="main-wrapper flex justify-center items-center min-h-screen">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // Render 404 or null if data is missing (though notFound should handle this)
  if (!aboutData) {
    // This case might be redundant if notFound() is called correctly above
    return null;
  }

  // Extract data from state once loaded
  const { profileImage, aboutMeLong, name } = aboutData.fields;

  // Extract image details safely
  const imageUrl = profileImage?.fields?.file?.url;
  const imageWidth = profileImage?.fields?.file?.details?.image?.width;
  const imageHeight = profileImage?.fields?.file?.details?.image?.height;
  const imageAlt =
    profileImage?.fields?.description ||
    profileImage?.fields?.title ||
    name ||
    "Profile image";

  return (
    <div className="page-wrapper">
      <div className="main-wrapper">
        <div className="main-grid" style={{ paddingTop: "4rem" }}>
          <div className="grid-spacer"></div>
          {imageUrl && imageWidth && imageHeight ? (
            <div>
              <ShimmerImage
                src={imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl}
                alt={imageAlt}
                width={imageWidth}
                height={imageHeight}
                priority
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          ) : (
            /* Optional: Placeholder if image missing */
            <div>Image not available</div>
          )}
          <div>
            {aboutMeLong ? (
              documentToReactComponents(aboutMeLong)
            ) : (
              <p>No description available.</p>
            )}
          </div>
          <div className="grid-spacer"></div>
        </div>
      </div>
    </div>
  );
}

// Remove generateMetadata as it's not used in Client Components
// export async function generateMetadata() { ... }
