"use client";

import React, { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { getProjectBySlug } from "@/lib/contentfulClient";
import Navigation from "@/components/Navigation";
import ImageGallery from "@/components/ImageGallery";

// Add runtime export for Cloudflare Pages compatibility
export const runtime = "edge";

// Remove build-time environment variable checks
// if (!CONTENTFUL_PROJECT_TYPE_ID || !CONTENTFUL_CATEGORY_TYPE_ID) { ... }

// Remove generateStaticParams function entirely
// export async function generateStaticParams() { ... }

// The page now uses hooks to get params and manage state
export default function ProjectPage() {
  const params = useParams();
  const { categorySlug, projectSlug } = params;

  // State variables
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedProject = await getProjectBySlug(projectSlug);

        if (!fetchedProject) {
          notFound(); // Show 404 if project doesn't exist
          return;
        }

        // Validate that the project actually belongs to the categorySlug from the URL
        const projectCategory = fetchedProject.fields.category?.fields;
        if (!projectCategory || projectCategory.slug !== categorySlug) {
          console.warn(
            `Project ${projectSlug} found but does not belong to category ${categorySlug} (Project category: ${projectCategory?.slug}). Redirecting to 404.`
          );
          notFound(); // Project exists but wrong category URL
          return;
        }

        setProject(fetchedProject); // Set the project state
      } catch (err) {
        console.error(
          `Failed to fetch data for project ${projectSlug} in category ${categorySlug}:`,
          err
        );
        setError("Failed to load project data.");
        // Optionally call notFound() here too if the error implies the project wasn't found
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if slugs are available
    if (categorySlug && projectSlug) {
      fetchData();
    }
  }, [categorySlug, projectSlug]); // Re-run effect if slugs change

  // Handle loading state
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="main-wrapper flex justify-center items-center min-h-screen">
          <Navigation /> {/* Keep navigation potentially */}
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="page-wrapper">
        <div className="main-wrapper flex justify-center items-center min-h-screen">
          <Navigation /> {/* Keep navigation potentially */}
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // Should not be reached if project is null due to notFound() calls, but good practice
  if (!project) {
    return null; // Or render a specific message if needed
  }

  // Prepare items for the ImageGallery (runs only after loading and no error)
  const galleryItems = (project.fields.gallery || [])
    .map((imageAsset) => {
      // Keep existing mapping and validation logic
      if (
        !imageAsset?.fields?.file?.url ||
        !imageAsset?.fields?.file?.details?.image
      ) {
        console.warn(
          `Skipping image ${imageAsset?.sys?.id} in project ${project.fields.projectName} due to missing data.`
        );
        return null;
      }

      const { width, height } = imageAsset.fields.file.details.image;
      const altText =
        imageAsset.fields.description ||
        imageAsset.fields.title ||
        `Image for ${project.fields.projectName}` ||
        "Project gallery image";

      return {
        id: imageAsset.sys.id,
        imageUrl: imageAsset.fields.file.url,
        altText: altText,
        width: width,
        height: height,
      };
    })
    .filter((item) => item !== null);

  // Render the gallery
  return (
    <div className="page-wrapper">
      <div className="main-wrapper">
        <Navigation />
        <ImageGallery items={galleryItems} enableLightbox={true} />
      </div>
    </div>
  );
}
