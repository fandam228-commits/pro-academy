import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Professional Academy — منصة مستر حبيب الرحمن",
    short_name: "Pro Academy",
    description: "بوابتك الرسمية للتميز والتفوق في اللغة الإنجليزية - للمرحلتين الإعدادية والثانوية",
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0E1E38",
    theme_color: "#0E1E38",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "الرئيسية",
        short_name: "الرئيسية",
        url: "/",
        description: "الصفحة الرئيسية للأكاديمية",
      },
      {
        name: "بنك الأسئلة الذكي",
        short_name: "بنك الأسئلة",
        url: "/?tab=question_bank",
        description: "آلاف الأسئلة وتوليد الامتحانات",
      },
      {
        name: "أكاديمية الترجمة",
        short_name: "الترجمة",
        url: "/?tab=translation_academy",
        description: "تدريبات الترجمة المتقدمة",
      },
      {
        name: "عالم القصص",
        short_name: "القصص",
        url: "/?tab=story_world",
        description: "القصص الأدبية المقررة",
      },
    ],
  };
}
