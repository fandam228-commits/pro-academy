import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb, #4f46e5, #0ea5e9)",
          borderRadius: 40,
        }}
      >
        <svg viewBox="0 0 100 100" width="120" height="120" fill="white">
          <polygon points="50,15 90,40 50,65 10,40" opacity="0.95" />
          <path d="M25,48 v20 c0,10 11,18 25,18 s25,-8 25,-18 v-20 l-25,14 z" opacity="0.8" />
          <rect x="84" y="44" width="4" height="28" rx="2" />
          <circle cx="86" cy="78" r="5" fill="#fbbf24" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
