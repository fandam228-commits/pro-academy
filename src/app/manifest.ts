import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Professional Academy — منصة مستر حبيب الرحمن",
    short_name: "Pro Academy",
    description:
      "منصة تعلم الإنجليزية للثانوية العامة والإعدادية — كورسات، بنك أسئلة ذكي، اختبارات، مكتبة PDF محمية.",
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#2563eb",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "مكتبة PDF",
        short_name: "PDF Library",
        url: "/?tab=pdfs",
        description: "المذكرات والشيتات المحمية",
      },
      {
        name: "بنك الأسئلة الذكي",
        short_name: "Question Bank",
        url: "/?tab=question_bank",
        description: "توليد امتحانات بدون تكرار",
      },
      {
        name: "لوحة التحكم",
        short_name: "Dashboard",
        url: "/?tab=dashboard",
        description: "تقدمك ونتائجك",
      },
    ],
  };
}
