import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 旧 URL（/exams）を新しい問題集のページへ転送する
  async redirects() {
    return [
      { source: "/exams", destination: "/#question-sets", permanent: true },
      { source: "/exams/:id", destination: "/question-sets/:id", permanent: true },
    ];
  },
};

export default nextConfig;
