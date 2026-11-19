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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #08101E 0%, #0E1E38 50%, #1E3A8A 100%)",
          borderRadius: 38,
          position: "relative",
          overflow: "hidden",
          border: "2px solid rgba(253, 230, 138, 0.4)",
        }}
      >
        {/* Ambient Glow */}
        <div
          style={{
            position: "absolute",
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(0,0,0,0) 70%)",
          }}
        />

        <svg viewBox="0 0 100 85" width="120" height="102">
          {/* Top Star */}
          <polygon points="50,6 52,11 57,11 53,14 55,19 50,16 45,19 47,14 43,11 48,11" fill="#FDE68A" />
          <polygon points="35,11 36.5,14.5 40,14.5 37,16.5 38.5,20 35,18 31.5,20 33,16.5 30,14.5 33.5,14.5" fill="#F59E0B" opacity="0.85" />
          <polygon points="65,11 66.5,14.5 70,14.5 67,16.5 68.5,20 65,18 61.5,20 63,16.5 60,14.5 63.5,14.5" fill="#F59E0B" opacity="0.85" />

          {/* Book behind/below cap */}
          <path d="M 50 56 C 42 53, 31 53, 24 55 L 24 67 C 31 65, 42 65, 50 68 Z" fill="#E2E8F0" opacity="0.95" />
          <path d="M 50 56 C 58 53, 69 53, 76 55 L 76 67 C 69 65, 58 65, 50 68 Z" fill="#CBD5E1" opacity="0.9" />
          <line x1="49.5" y1="56" x2="49.5" y2="68" stroke="#F59E0B" strokeWidth="1" />

          {/* Cap Skull */}
          <path d="M 33 37 L 33 45 C 33 51, 40 55, 50 55 C 60 55, 67 51, 67 45 L 67 37 Z" fill="#1E293B" />
          <path d="M 33 45 C 33 51, 40 55, 50 55 C 60 55, 67 51, 67 45" fill="none" stroke="#FDE68A" strokeWidth="1" />

          {/* Cap Mortarboard Diamond */}
          <polygon points="50,19 18,33 50,45 82,33" fill="#FFFFFF" />
          <polygon points="50,19 82,33 50,45" fill="#E2E8F0" />
          <circle cx="50" cy="32" r="2.5" fill="#F59E0B" />

          {/* Golden Tassel */}
          <path d="M 50 32 Q 70 32 77 41" fill="none" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="76" y="41" width="2.5" height="10" rx="1.2" fill="#F59E0B" />
        </svg>

        {/* Golden Habib Pill (HTML element, fully supported by next/og ImageResponse) */}
        <div
          style={{
            marginTop: 4,
            padding: "2px 16px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)",
            color: "#0A1628",
            fontWeight: 900,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          حبيب
        </div>
      </div>
    ),
    { ...size }
  );
}
