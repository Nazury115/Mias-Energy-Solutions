import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { workPhotos } from "@/content/site";
import { projectStories } from "@/content/projects";
import { emptyPublication, publicationLimits, publicationProblems, type PublicationDraft, type PublicationKind } from "@/lib/publishing";
import { getDb } from "@/server/db/client";
import { auditLog, publicationImages, publications } from "@/server/db/schema";
import type { Viewer } from "@/server/session";
import { preparePublicationPhoto } from "@/server/publication-photo";

export class PublishingProblem extends Error {}
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const staff = (viewer: Viewer) => { if (!["staff","owner"].includes(viewer.role)) notFound(); };
const conflict = "This draft changed. Reload to review the latest version before saving or publishing.";

export function draftFromForm(form: FormData): PublicationDraft {
  const fields = Object.fromEntries(Object.keys(publicationLimits).map(key => [key, String(form.get(key) ?? "").trim()]));
  return { ...emptyPublication, ...fields, photoIds: form.getAll("photoIds").map(String) };
}

export async function listPublications(viewer: Viewer, includeTrash=false) {
  staff(viewer);
  if(includeTrash && viewer.role!=="owner")notFound();
  return (await getDb()).select().from(publications).where(includeTrash?undefined:isNull(publications.deletedAt)).orderBy(desc(publications.updatedAt));
}

export async function managedRepositorySlugs(viewer:Viewer) {
  staff(viewer);
  return (await getDb()).select({slug:publications.sourceSlug,id:publications.id,deletedAt:publications.deletedAt}).from(publications).where(isNotNull(publications.sourceSlug));
}

export async function manageRepositoryProject(viewer:Viewer,slug:string) {
  staff(viewer);
  const story=projectStories.find(project=>project.slug===slug);
  if(!story)notFound();
  const draft:PublicationDraft={...emptyPublication,title:story.title,summary:story.summary,family:story.family,
    province:story.province,area:story.area??"",year:story.year?String(story.year):"",problem:story.problem,
    approach:story.approach,outcome:story.outcome,existingPhoto:workPhotos.some(photo=>photo.src===story.image)?story.image:""};
  return (await getDb()).transaction(async tx=>{
    const inserted=await tx.insert(publications).values({slug:story.slug,sourceSlug:story.slug,kind:"project",sample:story.fictional,draft,
      repositoryHero:{src:story.image,alt:story.alt}}).onConflictDoNothing().returning({id:publications.id});
    const [entry]=await tx.select({id:publications.id,deletedAt:publications.deletedAt}).from(publications).where(eq(publications.sourceSlug,slug));
    if(!entry)throw new PublishingProblem("This project could not be opened. Reload and try again.");
    if(entry.deletedAt)throw new PublishingProblem("This project is in Trash. Ask an Owner to restore it first.");
    if(inserted.length)await tx.insert(auditLog).values({actorId:viewer.id,action:"content.imported",detail:`${entry.id} — repository project opened for editing; its public version is unchanged.`});
    return entry.id;
  });
}

export async function readPublication(viewer: Viewer, id: string) {
  staff(viewer);
  if (!uuid.test(id)) notFound();
  const db = await getDb();
  const [entry] = await db.select().from(publications).where(and(eq(publications.id,id),isNull(publications.deletedAt)));
  if (!entry) notFound();
  const images = await db.select({ id:publicationImages.id, alt:publicationImages.alt, source:publicationImages.source, permission:publicationImages.permission })
    .from(publicationImages).where(eq(publicationImages.publicationId,id)).orderBy(publicationImages.createdAt);
  const history = await db.select({ action:auditLog.action, detail:auditLog.detail, createdAt:auditLog.createdAt }).from(auditLog)
    .where(sql`${auditLog.action} like 'content.%' and strpos(${auditLog.detail}, ${id}) = 1`).orderBy(desc(auditLog.createdAt));
  return { entry, images, history };
}

