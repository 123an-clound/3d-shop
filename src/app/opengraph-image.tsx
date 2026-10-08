import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/data";

export const alt = "Đồ chơi in 3D và máy in 3D";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Satori's built-in font lacks Vietnamese glyphs, so load a subset of Be Vietnam Pro for exactly this text. */
async function loadFont(text: string) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700&text=${encodeURIComponent(text)}`)).text();
  const url = css.match(/src: url\((.+?)\) format/)?.[1];
  if (!url) throw new Error("OG font not found");
  return (await fetch(url)).arrayBuffer();
}

export default async function OgImage() {
  const { site } = await getSettings();
  const title = site.name;
  const tagline = site.tagline || site.description;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "radial-gradient(circle at 75% 20%, #0e3a46 0%, #0b0d12 55%)",
          color: "#e8ecf4",
          fontFamily: "BVP",
        }}
      >
        <div style={{ display: "flex", width: 96, height: 96, borderRadius: 24, border: "4px solid #22d3ee", marginBottom: 40 }} />
        <div style={{ fontSize: 84, lineHeight: 1.05 }}>{title}</div>
        <div style={{ fontSize: 38, color: "#9aa3b5", marginTop: 24, maxWidth: 1000 }}>{tagline}</div>
        <div style={{ display: "flex", marginTop: 48, height: 8, width: 360, background: "#22d3ee", borderRadius: 4 }} />
      </div>
    ),
    { ...size, fonts: [{ name: "BVP", data: await loadFont(title + tagline), weight: 700, style: "normal" }] },
  );
}
