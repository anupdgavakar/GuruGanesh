import type { NextConfig } from "next";

/**
 * next/image needs every remote host it will load from allow-listed.
 * The Laravel API serves uploaded images off its own `public` disk
 * (`/storage/...`), on the same host as the API itself, so we derive the
 * pattern from NEXT_PUBLIC_API_URL instead of hardcoding it twice.
 */
function apiRemotePattern() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000");
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/storage/**",
    };
  } catch {
    return null;
  }
}

const apiPattern = apiRemotePattern();

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      // Local Laravel dev server (php artisan serve default port).
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/storage/**" },
      ...(apiPattern ? [apiPattern] : []),
      // Stock photography for category tiles (see lib/category-images.ts) —
      // swap these for real product photography, uploaded as Sliders/Media
      // through the admin panel, once it exists.
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};

export default nextConfig;