export async function createPublication(viewer: Viewer, kind: string, title: string, sample: boolean) {
  staff(viewer);
  if (!["project","testimonial"].includes(kind) || !title.trim() || title.length > 140) throw new PublishingProblem("Choose a content type and enter a title of 140 characters or fewer.");
  const id = randomUUID();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,65) || kind;
  await (await getDb()).transaction(async tx => {
    await tx.insert(publications).values({ id, slug: `story-${slug}-${id.slice(0,8)}`, kind, sample, draft:{ ...emptyPublication,title:title.trim() } });
    await tx.insert(auditLog).values({ actorId:viewer.id, action:"content.created", detail:`${id} — ${sample ? "Fictional test" : "Real"} ${kind}` });
  });
  return id;
}

export async function savePublication(viewer: Viewer, id: string, version: number, draft: PublicationDraft) {
  staff(viewer);
  if (!uuid.test(id)) notFound();
  const bounds = Object.entries(publicationLimits).some(([key,limit]) => draft[key as keyof typeof publicationLimits].length > limit);
  if (bounds || draft.photoIds.length > 8 || !draft.photoIds.every(key => uuid.test(key))) throw new PublishingProblem("Check the field lengths and select at most eight photos.");
  if (draft.existingPhoto && !workPhotos.some(photo => photo.src === draft.existingPhoto)) throw new PublishingProblem("Choose a photograph from the work inventory.");
  await (await getDb()).transaction(async tx => {
    const selected = draft.photoIds.length ? await tx.select({id:publicationImages.id}).from(publicationImages)
      .where(and(eq(publicationImages.publicationId,id),inArray(publicationImages.id,draft.photoIds))) : [];
    if (new Set(draft.photoIds).size !== draft.photoIds.length || selected.length !== draft.photoIds.length) throw new PublishingProblem("Choose photos belonging to this draft.");
    const changed = await tx.update(publications).set({draft,version:sql`${publications.version}+1`,updatedAt:new Date()})
      .where(and(eq(publications.id,id),eq(publications.version,version),isNull(publications.deletedAt))).returning({id:publications.id});
    if (!changed.length) throw new PublishingProblem(conflict);
    await tx.insert(auditLog).values({actorId:viewer.id,action:"content.saved",detail:`${id} — draft saved by ${viewer.name}`});
  });
}

export async function publishPublication(viewer: Viewer,id:string,version:number,reason:string,checked:boolean,unpublish=false) {
  if (viewer.role !== "owner") notFound();
  if (!uuid.test(id)) notFound();
  if (!reason.trim() || reason.length > 500 || (!unpublish && !checked)) throw new PublishingProblem("Enter a reason and confirm the facts and publication permissions.");
  await (await getDb()).transaction(async tx => {
    const [entry] = await tx.select().from(publications).where(eq(publications.id,id)).for("update");
    if (!entry || entry.deletedAt || entry.version !== version) throw new PublishingProblem(conflict);
    if (!unpublish) {
      const problems = publicationProblems(entry.kind as PublicationKind,entry.draft,entry.sample);
      const images = entry.draft.photoIds.length ? await tx.select({ alt: publicationImages.alt, source: publicationImages.source, permission: publicationImages.permission }).from(publicationImages)
        .where(and(eq(publicationImages.publicationId,id),inArray(publicationImages.id,entry.draft.photoIds))) : [];
      if (images.length !== entry.draft.photoIds.length) problems.push("Select photos belonging to this draft.");
      if (!entry.sample && images.some(image => !image.alt || !image.source || !image.permission)) problems.push("Every photo needs source and permission evidence.");
      if (problems.length) throw new PublishingProblem(problems.join(" "));
    }
    await tx.update(publications).set({published:unpublish ? null : entry.draft,repositoryHidden:unpublish,approvedBy:viewer.name,approvedAt:new Date(),
      version:sql`${publications.version}+1`,updatedAt:new Date()}).where(eq(publications.id,id));
    await tx.insert(auditLog).values({actorId:viewer.id,action:unpublish ? "content.unpublished" : "content.published",
      detail:`${id} — ${viewer.name} — ${reason.trim()}`});
  });
}

