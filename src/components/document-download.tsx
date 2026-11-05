export function DocumentDownload({id,staff=false}:{id:string;staff?:boolean}) {
  return <form method="get" action={`/documents/${id}/download`} className="document-download">
    {staff&&<input type="hidden" name="portal" value="staff"/>}
    <label htmlFor="download-format">Download format</label>
    <select id="download-format" name="format"><option value="pdf">PDF (.pdf)</option><option value="xlsx">Excel (.xlsx)</option></select>
    <button className="button button-small">Download document</button>
  </form>;
}
