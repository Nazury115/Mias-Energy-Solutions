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
    image: "/images/pumping-equipment.jpeg", alt: "Pumps and connected pipework in a photograph supplied by Mias.",
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
    image: "/images/control-panel.jpeg", alt: "Open electrical control panel during assembly, supplied by Mias.",
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
    image: "/images/rooftop-solar.jpeg", alt: "Solar panels on a roof during installation, supplied by Mias.",
    services: [
      { name: "Solar PV systems", description: "Solar electrical systems matched to your intended use. Start with the appliances or equipment you want to power and when you use them." },
      { name: "Solar water pumping", description: "Solar-powered pumping for water supply and agricultural needs.", href: "/services/solar-water-pumping" },
      { name: "Installation & maintenance", description: "Installation and related technical support for renewable energy systems. Existing equipment details help Mias understand the work needed." },
    ],
    questions: ["What would you like to power?", "When do you use it, and for how long?", "Do you already have solar equipment?"],
  },
];

export type ProjectStory = {
  slug: string; family: string; category: string; title: string; summary: string;
  image: string; alt: string; fictional: boolean; problem: string; approach: string; outcome: string;
};
// Deliberate demo records; never attribute these to the real customers above.
export const projectStories: ProjectStory[] = [
  {
    slug: "home-water-pressure", family: "water", category: "Water", title: "A better water supply at home",
    summary: "An example of how a pressure-boosting project could be explained, from the first concern to handover.",
    image: "/images/pumping-equipment.jpeg", alt: "Illustrative supplied photograph of pumping equipment, not evidence of this fictional story.", fictional: true,
    problem: "In this fictional scenario, a household experiences inconsistent water pressure when several taps are used together.",
    approach: "An example project could begin with a review of the water source and demand, followed by an appropriate booster-pump arrangement and checks at the outlets.",
    outcome: "A real case study would record the work actually completed, the checks performed and the customer's confirmed experience. No outcome is claimed for this example.",
  },
  {
    slug: "control-panel-renewal", family: "electrical", category: "Electrical", title: "Giving a pump system clearer control",
    summary: "A sample story showing how a control-panel upgrade might be presented for a business premises.",
    image: "/images/control-panel.jpeg", alt: "Illustrative supplied photograph of a panel during assembly, not evidence of this fictional story.", fictional: true,
    problem: "This fictional business wants to review the way its existing pump equipment is controlled and monitored.",
    approach: "A project story could explain the existing arrangement, the agreed control functions and the installation and checking of a suitable panel.",
    outcome: "The finished story would include verified panel functions and handover details. This preview does not claim an installation, certification or customer endorsement.",
  },
  {
    slug: "home-solar-backup", family: "renewable-energy", category: "Renewable energy", title: "Planning solar around everyday life",
    summary: "An illustrative household solar story, starting with the appliances that matter most.",
    image: "/images/solar-battery.jpeg", alt: "Illustrative supplied photograph of solar and battery equipment, not evidence of this fictional story.", fictional: true,
    problem: "In this fictional scenario, a household is considering solar power for a selected set of everyday appliances.",
    approach: "The story could describe a load assessment, a technically reviewed equipment choice and an installation planned around the property.",
    outcome: "A verified story would record the installed equipment and observed performance. No capacity, savings, runtime or price is invented for this example.",
  },
];
