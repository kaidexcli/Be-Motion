import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Backwards-compatible aliases for the names already used in this project.
    // Both values are intentionally public Supabase browser credentials.
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_SUPABASE_URL ?? process.env.NEXT_SUPABASE_API_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_SUPABASE_PUBLIC_KEY,
  },
};

export default nextConfig;
