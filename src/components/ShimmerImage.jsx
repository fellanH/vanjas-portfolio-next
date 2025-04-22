"use client";

import Image from "next/image";
import { useState } from "react";

function shimmer(w, h) {
  return `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;
}

function toBase64(str) {
  return typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);
}

export default function ShimmerImage(props) {
  const [isLoading, setIsLoading] = useState(true);
  const { src, alt, width, height, sizes, className, ...rest } = props;

  // Determine width and height for placeholder, prioritizing props
  // Use default values if not provided, necessary for shimmer SVG generation
  const effectiveWidth = width || 300; // Default width if not specified
  const effectiveHeight = height || 200; // Default height if not specified

  // Ensure sizes prop is provided if layout is responsive or fill
  // Use a default sizes prop if necessary and layout implies it
  const effectiveSizes =
    sizes ||
    (props.fill || props.layout === "responsive" || props.layout === "fill"
      ? "100vw"
      : undefined);

  return (
    <Image
      src={src || "/placeholder.png"} // Provide a fallback src if needed
      alt={alt || ""}
      width={width}
      height={height}
      sizes={effectiveSizes}
      className={`${className || ""} ${
        isLoading
          ? "grayscale blur-xl scale-105"
          : "grayscale-0 blur-0 scale-100"
      } transition-all duration-700 ease-in-out`}
      placeholder="blur"
      blurDataURL={`data:image/svg+xml;base64,${toBase64(
        shimmer(effectiveWidth, effectiveHeight)
      )}`}
      onLoadingComplete={() => setIsLoading(false)}
      {...rest}
      // Ensure layout prop is passed if present, otherwise rely on width/height
      {...(props.layout && { layout: props.layout })}
      {...(props.fill && { fill: props.fill })}
    />
  );
}
