import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // 정적 내보내기 시 이미지 최적화 비활성화 필수
  },
};

export default nextConfig;
