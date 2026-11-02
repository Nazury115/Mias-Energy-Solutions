import { randomUUID } from "node:crypto";
import { RemoveFileForm, UploadForm } from "@/components/job-forms";
import { visibleFiles } from "@/server/job-files";
import type { Viewer } from "@/server/session";

export async function JobFiles({ reference, stage, viewer }: { reference: string; stage: string; viewer: Viewer }) {
  const files = await visibleFiles(viewer, reference);
  const customer = viewer.role === "customer";
  return <section className="account-card job-file-list"><h2>Job files</h2>
    <p>Shared with this job’s customers and Mias staff.</p>
    {files.length ? <ul>{files.map(file => <li key={file.id}>
      <a href={`/jobs/${reference}/files/${file.id}`} download>{file.name}</a>
      <p>{Math.ceil(file.size / 1024)} KiB · {file.uploader} · {file.createdAt.toISOString().slice(0, 10)}</p>
      {!customer && <RemoveFileForm reference={reference} id={file.id} name={file.name} />}
    </li>)}</ul> : <p>No files shared yet.</p>}
    {["completed", "cancelled"].includes(stage) ? <p>Uploads are closed for this job.</p> :
      <UploadForm reference={reference} customer={customer} submission={randomUUID()} />}
  </section>;
}
