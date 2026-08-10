import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://proacademy.habibelrahman.com"),
  title: {
    default: "Professional Academy — منصة مستر حبيب الرحمن للإنجليزية | ثانوية عامة وإعدادي",
    template: "%s | Professional Academy",
  },
  description:
    "المنصة التعليمية الأولى لمستر حبيب الرحمن لتعلم اللغة الإنجليزية لطلاب الثانوية العامة (Thanawya Amma) والمرحلة الإعدادية. بنك أسئلة ذكي، مولد امتحانات، اختبار تحديد مستوى تكيفي، مساعد ذكاء اصطناعي، ومكتبة PDF محمية. Mr. Habib El Rahman English Learning Platform.",
  applicationName: "Professional Academy",
  authors: [{ name: "Mr. Habib El Rahman", url: "https://proacademy.habibelrahman.com" }],
  creator: "Mr. Habib El Rahman",
  publisher: "Professional Academy",
  keywords: [
    "مستر حبيب الرحمن",
    "الشهادة الثانوية العامة",
    "ثانوية عامة لغة انجليزية",
    "Thanawya Amma English",
    "English for Egyptian students",
    "تأسيس انجليزي اعدادي",
    "بنك أسئلة انجليزية",
    "اختبار تحديد مستوى",
    "منصة تعليمية انجليزي",
    "كورسات انجليزي ثانوي",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": 160 },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
    siteName: "Professional Academy — Mr. Habib El Rahman",
    title: "Professional Academy — منصة مستر حبيب الرحمن للإنجليزية",
    description:
      "تفوق في اللغة الإنجليزية للثانوية العامة والإعدادية مع بنك أسئلة ذكي، مولد امتحانات بدون تكرار، ومساعد ذكاء اصطناعي.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Professional Academy — Mr. Habib El Rahman English Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Academy — Mr. Habib El Rahman",
    description: "المنصة التعليمية الأولى للإنجليزية: ثانوية عامة وإعدادي — بنك أسئلة ذكي ومساعد AI.",
  },
  alternates: { canonical: "https://proacademy.habibelrahman.com" },
  category: "education",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Pro Academy",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "theme-color": "#2563eb",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

const schemaOrgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      name: "Professional Academy — Mr. Habib El Rahman",
      alternateName: "أكاديمية المستر أونلاين",
      url: "https://proacademy.habibelrahman.com",
      telephone: "+20-100-646-8384",
      email: "support@proacademy.com",
      address: { "@type": "PostalAddress", addressCountry: "EG", addressLocality: "Cairo" },
      founder: { "@type": "Person", name: "Habib El Rahman", jobTitle: "English Instructor" },
    },
    {
      "@type": "Course",
      name: "Third Secondary Master Class 2025/2026 (Thanawya Amma)",
      description:
        "Comprehensive English Mastery for Egyptian Baccalaureate students: grammar, vocabulary, translation, novel analysis and exam techniques.",
      provider: {
        "@type": "EducationalOrganization",
        name: "Professional Academy",
        sameAs: "https://proacademy.habibelrahman.com",
      },
      offers: { "@type": "Offer", price: "350.00", priceCurrency: "EGP", availability: "https://schema.org/InStock" },
      inLanguage: ["en", "ar"],
    },
    {
      "@type": "WebSite",
      name: "Professional Academy",
      url: "https://proacademy.habibelrahman.com",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://proacademy.habibelrahman.com/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
