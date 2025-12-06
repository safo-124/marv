import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for subdomain routing
  experimental: {
    // Allow dynamic params in routes
  },
  
  async rewrites() {
    return {
      beforeFiles: [
        // Super Admin subdomain (admin.marv.com or admin.localhost)
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "admin.(?<domain>.+)",
            },
          ],
          destination: "/super-admin/:path*",
        },
        // Hospital subdomain ({slug}.marv.com) - must have at least 2 dots (subdomain.domain.tld)
        // Excludes localhost and simple domain names
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "(?<slug>[^.]+)\\.(?<domain>[^.]+\\.[^.]+)",
            },
          ],
          missing: [
            {
              type: "host",
              value: "admin\\..*",
            },
          ],
          destination: "/hospital/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
