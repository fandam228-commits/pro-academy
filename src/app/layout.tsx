import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { InstallAppPrompt } from "@/components/InstallAppPrompt";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pro-academy-sfl3.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Professional Academy — منصة مستر حبيب الرحمن للإنجليزية | ثانوية عامة وإعدادي",
    template: "%s | Professional Academy",
  },
  description:
    "المنصة التعليمية الأولى لمستر حبيب الرحمن لتعلم اللغة الإنجليزية لطلاب الثانوية العامة (Thanawya Amma) والمرحلة الإعدادية. بنك أسئلة ذكي، مولد امتحانات، اختبار تحديد مستوى تكيفي، مساعد ذكاء اصطناعي، ومكتبة PDF محمية. Mr. Habib El Rahman English Learning Platform.",
  applicationName: "Professional Academy",
  authors: [{ name: "Mr. Habib El Rahman", url: SITE_URL }],
  creator: "Mr. Habib El Rahman",
  publisher: "Professional Academy",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "googleaad18ef01c7e620d",
  },
  keywords: [
    "مستر حبيب الرحمن",
    "منصة مستر حبيب الرحمن",
    "حبيب الرحمن انجليزي",
    "أكاديمية المحترف",
    "أكاديمية مستر حبيب الرحمن",
    "Professional Academy",
    "Mr Habib El Rahman",
    "Habib El Rahman English",
    "الشهادة الثانوية العامة",
    "ثانوية عامة لغة انجليزية",
    "Thanawya Amma English",
    "English for Egyptian students",
    "تأسيس انجليزي اعدادي",
    "بنك أسئلة انجليزية",
    "اختبار تحديد مستوى",
    "منصة تعليمية انجليزي",
    "تحدي 1v1 مستر حبيب الرحمن",
    "كورسات انجليزي ثانوي",
    "قاعة البث المباشر مستر حبيب الرحمن",
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
  alternates: { canonical: SITE_URL },
  category: "education",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Pro Academy",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "theme-color": "#0E1E38",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Pro Academy",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563EB" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1E38" },
  ],
};

const schemaOrgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      name: "Professional Academy — Mr. Habib El Rahman",
      alternateName: ["منصة مستر حبيب الرحمن", "أكاديمية المحترف للغة الإنجليزية"],
      url: SITE_URL,
      telephone: "+20-100-646-8384",
      email: "support@proacademy.com",
      address: { "@type": "PostalAddress", addressCountry: "EG", addressLocality: "Cairo" },
      founder: { "@type": "Person", name: "Habib El Rahman", jobTitle: "English Instructor & Educational Content Creator" },
    },
    {
      "@type": "Course",
      name: "Third Secondary Master Class 2025/2026 (Thanawya Amma)",
      description:
        "Comprehensive English Mastery for Egyptian Baccalaureate students: grammar, vocabulary, translation, novel analysis and exam techniques.",
      provider: {
        "@type": "EducationalOrganization",
        name: "Professional Academy — Mr. Habib El Rahman",
        sameAs: SITE_URL,
      },
      offers: { "@type": "Offer", price: "350.00", priceCurrency: "EGP", availability: "https://schema.org/InStock" },
      inLanguage: ["en", "ar"],
    },
    {
      "@type": "WebSite",
      name: "Professional Academy — منصة مستر حبيب الرحمن",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Pro Academy" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof window !== 'undefined') {
                  var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
                  if (isLocal && 'serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(regs) {
                      var hadWorker = regs.length > 0;
                      for (var i = 0; i < regs.length; i++) { regs[i].unregister(); }
                      if (hadWorker && !sessionStorage.getItem('sw_purged')) {
                        sessionStorage.setItem('sw_purged', 'true');
                        window.location.reload();
                      }
                    });
                  } else if (!isLocal && 'serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js').catch(function(){});
                    });
                  }
                  if ('caches' in window) {
                    caches.keys().then(function(keys) {
                      for (var i = 0; i < keys.length; i++) {
                        if (isLocal || keys[i].indexOf('pro-academy-v1') !== -1) {
                          caches.delete(keys[i]);
                        }
                      }
                    });
                  }
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#F7F9FC] text-[#243247] antialiased selection:bg-[#2563EB] selection:text-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJsonLd) }} />
        {children}
        <InstallAppPrompt />
      </body>
    </html>
  );
}
