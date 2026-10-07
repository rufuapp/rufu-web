import type { NextConfig } from "next";

// 正式なアドレスは rufu.app。www.rufu.app・rufu.vercel.app は転送し、rufu.dev（検証用）は検索エンジンに載せない
const STAGING_HOSTS = "(?:www\\.)?rufu\\.dev";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 旧 URL（/exams）を新しい問題集のページへ転送する
      { source: "/exams", destination: "/exam#question-sets", permanent: true },
      { source: "/exams/:id", destination: "/question-sets/:id", permanent: true },
      // www.rufu.app と、Vercel が最初から付けるアドレス（rufu.vercel.app）は、正式なアドレスへ転送する
      { source: "/:path*", has: [{ type: "host", value: "(?:www\\.rufu\\.app|rufu\\.vercel\\.app)" }], destination: "https://rufu.app/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: STAGING_HOSTS }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
