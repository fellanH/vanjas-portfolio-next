"use client"; // Add use client directive

import React, { useState, useEffect } from "react"; // Import hooks
import Image from "next/image"; // Import next/image
import { contentfulClient } from "@/lib/contentfulClient"; // Import the client
import Navigation from "@/components/Navigation"; // Import the Navigation component
// Import the existing ImageGallery component
import ImageGallery from "@/components/ImageGallery";

// Renamed from HomePage, component is now a Client Component
export default function Page() {
  // State variables for gallery data, loading, and errors
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchFeaturedImages = async () => {
      // Read the public environment variable client-side
      const featuredImagesTypeId =
        process.env.NEXT_PUBLIC_CONTENTFUL_FEATURED_IMAGES_ID;

      if (!featuredImagesTypeId) {
        console.error(
          "Client Error: NEXT_PUBLIC_CONTENTFUL_FEATURED_IMAGES_ID environment variable must be set."
        );
        setError("Configuration error: Featured images ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await contentfulClient.getEntries({
          content_type: featuredImagesTypeId, // Use the public env var value
          limit: 1,
        });

        let fetchedGalleryData = [];
        if (
          response.items.length > 0 &&
          response.items[0].fields.imageGallery
        ) {
          fetchedGalleryData = response.items[0].fields.imageGallery;
        } else {
          console.warn(
            "No 'featuredImages' entry found or it has no imageGallery field."
          );
        }

        // Map the fetched data inside the effect
        const mappedItems = (fetchedGalleryData || [])
          .map((imageAsset) => {
            if (!imageAsset || !imageAsset.fields || !imageAsset.fields.file) {
              console.warn(
                "Skipping image due to missing asset data:",
                imageAsset?.sys?.id
              );
              return null;
            }
            const fileDetails = imageAsset.fields.file;
            if (
              !fileDetails?.url ||
              !fileDetails?.details?.image?.width ||
              !fileDetails?.details?.image?.height
            ) {
              console.warn(
                "Skipping image due to missing file data or dimensions:",
                imageAsset?.sys?.id
              );
              return null;
            }

            const imageUrl = fileDetails.url.startsWith("//")
              ? "https:" + fileDetails.url
              : fileDetails.url; // Ensure protocol
            const altText =
              imageAsset.fields.description ||
              imageAsset.fields.title ||
              "Featured image";
            const { width, height } = fileDetails.details.image;

            return {
              id: imageAsset.sys.id,
              imageUrl: imageUrl,
              altText: altText,
              width: width,
              height: height,
            };
          })
          .filter((item) => item !== null);

        setGalleryItems(mappedItems); // Update state with mapped items
      } catch (err) {
        console.error("Failed to fetch featured images for homepage:", err);
        setError("Failed to load featured images.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedImages();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div>
      <div className="layout-1">
        <div className="image-wrapper">
          <div
            className={`skeleton-loader ${
              imageLoaded ? "fade-out" : ""
            }`}></div>
          <Image
            src="/images/1-min.png"
            width={2048}
            height={1152}
            sizes="(max-width: 2048px) 100vw, 2048px"
            alt="Hero image 2"
            className={`main-image ${imageLoaded ? "fade-in" : "fade-out"}`}
            priority
            onLoad={() => setImageLoaded(true)}
          />
          <div className="arrow">
            <div className="text-block">--&gt;</div>
          </div>
        </div>
        <div className="below-image">
          <h3 className="sub-title">Vanja Hellström</h3>
          <h3 className="sub-desc">Selected Works</h3>
        </div>
      </div>

      {/* Conditionally render gallery based on state */}
      {loading && <div className="text-center p-10">Loading gallery...</div>}
      {error && (
        <div className="text-center p-10 text-red-600">Error: {error}</div>
      )}
      {!loading && !error && (
        <ImageGallery items={galleryItems} enableLinks={false} />
      )}
    </div>
  );
}
