import { Inter } from "next/font/google";
import "@/app/globals.css";
import { contentfulClient } from "@/lib/contentfulClient"; // Import Contentful client
import Navigation from "@/components/Navigation"; // Import Navigation component

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

// Metadata can be exported directly in JS/JSX files
export const metadata = {
  title: "Vanjas Portfolio",
  description: "My portfolio",
};

// Fetch data for Navigation
async function getNavigationData() {
  let categories = [];
  let aboutInfo = null;
  try {
    const categoryResponse = await contentfulClient.getEntries({
      content_type: "categories",
      select: "fields.name,fields.slug",
      order: "fields.name",
    });
    categories = categoryResponse.items;

    const aboutResponse = await contentfulClient.getEntries({
      content_type: "about",
      limit: 1,
    });
    if (aboutResponse.items.length > 0) {
      aboutInfo = aboutResponse.items[0].fields;
    }
  } catch (error) {
    console.error("Error fetching navigation data in layout:", error);
  }
  return { categories, aboutInfo };
}

// Make layout async to fetch data
export default async function RootLayout({ children }) {
  const { categories, aboutInfo } = await getNavigationData();

  return (
    <html lang="en">
      {/* Apply the font class to the body */}
      <body className={inter.className}>
        {/* Mimic structure from page.jsx */}
        <div className="page-wrapper">
          <div className="main-wrapper">
            {/* Render Navigation with fetched data */}
            <Navigation categories={categories} aboutInfo={aboutInfo} />
            {/* Render the rest of the page content */}
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
