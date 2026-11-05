export type PublicationKind = "project" | "testimonial";
export type PublicationDraft = {
  title: string; summary: string; family: string; province: string; area: string; year: string;
  problem: string; approach: string; outcome: string; quote: string; attribution: string;
  permission: string; existingPhoto: string; photoIds: string[];
};
export const publicationLimits = {
  title: 140, summary: 500, family: 30, province: 40, area: 100, year: 4,
  problem: 3000, approach: 3000, outcome: 3000, quote: 1500, attribution: 120,
  permission: 1500, existingPhoto: 200,
};
export const emptyPublication: PublicationDraft = {
  title: "", summary: "", family: "water", province: "Lusaka", area: "", year: "",
  problem: "", approach: "", outcome: "", quote: "", attribution: "", permission: "", existingPhoto: "", photoIds: [],
};
export function publicationProblems(kind: PublicationKind, draft: PublicationDraft, sample: boolean): string[] {
  const errors: string[] = [];
  for (const [field, max] of Object.entries(publicationLimits)) {
    const value = draft[field as keyof typeof publicationLimits];
    if (typeof value !== "string" || value.length > max) errors.push(`Use ${max} characters or fewer for ${field}.`);
  }
  const required = kind === "project" ? ["title", "summary", "problem", "approach", "outcome"] as const : ["title", "quote", "attribution"] as const;
  for (const field of required) if (!draft[field]?.trim()) errors.push(`Enter ${field}.`);
  if (!sample && !draft.permission.trim()) errors.push("Record publication permission evidence.");
  if (kind === "project") {
    if (!["water", "electrical", "renewable-energy"].includes(draft.family)) errors.push("Choose a service family.");
    if (!["Central","Copperbelt","Eastern","Luapula","Lusaka","Muchinga","Northern","North-Western","Southern","Western"].includes(draft.province)) errors.push("Choose a province.");
    if (draft.year && !/^(19[9][0-9]|20[0-9][0-9]|2100)$/.test(draft.year)) errors.push("Use a year from 1990 to 2100.");
    if (!sample && !draft.existingPhoto && !draft.photoIds.length) errors.push("Choose an approved project photo.");
  }
  if (draft.photoIds.length > 8 || new Set(draft.photoIds).size !== draft.photoIds.length) errors.push("Select at most eight different photos.");
  return errors;
}

export function filterPublicationCollections<
  Story extends { fictional: boolean },
  Total extends { sample: boolean },
  Review extends { sample: boolean }
>(stories: Story[], totals: Total[], reviews: Review[], launch: boolean) {
  const realContent = stories.some(story => !story.fictional)
    || totals.some(total => !total.sample)
    || reviews.some(review => !review.sample);
  const visible = (sample: boolean) => !sample || (!realContent && !launch);
  return {
    projects: stories.filter(story => visible(story.fictional)),
    totals: totals.filter(total => visible(total.sample)),
    testimonials: reviews.filter(review => visible(review.sample)),
  };
}
