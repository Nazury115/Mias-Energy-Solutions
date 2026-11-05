import type { PublicationDraft } from "@/lib/publishing";

export function PublicationPreview({draft,kind,sample,photos}:{draft:PublicationDraft;kind:string;sample:boolean;photos:{src:string;alt:string}[]}) {
  return <article className="publication-preview">
    {sample && <p className="notice">Fictional test content — for local review.</p>}
    <h1>{draft.title}</h1>
    {kind==="project" ? <><p>{draft.summary}</p><p>{draft.province} · {draft.family}{draft.year && ` · ${draft.year}`}</p>
      {photos.map(photo=><figure key={photo.src}><img src={photo.src} alt={photo.alt} width={1080} height={720}/><figcaption>{photo.alt}</figcaption></figure>)}
      <h2>The challenge</h2><p>{draft.problem}</p><h2>The work</h2><p>{draft.approach}</p><h2>The outcome</h2><p>{draft.outcome}</p></> :
      <blockquote><p>{draft.quote}</p><footer>{draft.attribution}</footer></blockquote>}
  </article>;
}
