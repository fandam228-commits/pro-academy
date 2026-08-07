import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://proacademy.habibelrahman.com";
  const now = new Date().toISOString();

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/?tab=courses`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/?tab=question_bank`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/?tab=pdfs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/?tab=homework`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/?tab=placement`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/?tab=ai_assistant`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/?tab=blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/?tab=about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/?tab=faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/?tab=contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/?tab=privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/?tab=terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
