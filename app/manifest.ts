import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SageART — Warframe Portrait Art",
    short_name: "SageART",
    description: "Browse Warframe-themed portraits, preview them on your wall, and message the artist.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0b0f",
    theme_color: "#0a0b0f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
