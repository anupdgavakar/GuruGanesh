import type { NextConfig } from "next";

/**
 * next/image needs every remote host it will load from allow-listed. The
 * Laravel API serves uploaded images off its own `public` disk
 * (`/storage/...`), on the same host as the API itself, so we derive the
 * pattern from API_URL instead of hardcoding it twice. Mirrors web/next.config.ts.
 */
function apiRemotePattern() {
  try {
    const url = new URL(process.env.API_URL ?? "http://localhost:8000");
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
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/storage/**" },
      ...(apiPattern ? [apiPattern] : []),
    ],
  },
};

export default nextConfig;
