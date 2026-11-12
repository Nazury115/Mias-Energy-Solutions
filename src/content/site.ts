export const business = {
  name: "Mias Energy Solutions", location: "Lusaka, Zambia",
  description: "Water, electrical and renewable energy solutions in Lusaka, Zambia. Explore pumps, irrigation, water treatment, control panels and solar installations.",
  contacts: { phone: "+260977747285", whatsapp: "+260977747285", email: "imasauso@gmail.com" },
  phoneDisplay: "+260 977 747 285", director: "Israel Masauso",
} as const;

export const navigation = [
  { label: "Home", href: "/" }, { label: "Services", href: "/services" },
  { label: "Sectors we serve", href: "/who-we-serve" },
  { label: "Projects", href: "/projects" }, { label: "About Mias", href: "/about" }, { label: "Contact", href: "/contact" },
] as const;
export const customers = [
  { name: "Lusaka Water Supply and Sanitation Company", logo: "/brand/customers/lwsc.png" },
  { name: "Plumbfix", logo: null },
  { name: "Family Legacy", logo: "/brand/customers/family-legacy.png" },
  { name: "Egyptian Embassy in Lusaka", logo: null },
  { name: "EastPark Mall", logo: "/brand/customers/eastpark.png" },
] as const;

// Confirmed working days/hours, e.g. { label: "Monday to Friday, 09:00–17:00 (Zambia time, CAT)", schema: "Mo-Fr 09:00-17:00" }.
// Shown on Contact, in the footer and in structured data; null keeps hours hidden everywhere until confirmed.
export const operatingHours: { label: string; schema: string } | null = null;
// Israel's approved portrait (put the file in public/images/people/) and short bio, word for word as approved.
// null keeps the "IM" monogram and the current text. Never use a generated likeness.
export const leadership: { portrait: { src: string; width: number; height: number } | null; bio: string | null } = { portrait: null, bio: null };
export const sectors = [
  {
    name: "Homeowners", slug: "homeowners",
    challenge: "When the power goes out, the taps may stop as well. Keeping the lights, fridge and a few sockets running is one need. Starting a borehole or booster pump can place a different demand on the same system.",
    response: "We can check where water pressure drops, assess the pump and its electrical supply, and help you decide what should stay on during an outage. If you’re considering solar, we can assess the appliances you need and whether pumping water into storage during the day would suit your household.",
    inquiry: "Discuss your home water supply",
    link: "Explore water systems", href: "/services/water",
    thumbnail: "kitchen-tap.jpg", photo: "/images/zambia/lusaka-estate.jpg", alt: "Homes and shared grounds in a Lusaka housing estate.",
  },
  {
    name: "Farmers & Growers", slug: "farms",
    challenge: "The fields furthest from the pump may receive too little water before the irrigation window closes. An unreliable electrical supply makes that window shorter. If you switch to solar, can enough water be pumped and stored before the next watering cycle?",
    response: "We start with the water source, the height and distance it must travel, and when each field needs it. We can then assess the pump, pipework, motor supply and controls together, and work out whether solar pumping and water storage fit the farm’s schedule.",
    inquiry: "Discuss your irrigation needs",
    link: "Explore solar water pumping", href: "/services/solar-water-pumping",
    thumbnail: "crop-rows.jpg", photo: "/images/zambia/chipangali-soybeans.jpg", alt: "A soybean field in Chipangali District, Zambia.",
  },
  {
    name: "Commercial & Business Premises", slug: "businesses",
    challenge: "In a busy shop or office building, low pressure may show up first in the upper-floor washrooms. A tripping circuit can interrupt trading at the same time. Backup power only helps if it serves the equipment the business needs to keep open.",
    response: "We can investigate the pressure loss and electrical trips, check the booster pump and control panel, and identify which circuits matter during business hours. That gives us a basis for recommending repairs, electrical upgrades or a solar option matched to the working day.",
    inquiry: "Discuss equipment at your premises",
    link: "Explore electrical services", href: "/services/electrical",
    thumbnail: "office-windows.jpg", photo: "/images/zambia/lusaka-offices.jpg", alt: "Glass and steel facade of a building in Lusaka.",
  },
  {
    name: "Community & NGO Projects", slug: "ngos",
    challenge: "A shared water point has to meet demand at the times people collect water. Where grid power is limited, the pump’s energy source matters as much as the water source. Once the project is handed over, someone local has to operate and maintain it.",
    response: "We can assess the source, intended water use, collection times and storage needs. We can then discuss pumping and treatment, electrical controls the operator can manage, and whether solar can supply the required water during daylight.",
    inquiry: "Discuss your community water project",
    link: "Explore pumping and water treatment", href: "/services/water",
    thumbnail: "outdoor-tap.jpg", photo: "/images/zambia/community-landscape.jpg", alt: "Rural buildings beneath a tree in Zambia.",
  },
  {
    name: "Education & Institutions", slug: "schools-and-institutions",
    challenge: "At a school, taps, washrooms and kitchens can all be in use during the same short break. Classrooms and administration offices need electricity on a different schedule. A system that handles an average day can still fall short at the busiest hour.",
    response: "We can trace how water reaches each building, check pump controls and review which electrical circuits serve teaching, administration and kitchens. From there, we can assess water storage for peak use and solar options for equipment used during the school day.",
    inquiry: "Discuss your institution’s facilities",
    link: "Explore water systems", href: "/services/water",
    thumbnail: "school-corridor.jpg", photo: "/images/stock/classroom.jpg", alt: "Empty desks facing a chalkboard in a classroom.",
  },
  {
    name: "Property Development", slug: "property-developers",
    challenge: "The first occupied block may have adequate water and power. Connecting the next phase can expose limits in shared pipes, pumps and electrical distribution. Adding solar later is harder if roof space, equipment locations and cable routes have already been committed.",
    response: "We can review the site layout and occupation phases with the developer, assess water distribution and pumping alongside electrical connections, and identify where solar equipment could fit. The aim is to make the first phase workable while allowing for the next one.",
    inquiry: "Discuss your development plans",
    link: "Explore installation services", href: "/services",
    thumbnail: "building-in-progress.jpg", photo: "/images/stock/concrete-frame.jpg", alt: "Exposed concrete floors of a building under construction.",
  },
] as const;
export const audiences = sectors.map(sector => sector.name);

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
// Distinct editorial photographs for the service directory and each service detail.
export const directoryPhotos = [
  { image: "/images/stock/water-outlet.jpg", alt: "Water flowing from an industrial outlet." },
  { image: "/images/stock/electrical-cables.jpg", alt: "Electrician working with cables." },
  { image: "/images/stock/roof-array.jpg", alt: "Installer handling a solar panel on a roof." },
];
export const detailPhotos = [
  { image: "/images/stock/water-installation.jpg", alt: "Water flowing from pipes." },
  { image: "/images/stock/switchgear.jpg", alt: "Technician working on electrical switchgear." },
  { image: "/images/stock/roof-installation.jpg", alt: "Solar panel installation on a roof." },
];
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
