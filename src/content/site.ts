export const business = {
  name: "Mias Energy Solutions", location: "Lusaka, Zambia",
  description: "Water, electrical and renewable energy solutions in Lusaka, Zambia. Explore pumps, irrigation, water treatment, control panels and solar installations.",
  contacts: { phone: "+260977747285", whatsapp: "+260977747285", email: "imasauso@gmail.com" },
  phoneDisplay: "+260 977 747 285", director: "Israel Masauso",
} as const;

export const navigation = [
  { label: "Home", href: "/" }, { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" }, { label: "About Mias", href: "/about" }, { label: "Contact", href: "/contact" },
] as const;
export const customers = ["Lusaka Water and Sewerage Company", "Plumbfix", "Family Legacy"];

// Confirmed working days/hours, e.g. { label: "Monday to Friday, 09:00–17:00 (Zambia time, CAT)", schema: "Mo-Fr 09:00-17:00" }.
// Shown on Contact, in the footer and in structured data; null keeps hours hidden everywhere until confirmed.
export const operatingHours: { label: string; schema: string } | null = null;
// Israel's approved portrait (put the file in public/images/people/) and short bio, word for word as approved.
// null keeps the "IM" monogram and the current text. Never use a generated likeness.
export const leadership: { portrait: { src: string; width: number; height: number } | null; bio: string | null } = { portrait: null, bio: null };
export const audiences = ["Homeowners", "Farms", "Businesses", "NGOs", "Schools & institutions", "Property developers"];

export type ServiceFamily = {
  slug: string; number: string; title: string; shortTitle: string; tagline: string;
  description: string; image: string; alt: string;
  services: { name: string; description: string; href?: string }[]; questions: string[];
};
export const serviceFamilies: ServiceFamily[] = [
  {
    slug: "water", number: "01", title: "Water solutions", shortTitle: "Water", tagline: "From the source to where it matters.",
    description: "Pumping, treatment and plumbing for water supply at home, on the farm and across your business.",
    image: "/images/stock/water-pipe-flow.jpg", alt: "Water flowing from a pipe into green crops.",
    services: [
      { name: "Borehole pumps", description: "Installation, maintenance and support for pumps that bring borehole water to your property. Tell us about your water source and the existing equipment." },
      { name: "Booster pumps", description: "Pumping solutions for properties that need additional water pressure. Start with where the pressure drops and how the water is used." },
      { name: "Water treatment", description: "Treatment solutions matched to the water source and its intended use. Share any existing water-test information so Mias can discuss the right assessment." },
      { name: "Irrigation", description: "Water supply and irrigation work for agricultural needs. Describe the area, crop or application and the available water source." },
      { name: "Plumbing & water infrastructure", description: "Plumbing installation, maintenance and related water infrastructure for homes, institutions and businesses." },
      { name: "Solar water pumping", description: "Connect pumping needs with a solar-powered water supply solution.", href: "/services/solar-water-pumping" },
    ],
    questions: ["Where does the water come from?", "What needs to be supplied, and where?", "Is this a new system or a fault with existing equipment?"],
  },
  {
    slug: "electrical", number: "02", title: "Electrical solutions", shortTitle: "Electrical", tagline: "The connections behind your operations.",
    description: "Electrical installations, upgrades and maintenance, with control panels for pumping and electrical systems.",
    image: "/images/stock/electrical-panel-testing.jpg", alt: "Electrician testing wiring inside a control panel with a multimeter.",
    services: [
      { name: "Electrical installations", description: "Electrical work for a new installation or an existing property. Discuss the application, location and equipment you need to connect." },
      { name: "Electrical upgrades", description: "Changes to existing electrical systems as your needs develop. Mias can discuss the work after reviewing the current installation." },
      { name: "Maintenance & fault support", description: "Support for existing electrical installations and faults. Describe what has stopped working and arrange an assessment." },
      { name: "Control panels", description: "Pump and electrical control panels for operating connected equipment. Share the equipment details and the control functions you need." },
    ],
    questions: ["What equipment or installation is involved?", "Are you adding, upgrading or repairing?", "Where is the site located?"],
  },
  {
    slug: "renewable-energy", number: "03", title: "Renewable energy", shortTitle: "Renewable energy", tagline: "Put sunlight to work.",
    description: "Solar PV systems and solar-powered pumping for homes, farms and businesses exploring renewable energy.",
    image: "/images/stock/solar-installation.jpg", alt: "Installer working on a solar panel array.",
    services: [
      { name: "Solar PV systems", description: "Solar electrical systems matched to your intended use. Start with the appliances or equipment you want to power and when you use them." },
      { name: "Solar water pumping", description: "Solar-powered pumping for water supply and agricultural needs.", href: "/services/solar-water-pumping" },
      { name: "Installation & maintenance", description: "Installation and related technical support for renewable energy systems. Existing equipment details help Mias understand the work needed." },
    ],
    questions: ["What would you like to power?", "When do you use it, and for how long?", "Do you already have solar equipment?"],
  },
];

// Illustrative stock photography (Unsplash License); sources are recorded in docs/content/image-sources.md.
export const stockImages = {
  hero: { src: "/images/stock/hero-solar-field.jpg", alt: "Rows of solar panels in a green field under a cloudy sky." },
  solarPumping: { src: "/images/stock/irrigation-pivot.jpg", alt: "Centre-pivot irrigation over a field at dusk." },
  about: { src: "/images/stock/irrigated-valley-aerial.jpg", alt: "Aerial view of irrigated fields in a dry, hilly landscape." },
};

export type WorkPhoto = {
  src: string; caption: string; family: "water" | "electrical" | "renewable-energy";
  width: number; height: number; shape: "wide" | "tall" | "large" | "square";
};
// Supplied photographs from Mias work sites (originals in "Proof of service/"). Captions describe only what is
// visible; customers, dates and scope are unconfirmed. Permission for people and premises is needed before launch.
export const workPhotos: WorkPhoto[] = [
  { src: "/images/work/crane-lift.jpeg", caption: "Crane lifting a long pump assembly", family: "water", width: 1080, height: 486, shape: "wide" },
  { src: "/images/work/pump-station.jpeg", caption: "Indoor pump station during works", family: "water", width: 1080, height: 810, shape: "large" },
  { src: "/images/work/booster-set.jpeg", caption: "Twin booster pumps with controllers", family: "water", width: 486, height: 1080, shape: "tall" },
  { src: "/images/work/control-panel.jpeg", caption: "Pump control panel during assembly", family: "electrical", width: 810, height: 720, shape: "square" },
  { src: "/images/work/rooftop-solar.jpeg", caption: "Rooftop solar array during installation", family: "renewable-energy", width: 1080, height: 486, shape: "wide" },
  { src: "/images/work/inverter-batteries.jpeg", caption: "Inverters and wall-mounted battery units", family: "renewable-energy", width: 608, height: 1080, shape: "tall" },
  { src: "/images/work/manifold-install.jpeg", caption: "Pipe manifold and pumps during installation", family: "water", width: 1080, height: 486, shape: "wide" },
  { src: "/images/work/tank-equipment-close.jpeg", caption: "Close view of tank-mounted equipment", family: "water", width: 1080, height: 810, shape: "square" },
  { src: "/images/work/tank-equipment.jpeg", caption: "Tank-mounted equipment and control panels", family: "water", width: 1080, height: 810, shape: "large" },
  { src: "/images/work/vertical-pumps.jpeg", caption: "Vertical multistage pumps", family: "water", width: 486, height: 1080, shape: "tall" },
  { src: "/images/work/pumps-and-panel.jpeg", caption: "Vertical pumps beside an open control panel", family: "electrical", width: 486, height: 1080, shape: "tall" },
  { src: "/images/work/site-lifting.jpeg", caption: "Lifting equipment and pumps on site", family: "water", width: 1080, height: 486, shape: "wide" },
  { src: "/images/work/pumping-set.jpeg", caption: "Horizontal pumping set and pipe manifold", family: "water", width: 1080, height: 486, shape: "wide" },
  { src: "/images/work/pipe-assemblies.jpeg", caption: "Pump assemblies laid out during work", family: "water", width: 1080, height: 486, shape: "wide" },
  { src: "/images/work/manifold-wide.jpeg", caption: "Outdoor pumping manifold", family: "water", width: 1080, height: 486, shape: "wide" },
];
