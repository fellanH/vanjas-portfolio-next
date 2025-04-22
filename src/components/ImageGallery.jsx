"use client"; // No longer needed for useState

import React, { useState } from "react";
import Image from "next/image"; // Reverted from ShimmerImage
import Masonry from "react-masonry-css"; // Import Masonry

// Define breakpoint columns for Masonry layout
const breakpointColumnsObj = {
  default: 2, // Default number of columns
  700: 1, // 1 column on screens 700px and below (adjust breakpoint as needed)
};

/**
 * Renders an image gallery using react-masonry-css.
 * Optionally links images to PDFs or opens them in a lightbox.
 * @param {Object} props - Component props.
 * @param {Array} props.items - Array of items to display. Each item should have:
 *   id, imageUrl, altText, width, height. Optionally: pdfUrl.
 * @param {boolean} [props.enableLinks=true] - Whether to wrap images in links (using pdfUrl if available).
 */
export default function ImageGallery({
  items = [],
  enableLinks = true, // Default to true if not specified
}) {
  // Track loading state for each image
  const [loadedImages, setLoadedImages] = useState({});

  const getValidImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("//") ? `https:${url}` : url;
  };

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid" // Use CSS classes for react-masonry-css
        columnClassName="my-masonry-grid_column">
        {items.map((item, index) => {
          const imageUrl = getValidImageUrl(item.imageUrl);

          // ** UPDATED: Basic validation only **
          if (!imageUrl || !item.width || !item.height) {
            console.warn(
              `Skipping item due to missing image data: ${item.id}` // Updated message
            );
            return null;
          }

          // Original Image component with loading effect
          const originalImageElement = (
            <div className="image-container">
              <div
                className={`skeleton-loader ${
                  loadedImages[item.id] ? "fade-out" : ""
                }`}></div>
              <Image // Reverted from ShimmerImage
                src={imageUrl}
                alt={item.altText}
                width={item.width}
                height={item.height}
                placeholder="blur" // Restored placeholder
                blurDataURL={imageUrl + "?w=10&q=10&fm=webp"} // Restored blurDataURL
                className={`image-2 ${
                  loadedImages[item.id] ? "fade-in" : "fade-out"
                }`}
                onLoad={() => handleImageLoad(item.id)}
              />
            </div>
          );

          // Hover Overlay Element (only if projectName exists)
          const hoverOverlay = item.projectName ? (
            <div className="gallery-item-overlay">
              <span className="gallery-item-project-name">
                {item.projectName}
              </span>
            </div>
          ) : null;

          // Base element wrapper (contains image and overlay)
          const galleryItemContent = (
            <div className="gallery-item-wrapper">
              {originalImageElement}
              {hoverOverlay}
            </div>
          );

          // ** UPDATED: Wrap galleryItemContent based on props **

          if (enableLinks && item.pdfUrl) {
            // Wrap in Link
            return (
              <a
                key={item.id} // Key on the outer element
                href={item.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gallery-pdf-link" // Keep this class if needed
              >
                {galleryItemContent} {/* Contains image + overlay */}
              </a>
            );
          } else {
            // Render plain content (image + overlay wrapper)
            // Key needs to be on the outer element returned from map
            return React.cloneElement(galleryItemContent, { key: item.id });
          }
        })}
      </Masonry>
    </>
  );
}
