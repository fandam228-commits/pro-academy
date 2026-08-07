// Central Platform Contact & Payment Configuration
export const PLATFORM_CONFIG = {
  appName: "Professional Academy",
  appNameAr: "أكاديمية المستر أونلاين",
  instructorName: "Mr. Habib El Rahman",

  // Vodafone Cash Payment Number
  vodafoneCashNumber: "01006468384",
  vodafoneCashDisplay: "0100 646 8384",

  // InstaPay
  instapayHandle: "habib.elrahman@instapay",

  // WhatsApp Contact
  whatsappLocal: "01006468384",
  whatsappIntl: "201006468384",
  whatsappDisplay: "+20 100 646 8384",

  // Support
  supportEmail: "support@proacademy.com",
  location: "Cairo, Egypt",
} as const;

export const buildWhatsAppLink = (message?: string): string => {
  const base = `https://wa.me/${PLATFORM_CONFIG.whatsappIntl}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
