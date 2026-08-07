import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Professional Academy — منصة مستر حبيب الرحمن",
    short_name: "Pro Academy",
    description:
      "منصة تعلم الإنجليزية للثانوية العامة والإعدادية — كورسات، بنك أسئلة ذكي، اختبارات، مكتبة PDF محمية، ومساعد ذكاء اصطناعي.",
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#2563eb",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1280&h=720&auto=format&fit=crop&q=80",
        sizes: "1280x720",
        type: "image/jpeg",
        form_factor: "wide",
        label: "Professional Academy Dashboard",
      },
      {
        src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=750&h=1334&auto=format&fit=crop&q=80",
        sizes: "750x1334",
        type: "image/jpeg",
        form_factor: "narrow",
        label: "Professional Academy Mobile",
      },
    ],
    shortcuts: [
      {
        name: "الواجبات والتسليم",
        short_name: "Homework",
        url: "/?tab=homework",
        description: "سلّم واجباتك وتابع درجاتك",
      },
      {
        name: "بنك الأسئلة الذكي",
        short_name: "Questions",
        url: "/?tab=question_bank",
        description: "مولد الامتحانات بدون تكرار",
      },
      {
        name: "مكتبة PDF",
        short_name: "PDFs",
        url: "/?tab=pdfs",
        description: "المذكرات والشيتات المحمية",
      },
      {
        name: "لوحة التحكم",
        short_name: "Dashboard",
        url: "/?tab=dashboard",
        description: "تقدمك ونتائجك",
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
