import type { CoverageStory, Province, ProjectFamily, ProvinceTotal } from "@/lib/coverage";
import { validateProjectContent } from "@/lib/coverage";
import { workPhotos } from "@/content/site";

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// PROJECT CONTENT: the one place to edit project stories and the Zambia coverage map.
//
// Everything below is currently SAMPLE data (sample: true / fictional: true). It appears in the
// local preview with "Sample data" and "Fictional example" labels and is hidden in launch mode
// (MIAS_PUBLIC_LAUNCH=true).
//
// Real numbers for the map: for each province set sample: false, update projects / services /
//   areas, and fill confirmedBy + confirmedOn (who confirmed the figures, and when, e.g. "2026-11").
// A real project story: set fictional: false, rewrite title/summary/problem/approach/outcome with
//   what really happened, and add approval: { by, on }. Add customer only with permission, photos
//   only from public/images/work.
// As soon as ANY real total or story exists, all sample data leaves the map (they are never mixed),
//   so switch every province you want shown to real figures at the same time.
// Mistakes such as an unknown province, services that don't add up or a missing approval stop the
//   page with a message listing exactly what to fix.
// ─────────────────────────────────────────────────────────────────────────────────────────────────

export const provinceTotals: ProvinceTotal[] = [
  { province: "Lusaka", projects: 24, services: { water: 11, electrical: 7, "renewable-energy": 6 }, areas: ["Lusaka", "Chongwe", "Kafue"], sample: true },
  { province: "Copperbelt", projects: 22, services: { water: 12, electrical: 7, "renewable-energy": 3 }, areas: ["Kitwe", "Ndola", "Chingola"], sample: true },
  { province: "Southern", projects: 20, services: { water: 9, electrical: 4, "renewable-energy": 7 }, areas: ["Livingstone", "Choma", "Mazabuka"], sample: true },
  { province: "Western", projects: 19, services: { water: 10, electrical: 2, "renewable-energy": 7 }, areas: ["Mongu", "Kaoma", "Senanga"], sample: true },
  { province: "Central", projects: 10, services: { water: 5, electrical: 3, "renewable-energy": 2 }, areas: ["Kabwe", "Kapiri Mposhi"], sample: true },
  { province: "North-Western", projects: 7, services: { water: 4, electrical: 2, "renewable-energy": 1 }, areas: ["Solwezi"], sample: true },
  { province: "Eastern", projects: 5, services: { water: 3, electrical: 1, "renewable-energy": 1 }, areas: ["Chipata"], sample: true },
  { province: "Northern", projects: 4, services: { water: 2, electrical: 1, "renewable-energy": 1 }, areas: ["Kasama"], sample: true },
  { province: "Luapula", projects: 3, services: { water: 2, "renewable-energy": 1 }, areas: ["Mansa"], sample: true },
  { province: "Muchinga", projects: 2, services: { water: 1, "renewable-energy": 1 }, areas: ["Chinsali"], sample: true },
];

export type ProjectStory = CoverageStory & {
  province: Province; family: ProjectFamily; category: string; summary: string;
  image: string; alt: string; problem: string; approach: string; outcome: string;
};
// Deliberate demo records; never attribute these to the real customers in site.ts.
export const projectStories: ProjectStory[] = [
  {
    slug: "home-water-pressure", family: "water", category: "Water", province: "Lusaka", area: "Lusaka", title: "A better water supply at home",
    summary: "An example of how a pressure-boosting project could be explained, from the first concern to handover.",
    image: "/images/stock/water-pipe-flow.jpg", alt: "Illustrative stock photograph of water flowing from a pipe, not evidence of this fictional story.", fictional: true,
    problem: "In this fictional scenario, a household experiences inconsistent water pressure when several taps are used together.",
    approach: "An example project could begin with a review of the water source and demand, followed by an appropriate booster-pump arrangement and checks at the outlets.",
    outcome: "A real case study would record the work actually completed, the checks performed and the customer's confirmed experience. No outcome is claimed for this example.",
  },
  {
    slug: "control-panel-renewal", family: "electrical", category: "Electrical", province: "Copperbelt", area: "Kitwe", title: "Giving a pump system clearer control",
    summary: "A sample story showing how a control-panel upgrade might be presented for a business premises.",
    image: "/images/stock/electrical-panel-testing.jpg", alt: "Illustrative stock photograph of a control panel being tested, not evidence of this fictional story.", fictional: true,
    problem: "This fictional business wants to review the way its existing pump equipment is controlled and monitored.",
    approach: "A project story could explain the existing arrangement, the agreed control functions and the installation and checking of a suitable panel.",
    outcome: "The finished story would include verified panel functions and handover details. This preview does not claim an installation, certification or customer endorsement.",
  },
  {
    slug: "home-solar-backup", family: "renewable-energy", category: "Renewable energy", province: "Southern", area: "Livingstone", title: "Planning solar around everyday life",
    summary: "An illustrative household solar story, starting with the appliances that matter most.",
    image: "/images/stock/solar-installation.jpg", alt: "Illustrative stock photograph of solar panel installation, not evidence of this fictional story.", fictional: true,
    problem: "In this fictional scenario, a household is considering solar power for a selected set of everyday appliances.",
    approach: "The story could describe a load assessment, a technically reviewed equipment choice and an installation planned around the property.",
    outcome: "A verified story would record the installed equipment and observed performance. No capacity, savings, runtime or price is invented for this example.",
  },
];

const problems = validateProjectContent(provinceTotals, projectStories, workPhotos.map(photo => photo.src));
if (problems.length) throw new Error(`Fix src/content/projects.ts:\n- ${problems.join("\n- ")}`);
