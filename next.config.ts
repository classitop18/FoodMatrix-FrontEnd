import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        // https://www.freepik.com/
        protocol: "https",
        hostname: "www.freepik.com",
        pathname: "/**",
      },
      {
        // CloudFront CDN for S3 uploads
        protocol: "https",
        hostname: "d8k560yezazuw.cloudfront.net",
        pathname: "/**",
      },

    ],
  },
};

export default nextConfig;
