import Image from "next/image"; // Import next/image
import { contentfulClient } from "@/lib/contentfulClient"; // Import the client
import Navigation from "@/components/Navigation"; // Import the Navigation component
// Import the existing ImageGallery component
import ImageGallery from "@/components/ImageGallery";

// Read Content Type ID from environment variable
const CONTENTFUL_FEATURED_IMAGES_ID = process.env.CONTENTFUL_FEATURED_IMAGES_ID;

// Renamed from HomePage, kept async for server-side data fetching
export default async function Page() {
  let featuredImageGallery = []; // Default to empty array

  // Validate Featured Images Type ID
  if (!CONTENTFUL_FEATURED_IMAGES_ID) {
    console.error(
      "Runtime Error: CONTENTFUL_FEATURED_IMAGES_ID environment variable must be set."
    );
    // Handle error appropriately - perhaps show an error message component
    // For now, we will render the page with an empty gallery.
  } else {
    try {
      // Fetch the 'featuredImages' entry (expecting only one)
      const response = await contentfulClient.getEntries({
        content_type: CONTENTFUL_FEATURED_IMAGES_ID, // Use new env var
        limit: 1, // Assuming only one entry of this type
      });

      // Extract the imageGallery from the first item, if it exists
      if (response.items.length > 0 && response.items[0].fields.imageGallery) {
        featuredImageGallery = response.items[0].fields.imageGallery;
      } else {
        console.warn(
          "No 'featuredImages' entry found or it has no imageGallery field."
        );
      }
    } catch (error) {
      console.error("Failed to fetch featured images for homepage:", error);
      // featuredImageGallery remains [], page will render without the gallery images
      // Consider showing an error message to the user
    }
  }

  // Map the fetched data to the format expected by ImageGallery
  const galleryItems = (featuredImageGallery || [])
    .map((imageAsset) => {
      if (!imageAsset || !imageAsset.fields || !imageAsset.fields.file) {
        console.warn(
          "Skipping image due to missing asset data:",
          imageAsset?.sys?.id
        );
        return null; // Skip this item
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
        return null; // Skip this item
      }

      const imageUrl = "https:" + fileDetails.url;
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
        // Add projectName, projectSlug, categorySlug if needed and available
        // projectName: imageAsset.fields.projectName || null,
        // projectSlug: imageAsset.fields.projectSlug || null,
        // categorySlug: imageAsset.fields.categorySlug || null,
      };
    })
    .filter((item) => item !== null); // Remove null entries

  return (
    <div>
      <div className="layout-1">
        <Image
          src="/images/2-min.png"
          width={2048}
          height={1152}
          sizes="(max-width: 2048px) 100vw, 2048px"
          alt="Hero image 1"
          className="image"
          priority
        />
        <div className="parallax_image"></div>
        <div className="image-wrapper">
          <Image
            src="/images/1-min.png"
            width={2048}
            height={1152}
            sizes="(max-width: 2048px) 100vw, 2048px"
            alt="Hero image 2"
            className="main-image"
            priority
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
      {/* Render the ImageGallery component with the mapped data */}
      <ImageGallery items={galleryItems} enableLinks={false} />
    </div>
  );
}
