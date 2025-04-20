import React from "react";
import { notFound } from "next/navigation";
import {
  contentfulClient, // Import base client for generateStaticParams
  getCategoryBySlug,
  getProjectsByCategory, // Keep using getProjectsByCategory (requires category ID)
} from "@/lib/contentfulClient"; // Use path alias
import Navigation from "@/components/Navigation"; // Use path alias
import ImageGallery from "@/components/ImageGallery"; // Use path alias

// Read Content Type ID from environment variable (ensure it's validated elsewhere or add validation here)
const CONTENTFUL_CATEGORY_TYPE_ID = process.env.CONTENTFUL_CATEGORY_TYPE_ID;

// Fetch all category slugs at build time
export async function generateStaticParams() {
  // Add validation for the category type ID at build time
  if (!CONTENTFUL_CATEGORY_TYPE_ID) {
    console.error(
      "Build Error: CONTENTFUL_CATEGORY_TYPE_ID environment variable must be set."
    );
    throw new Error(
      "Missing CONTENTFUL_CATEGORY_TYPE_ID environment variable."
    );
  }

  try {
    const response = await contentfulClient.getEntries({
      content_type: CONTENTFUL_CATEGORY_TYPE_ID, // Use env var
      select: "fields.slug", // Only fetch the slug field
    });

    return response.items.map((category) => ({
      categorySlug: category.fields.slug,
    }));
  } catch (error) {
    console.error("Failed to generate static category paths:", error);
    return []; // Return empty array on error to avoid build failure
  }
}

export default async function CategoryPage({ params }) {
  const categorySlug = params.categorySlug;
  let category;
  let projects = []; // Default to empty array

  try {
    // Fetch the specific category details using the slug
    category = await getCategoryBySlug(categorySlug);
  } catch (error) {
    console.error(`Failed to fetch category ${categorySlug}:`, error);
    // Optionally, you could redirect to an error page or show a message
    // For now, we'll proceed to notFound if category isn't fetched
  }

  if (!category) {
    notFound(); // Show 404 if category doesn't exist or fetch failed
  }

  try {
    // Fetch projects using the category's ID only if category was found
    projects = await getProjectsByCategory(category.sys.id);
  } catch (error) {
    console.error(
      `Failed to fetch projects for category ${category.sys.id}:`,
      error
    );
    // Projects will remain an empty array, showing a message might be good UX
  }

  // Prepare items for the ImageGallery
  const galleryItems = projects
    .map((project) => {
      const firstImageAsset = project.fields.gallery?.[0];
      const pdfAsset = project.fields.pdf;

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

  return (
    <div className="page-wrapper">
      <div className="main-wrapper">
        <ImageGallery items={galleryItems} />
      </div>
    </div>
  );
}
