import { createClient } from "contentful";

// Use NEXT_PUBLIC_ prefixed variables for client-side access
const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

// The check remains the same, but now checks the NEXT_PUBLIC_ variables
if (!space || !accessToken) {
  throw new Error(
    "Contentful Space ID and Access Token must be provided using NEXT_PUBLIC_ prefix in environment variables"
  );
}

export const contentfulClient = createClient({
  space: space,
  accessToken: accessToken,
});

// Function to fetch category details by slug
export async function getCategoryBySlug(slug) {
  const response = await contentfulClient.getEntries({
    content_type: "categories",
    "fields.slug": slug, // Filter by slug field
    limit: 1,
  });
  return response.items[0] || null;
}

// Function to fetch projects by category ID
export async function getProjectsByCategory(categoryId) {
  const response = await contentfulClient.getEntries({
    content_type: "projects",
    "fields.category.sys.id": categoryId, // Filter by linked category entry ID
    include: 1, // Include linked assets (like gallery images)
  });
  return response.items;
}

// Function to fetch a single project by slug
export async function getProjectBySlug(slug) {
  const response = await contentfulClient.getEntries({
    content_type: "projects",
    "fields.slug": slug, // Ensure this is also using slug
    include: 2, // Include linked category and gallery images
    limit: 1,
  });
  return response.items[0] || null;
}
