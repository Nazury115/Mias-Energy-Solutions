export const business = {
  name: "Mias Energy Solutions",
  location: "Lusaka, Zambia",
  description: "Water, solar, electrical and plumbing services in Lusaka, Zambia. Explore borehole pumps, solar systems, water treatment and technical support.",
  contacts: { phone: null, whatsapp: null, email: null },
} as const;

export const navigation = [
  { label: "Services", href: "/#services" },
  { label: "About Mias", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

// Confirmed from the developer's master brief. Descriptions remain subject to owner copy review.
export const serviceGroups = [
  {
    number: "01", title: "Pumping systems", category: "Move water where it’s needed",
    description: "Pumping solutions for borehole water supply, pressure boosting and solar-powered water systems.",
    services: ["Borehole pumps", "Booster pumps", "Solar water pumping systems"],
  },
  {
    number: "02", title: "Solar & renewable energy", category: "Put sunlight to work",
    description: "Solar systems for customers exploring renewable energy for their homes, farms or businesses.",
    services: ["Solar PV systems", "Renewable energy solutions"],
  },
  {
    number: "03", title: "Water & plumbing", category: "From supply to everyday use",
    description: "Water treatment, plumbing and water infrastructure services for domestic and organizational needs.",
    services: ["Water treatment solutions", "Plumbing", "Water infrastructure"],
  },
  {
    number: "04", title: "Electrical & controls", category: "Connect the system",
    description: "Electrical works and control panels for pumping and related technical installations.",
    services: ["Electrical works", "Pump control panels", "Electrical control panels"],
  },
] as const;

export const audiences = ["Homeowners", "Farms", "Businesses", "NGOs", "Schools & institutions", "Property developers"] as const;
