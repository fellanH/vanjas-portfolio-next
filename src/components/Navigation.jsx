"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Make the component a regular function, accept props
export default function Navigation({ categories = [], aboutInfo = null }) {
  const pathname = usePathname();

  // Extract contact details with fallbacks
  const email = aboutInfo?.email || "yourname@gmail.com";
  const phoneNumber = aboutInfo?.phoneNumber || "+46000000000";
  const instagramUrl = aboutInfo?.instagram || "https://instagram.com";
  const shortDescription =
    aboutInfo?.aboutMeShort || "Short description missing.";

  return (
    <div className="page-head">
      <div className="column head">
        <Link href="/" className="heading">
          Vanja Edevåg Hellström
        </Link>
      </div>
      <div className="column">
        {/* Assuming you want an About page at /about */}
        <Link href="/about" className="heading link">
          About --&gt;
        </Link>
        <div className="list padding">
          <p className="text">
            {shortDescription}
            <br />
          </p>
        </div>
      </div>
      <div className="column">
        <div className="heading">Projects</div>
        <div className="list">
          {categories.length > 0 ? (
            categories.map((category) => {
              if (!category?.fields?.slug || !category?.fields?.name) {
                return null;
              }
              const categoryPath = `/${category.fields.slug}`;
              const isActive = pathname === categoryPath;

              return (
                <p className="text" key={category.sys.id}>
                  <Link
                    href={categoryPath}
                    className={`new_link ${isActive ? "active" : ""}`}>
                    {category.fields.name}
                  </Link>
                </p>
              );
            })
          ) : (
            <p className="text">No categories found.</p>
          )}
        </div>
      </div>
      <div className="column">
        <div className="heading">Contact</div>
        <div className="list">
          <p className="text">
            <a href={`mailto:${email}`} className="new_link">
              {email}
            </a>
          </p>
          <p className="text">
            <a
              href={`tel:${phoneNumber.replace(/\s+/g, "")}`}
              className="new_link">
              {" "}
              {/* Remove spaces for tel link */}
              {phoneNumber}
            </a>
          </p>
          <p className="text">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="new_link">
              Instagram
            </a>
          </p>
        </div>
        <div className="list"></div>
      </div>
    </div>
  );
}
