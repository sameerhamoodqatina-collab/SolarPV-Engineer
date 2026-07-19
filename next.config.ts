import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";

let assetPrefix = "";
let basePath = "";
let output: NextConfig["output"];

if (isGithubActions) {
  const repo = process.env.GITHUB_REPOSITORY?.replace(/.*?\//, "");
  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
  output = "export";
}

const nextConfig: NextConfig = {
  ...(output ? { output } : {}),
  basePath,
  assetPrefix,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
