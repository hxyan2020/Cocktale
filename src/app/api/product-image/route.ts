import { NextRequest, NextResponse } from "next/server";

const ANGLE_LABEL: Record<string, string> = {
  hero: "Hero",
  front: "Front",
  side: "Side 45°",
  detail: "Detail",
  packaging: "Packaging",
  lifestyle: "In use",
};

const KIND_COLOR: Record<string, [string, string]> = {
  tool: ["#3d4a3a", "#c4a35a"],
  glass: ["#1c3a4a", "#9ec9d9"],
  default: ["#4a3422", "#e0b56a"],
};

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const name = sp.get("name") || "Product";
  const angle = sp.get("angle") || "front";
  const seed = sp.get("seed") || name;
  const kind = sp.get("kind") || "default";
  const [bg, accent] = KIND_COLOR[kind] || KIND_COLOR.default;

  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  const rot = (hash % 24) - 12;
  const label = ANGLE_LABEL[angle] || angle;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#1c1610"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <rect width="1000" height="1000" fill="url(#g)"/>
  <circle cx="720" cy="220" r="180" fill="${accent}" opacity="0.22" filter="url(#soft)"/>
  <circle cx="220" cy="780" r="220" fill="${accent}" opacity="0.12" filter="url(#soft)"/>
  <g transform="translate(500 480) rotate(${rot})">
    <rect x="-160" y="-220" width="320" height="420" rx="36" fill="#f7f3eb" opacity="0.92"/>
    <rect x="-120" y="-170" width="240" height="260" rx="18" fill="${accent}" opacity="0.35"/>
    <rect x="-70" y="120" width="140" height="28" rx="8" fill="#1c1610" opacity="0.55"/>
  </g>
  <text x="500" y="860" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#f7f3eb">${escapeXml(name.slice(0, 42))}</text>
  <text x="500" y="910" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="24" fill="${accent}">${escapeXml(label)} angle</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
