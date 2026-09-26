import type { MetadataRoute } from "next";

// Lets phones "Add to Home Screen" and open the app full-screen, without a store listing.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Utiligo",
    short_name: "Utiligo",
    description: "Water refills, LPG, laundry pickup, and garbage collection from merchants near you.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
