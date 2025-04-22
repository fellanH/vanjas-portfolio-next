"use client"; // Add use client directive

import React, { useState, useEffect } from "react"; // Import hooks
import { notFound, useParams } from "next/navigation"; // Import useParams
import {
  getCategoryBySlug,
  getProjectsByCategory,
} from "@/lib/contentfulClient"; // Keep data fetching functions
import Navigation from "@/components/Navigation";
import ImageGallery from "@/components/ImageGallery";

// Add runtime export for Cloudflare Pages compatibility
export const runtime = "edge";

// Remove generateStaticParams function entirely
// export async function generateStaticParams() { ... }

export default function CategoryPage() {
  // Remove params from props, use hook instead
  const params = useParams(); // Get params using the hook
  const categorySlug = params.categorySlug;

  // State variables
  const [category, setCategory] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch data
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let fetchedCategory = null; // Temp var for category

      try {
        // Fetch the specific category details using the slug
        fetchedCategory = await getCategoryBySlug(categorySlug);

        if (!fetchedCategory) {
          // Use notFound directly if category fetch returns null/undefined
          notFound();
          return; // Stop execution if category not found
        }

        setCategory(fetchedCategory); // Set category state

        // Fetch projects using the category's ID
        const fetchedProjects = await getProjectsByCategory(
          fetchedCategory.sys.id
        );
        setProjects(fetchedProjects || []); // Set projects state, default to empty array if fetch fails/returns null
      } catch (err) {
        console.error(
          `Failed to fetch data for category ${categorySlug}:`,
          err
        );
        setError("Failed to load category data.");
        // Check if the error indicates "not found" specifically, otherwise show generic error
        // If getCategoryBySlug throws a specific error for not found, handle it here
        // For now, a general error message is set. We could call notFound() here too if appropriate.
      } finally {
        setLoading(false); // Set loading to false regardless of success/error
      }
    };

    fetchData(); // Call the fetch function
  }, [categorySlug]); // Re-run effect if categorySlug changes

  // Handle loading state
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="main-wrapper flex justify-center items-center min-h-screen">
          <p>Loading category...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    // Note: If notFound() was called in useEffect, this might not be reached
    // depending on how Next.js handles notFound() in client components.
    // Consider rendering a specific error component or message.
    return (
      <div className="page-wrapper">
        <div className="main-wrapper flex justify-center items-center min-h-screen">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // Prepare items for the ImageGallery (only run if not loading/error)
  const galleryItems = projects
    .map((project) => {
      const firstImageAsset = project.fields.gallery?.[0];
      const pdfAsset = project.fields.pdf;

      // Keep the existing validation logic
      if (
        !firstImageAsset?.fields?.file?.url ||
        !firstImageAsset?.fields?.file?.details?.image
      ) {
        console.warn(
          `Skipping project ${project.fields.projectName} due to missing first image data`
        );
        return null;
      }

      const pdfUrl = pdfAsset?.fields?.file?.url;
      if (!pdfUrl) {
        console.warn(
          `Skipping project ${project.fields.projectName} due to missing PDF URL`
        );
        return null;
      }

      const { width, height } = firstImageAsset.fields.file.details.image;
      const altText =
        firstImageAsset.fields.description ||
        firstImageAsset.fields.title ||
        project.fields.projectName ||
        "Project image";

      return {
        id: project.sys.id,
        imageUrl: firstImageAsset.fields.file.url,
        altText: altText,
        width: width,
        height: height,
        projectName: project.fields.projectName,
        pdfUrl: pdfUrl.startsWith("//") ? `https:${pdfUrl}` : pdfUrl, // Ensure protocol
      };
    })
    .filter((item) => item !== null);

  // Render the gallery once data is loaded
  return (
    <div className="page-wrapper">
      <div className="main-wrapper">
        {/* Optionally display category title or other info here */}
        {/* <h1>{category?.fields?.title}</h1> */}
        <ImageGallery items={galleryItems} />
      </div>
    </div>
  );
}
