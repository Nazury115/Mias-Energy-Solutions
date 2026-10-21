// LocalBusiness structured data limited to confirmed facts: no address, ratings, reviews or prices are ever added here.
export function localBusinessJsonLd(details: {
  name: string; description: string; phone: string; email: string; siteUrl: string; logoPath: string; openingHours: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: details.name,
    description: details.description,
    telephone: details.phone,
    email: details.email,
    url: details.siteUrl,
    logo: new URL(details.logoPath, details.siteUrl).toString(),
    areaServed: [{ "@type": "City", name: "Lusaka" }, { "@type": "Country", name: "Zambia" }],
    ...(details.openingHours ? { openingHours: details.openingHours } : {}),
  };
}
