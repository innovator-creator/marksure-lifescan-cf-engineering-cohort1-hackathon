import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";
import { setDefaultResultOrder } from "dns";

// Force IPv4 for all DNS lookups — fixes ENOTFOUND on Windows
setDefaultResultOrder("ipv4first");
dns.setDefaultResultOrder("ipv4first");

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  // Force Node.js to use IPv4 for all outbound requests
  serverExternalPackages: [],
};

export default nextConfig;