import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aumentar límite para subir múltiples imágenes
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
