import React from "react";
import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { createClient } from "contentful";
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";

// Ensure environment variables are defined
const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const contentTypeId = process.env.CONTENTFUL_CONTENT_TYPE_ID_ABOUT;

if (!spaceId || !accessToken || !contentTypeId) {
  throw new Error("Contentful environment variables are not set.");
}

// Initialize Contentful client
const client = createClient({
  space: spaceId,
  accessToken: accessToken,
});

// Fetch function (runs server-side)
async function getAboutData() {
  try {
    const response = await client.getEntries({
      content_type: contentTypeId,
      "fields.slug": "about", // Fetch the entry with slug 'about'
      limit: 1,
      include: 1, // Include linked assets (the image)
    });

    if (response.items.length > 0) {
      return response.items[0];
    } else {
      console.warn(
        "No 'About' page entry found in Contentful with slug 'about'."
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching data from Contentful:", error);
    // Consider throwing an error or returning a specific state
    return null;
  }
}

// This is now a Server Component
export default async function AboutPage() {
  const entry = await getAboutData();

  // If no entry is found, render the 404 page
  if (!entry) {
    notFound();
  }

  const { profileImage, aboutMeLong, name } = entry.fields;

  // Extract image details safely
  const imageUrl = profileImage?.fields?.file?.url;
  const imageWidth = profileImage?.fields?.file?.details?.image?.width;
  const imageHeight = profileImage?.fields?.file?.details?.image?.height;
  // Prefer description for alt text, fall back to title, then name
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
          {imageUrl && imageWidth && imageHeight && (
            <div>
              <Image
                // Ensure the URL starts with https:
                src={imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl}
                alt={imageAlt}
                width={imageWidth}
                height={imageHeight}
                priority // Prioritize loading the main image
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          )}
          <div>
            {/* Render rich text or a default message */}
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

// Optional: Add metadata generation
export async function generateMetadata() {
  const entry = await getAboutData();
  const title = entry?.fields?.name || "About Me";
  const description =
    entry?.fields?.aboutMeShort || "Information about the site owner."; // Use the short description field

  return {
    title: title,
    description: description,
  };
}
