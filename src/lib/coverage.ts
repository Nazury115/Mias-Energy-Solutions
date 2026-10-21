// Zambia coverage: province names, map counts and project-content validation.
// Pure functions with no imports, exercised directly by pytest through Node.

export const provinces = ["Central", "Copperbelt", "Eastern", "Luapula", "Lusaka", "Muchinga", "North-Western", "Northern", "Southern", "Western"] as const;
export type Province = (typeof provinces)[number];
export const projectFamilies = ["water", "electrical", "renewable-energy"] as const;
export type ProjectFamily = (typeof projectFamilies)[number];
export type ServiceMix = Partial<Record<ProjectFamily, number>>;

/** Owner-confirmed (or sample) number of projects in one province (spec 005, D-2). */
export type ProvinceTotal = {
  province: string; projects: number; sample: boolean;
  services?: ServiceMix; areas?: string[]; confirmedBy?: string; confirmedOn?: string;
};
/** The fields of a project story that the map and validation need. */
export type CoverageStory = {
  slug: string; title: string; province: string; family: string; fictional: boolean;
  area?: string; year?: number; approval?: { by: string; on: string } | null;
  customer?: { name: string; publishPermission: boolean }; photos?: string[];
};
export type ProvinceCoverage = {
  province: Province; projects: number; services: ServiceMix; areas: string[]; years: number[];
  stories: { slug: string; title: string }[]; confirmedBy?: string; confirmedOn?: string;
};
/** "real" ignores all sample data; "sample" is preview-only; "none" means nothing may be shown. */
export type Coverage = { mode: "real" | "sample" | "none"; provinces: ProvinceCoverage[]; covered: number; total: number; max: number };

export function listProvinces(): Province[] {
  return [...provinces];
}

export function matchProvince(value: string): Province | null {
  const wanted = value.trim().toLowerCase();
  return provinces.find(province => province.toLowerCase() === wanted) ?? null;
}

export function buildCoverage(totals: ProvinceTotal[], stories: CoverageStory[], publicLaunch: boolean): Coverage {
  const hasReal = totals.some(total => !total.sample) || stories.some(story => !story.fictional);
  const mode = hasReal ? "real" : publicLaunch ? "none" : "sample";
  // Sample and real data are never mixed: real mode counts only real items, sample mode only sample items.
  const counted = (isSample: boolean) => mode !== "none" && isSample === (mode === "sample");

  const items = provinces.map((province): ProvinceCoverage => {
    const entry = totals.find(total => total.province === province && counted(total.sample));
    const own = stories.filter(story => story.province === province && counted(story.fictional));
    const services: ServiceMix = { ...entry?.services };
    if (!entry?.services) for (const story of own) services[story.family as ProjectFamily] = (services[story.family as ProjectFamily] ?? 0) + 1;
    return {
      province, services,
      projects: Math.max(entry?.projects ?? 0, own.length),
      areas: [...new Set([...(entry?.areas ?? []), ...own.flatMap(story => story.area ? [story.area] : [])])],
      years: [...new Set(own.flatMap(story => story.year ? [story.year] : []))].sort((a, b) => a - b),
      stories: own.map(({ slug, title }) => ({ slug, title })),
      ...(entry?.confirmedBy ? { confirmedBy: entry.confirmedBy, confirmedOn: entry.confirmedOn } : {}),
    };
  });
  const counts = items.map(item => item.projects);
  return { mode, provinces: items, covered: counts.filter(Boolean).length, total: counts.reduce((sum, count) => sum + count, 0), max: Math.max(0, ...counts) };
}

/** 0 = nothing recorded; 1–4 split the range up to the busiest province into equal quarters. */
export function shadeLevel(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  return Math.min(4, Math.ceil((4 * count) / max));
}

/** Legend ranges matching shadeLevel, skipping levels that no whole number can reach. */
export function shadeRanges(max: number): { level: number; from: number; to: number }[] {
  return [1, 2, 3, 4]
    .map(level => ({ level, from: Math.floor(((level - 1) * max) / 4) + 1, to: Math.floor((level * max) / 4) }))
    .filter(range => range.from <= range.to);
}

/** Returns readable problems; an empty list means the content is safe to publish. */
export function validateProjectContent(totals: ProvinceTotal[], stories: CoverageStory[], photoSources: string[]): string[] {
  const errors: string[] = [];
  const isProvince = (value: string) => (provinces as readonly string[]).includes(value);
  const isFamily = (value: string) => (projectFamilies as readonly string[]).includes(value);

  const seenProvinces = new Set<string>();
  for (const total of totals) {
    const label = `Province total "${total.province}"`;
    if (!isProvince(total.province)) errors.push(`${label}: unknown province.`);
    if (seenProvinces.has(total.province)) errors.push(`${label}: listed twice.`);
    seenProvinces.add(total.province);
    if (!Number.isInteger(total.projects) || total.projects < 0) errors.push(`${label}: projects must be a whole number of 0 or more.`);
    if (!total.sample && !(total.confirmedBy?.trim() && total.confirmedOn?.trim())) errors.push(`${label}: real totals need confirmation (confirmedBy and confirmedOn).`);
    if (total.services) {
      if (Object.keys(total.services).some(family => !isFamily(family))) errors.push(`${label}: unknown service family in services.`);
      const sum = Object.values(total.services).reduce((a, b) => a + (b ?? 0), 0);
      if (sum !== total.projects) errors.push(`${label}: services add up to ${sum}, not ${total.projects}.`);
    }
    const own = stories.filter(story => story.province === total.province && story.fictional === total.sample).length;
    if (total.projects < own) errors.push(`${label}: total (${total.projects}) is lower than its ${own} itemised stories.`);
  }

  const seenSlugs = new Set<string>();
  for (const story of stories) {
    const label = `Story "${story.slug}"`;
    if (seenSlugs.has(story.slug)) errors.push(`${label}: duplicate slug.`);
    seenSlugs.add(story.slug);
    if (!isProvince(story.province)) errors.push(`${label}: unknown province "${story.province}".`);
    if (!isFamily(story.family)) errors.push(`${label}: unknown service family "${story.family}".`);
    if (!story.fictional && !(story.approval?.by?.trim() && story.approval?.on?.trim())) errors.push(`${label}: real stories need an approval (by and on).`);
    if (story.customer && story.customer.publishPermission !== true) errors.push(`${label}: a customer name needs publish permission (publishPermission: true).`);
    for (const photo of story.photos ?? []) if (!photoSources.includes(photo)) errors.push(`${label}: photo "${photo}" is not in public/images/work.`);
    if (story.year !== undefined && (!Number.isInteger(story.year) || story.year < 1990 || story.year > 2100)) errors.push(`${label}: year must be a whole number such as 2024.`);
  }
  return errors;
}