export async function trashPublication(viewer:Viewer,id:string,version:number,reason:string,checked:boolean,restore=false) {
  if(viewer.role!=="owner")notFound();
  if(!uuid.test(id))notFound();
  if(!restore && (!reason.trim()||reason.length>500||!checked))throw new PublishingProblem("Enter a delete reason and confirm the move to Trash.");
  await (await getDb()).transaction(async tx=>{
    const [entry]=await tx.select().from(publications).where(eq(publications.id,id)).for("update");
    if(!entry||entry.version!==version||Boolean(entry.deletedAt)!==restore)throw new PublishingProblem(conflict);
    await tx.update(publications).set({deletedAt:restore?null:new Date(),published:null,repositoryHidden:true,version:version+1,updatedAt:new Date()}).where(eq(publications.id,id));
    await tx.insert(auditLog).values({actorId:viewer.id,action:restore?"content.restored":"content.trashed",detail:`${id} — ${restore?"restored as an unpublished draft":reason.trim()}`});
  });
}

export async function uploadPublicationImage(viewer: Viewer,id:string,file:File,alt:string,source:string,permission:string) {
  staff(viewer);
  await readPublication(viewer,id);
  if (!file.size || file.size>5*1024*1024 || !alt.trim() || alt.length>250 || !source.trim() || source.length>500 || permission.length>1000) throw new PublishingProblem("Choose a JPEG/PNG up to 5 MiB and enter its description and source.");
  let bytes:Buffer;
  try {
    bytes = await preparePublicationPhoto(file);
  } catch { throw new PublishingProblem("Choose a valid JPEG or PNG image."); }
  await (await getDb()).transaction(async tx => {
    const [entry]=await tx.select({id:publications.id}).from(publications).where(and(eq(publications.id,id),isNull(publications.deletedAt))).for("update");
    if(!entry)throw new PublishingProblem(conflict);
    const [{count}] = await tx.select({count:sql<number>`count(*)::int`}).from(publicationImages).where(eq(publicationImages.publicationId,id));
    if (count>=8) throw new PublishingProblem("This draft already holds eight photographs.");
    await tx.insert(publicationImages).values({publicationId:id,alt:alt.trim(),source:source.trim(),permission:permission.trim(),uploadedBy:viewer.id,
      bytes:sql`decode(${bytes.toString("base64")},'base64')`});
    await tx.insert(auditLog).values({actorId:viewer.id,action:"content.image",detail:`${id} — photo registered by ${viewer.name}`});
  });
}

export async function publishedEntries() {
  return (await getDb()).select({id:publications.id,slug:publications.slug,kind:publications.kind,sample:publications.sample,
    content:publications.published,repositoryHero:publications.repositoryHero,approvedBy:publications.approvedBy,approvedAt:publications.approvedAt}).from(publications)
    .where(and(isNull(publications.deletedAt),isNotNull(publications.published),process.env.MIAS_PUBLIC_LAUNCH==="true" ? eq(publications.sample,false) : undefined))
    .orderBy(publications.slug);
}

export async function repositoryPublicationStates() {
  return (await getDb()).select({slug:publications.sourceSlug,hidden:publications.repositoryHidden,deletedAt:publications.deletedAt,
    hasPublished:sql<boolean>`${publications.published} is not null`}).from(publications).where(isNotNull(publications.sourceSlug));
}

export async function publicationImage(id:string,viewer?:Viewer) {
  if (!uuid.test(id)) notFound();
  if (viewer) staff(viewer);
  const [image] = await (await getDb()).select({body:sql<string>`encode(${publicationImages.bytes},'base64')`}).from(publicationImages)
    .innerJoin(publications,eq(publications.id,publicationImages.publicationId)).where(and(eq(publicationImages.id,id),isNull(publications.deletedAt),viewer ? undefined :
      sql`${publications.published}->'photoIds' ? ${id}`,
      !viewer && process.env.MIAS_PUBLIC_LAUNCH==="true" ? eq(publications.sample,false) : undefined));
  if (!image) notFound();
  return Buffer.from(image.body,"base64");
}

export async function publishedPhotoCaptions() {
  return (await getDb()).select({id:publicationImages.id,alt:publicationImages.alt}).from(publicationImages)
    .innerJoin(publications,eq(publications.id,publicationImages.publicationId))
    .where(and(isNull(publications.deletedAt),sql`${publications.published}->'photoIds' ? ${publicationImages.id}::text`,
      process.env.MIAS_PUBLIC_LAUNCH==="true" ? eq(publications.sample,false) : undefined));
}
