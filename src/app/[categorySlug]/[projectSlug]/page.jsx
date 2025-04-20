import React from "react";
import { notFound } from "next/navigation";
import {
  contentfulClient, // Import base client if adding generateStaticParams
  getProjectBySlug,
} from "@/lib/contentfulClient";
import Navigation from "@/components/Navigation";
import ImageGallery from "@/components/ImageGallery";

// Read Content Type IDs from environment variables
const CONTENTFUL_PROJECT_TYPE_ID = process.env.CONTENTFUL_PROJECT_TYPE_ID;
const CONTENTFUL_CATEGORY_TYPE_ID = process.env.CONTENTFUL_CATEGORY_TYPE_ID;

// Validate that the environment variables are set during build time
if (!CONTENTFUL_PROJECT_TYPE_ID || !CONTENTFUL_CATEGORY_TYPE_ID) {
  console.error(
    "Build Error: Contentful Content Type ID environment variables (CONTENTFUL_PROJECT_TYPE_ID, CONTENTFUL_CATEGORY_TYPE_ID) must be set in your .env file."
  );
  // Throwing an error halts the build if variables are missing
  throw new Error("Missing Contentful Content Type ID environment variables.");
}

// Generate static paths for all projects across all categories
export async function generateStaticParams() {
  console.log("Attempting to generate static paths...");
  try {
    // Fetch all projects and include the linked category entry (depth 1)
    const response = await contentfulClient.getEntries({
      content_type: CONTENTFUL_PROJECT_TYPE_ID,
      include: 1, // Include linked entries (like the category)
    });

    const projects = response.items;
    const includes = response.includes?.Entry || []; // Get included entries (categories)

    // Create a map of category IDs to their slugs for easy lookup
    const categorySlugMap = includes.reduce((map, entry) => {
      if (
        entry.sys.contentType.sys.id === CONTENTFUL_CATEGORY_TYPE_ID &&
        entry.fields.slug
      ) {
        map[entry.sys.id] = entry.fields.slug;
      }
      return map;
    }, {});

    // Filter projects and map to the required { categorySlug, projectSlug } format
    const validProjectPaths = projects
      .map((project) => {
        // Check if project has a slug and a linked category
        if (!project.fields.slug || !project.fields.category?.sys?.id) {
          console.warn(
            `Skipping project ${project.sys.id} due to missing slug or category link.`
          );
          return null;
        }
        // Get the category ID from the project's link field
        const categoryId = project.fields.category.sys.id;
        // Look up the category slug using the map
        const categorySlug = categorySlugMap[categoryId];

        // If the category slug was found, return the path object
        if (categorySlug) {
          return {
            categorySlug: categorySlug,
            projectSlug: project.fields.slug,
          };
        }
        console.warn(
          `Skipping project ${project.fields.slug} because its category slug (ID: ${categoryId}) could not be found in includes.`
        );
        return null; // Skip if category slug wasn't found
      })
      .filter((path) => path !== null); // Remove null entries

    // console.log("Generated project paths:", validProjectPaths); // Keep logging // Removed debug log
    console.log(
      `Successfully generated ${validProjectPaths.length} project paths.`
    );
    return validProjectPaths;
  } catch (error) {
    console.error("Failed to generate static project paths:", error);
    // Return empty array to prevent build failure but indicate an issue
    return [];
  }
}

// The page now receives both slugs
export default async function ProjectPage({ params }) {
  const { categorySlug, projectSlug } = params;
  const project = await getProjectBySlug(projectSlug); // Assume this also fetches linked category fields needed below

  if (!project) {
    notFound(); // Show 404 if project doesn't exist
  }

  // Validate that the project actually belongs to the categorySlug from the URL
  // Assuming getProjectBySlug includes category fields like name and slug
  const projectCategory = project.fields.category?.fields;
  if (!projectCategory || projectCategory.slug !== categorySlug) {
    console.warn(
      `Project ${projectSlug} found but does not belong to category ${categorySlug} (Project category: ${projectCategory?.slug}).`
    );
    notFound(); // Project exists but wrong category URL
  }

  // Prepare items for the ImageGallery
  const galleryItems = (project.fields.gallery || [])
    .map((imageAsset) => {
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
      // Ensure alt text is descriptive, favoring explicit descriptions/titles
      const altText =
        imageAsset.fields.description || // Best option: specific description
        imageAsset.fields.title || // Good option: specific title
        `Image for ${project.fields.projectName}` || // Fallback: context
        "Project gallery image"; // Generic fallback

      return {
        id: imageAsset.sys.id,
        imageUrl: imageAsset.fields.file.url,
        altText: altText,
        width: width,
        height: height,
      };
    })
    .filter((item) => item !== null);

  // Safely access category name, providing a fallback if needed
  const categoryName = projectCategory?.name || categorySlug; // Use slug as fallback name

  return (
    <div className="page-wrapper">
      <div className="main-wrapper">
        <Navigation />
        <ImageGallery items={galleryItems} enableLightbox={true} />
      </div>
    </div>
  );
}
