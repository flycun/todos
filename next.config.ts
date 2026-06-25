import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 通过 ALLOWED_ORIGINS 环境变量配置生产域名（逗号分隔），
      // 例如 EdgeOne 部署后："todo-app.edgeone.app"
      allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
        : ["localhost:3000"],
    },
  },
};

export default nextConfig;
