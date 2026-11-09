import { notFound } from "next/navigation";
export const dynamic="force-dynamic";
export const metadata={title:"Mobile preview | Mias local testing",robots:{index:false,follow:false}};
const pages=[{path:"/",label:"Home"},{path:"/projects",label:"Projects"},
  {path:"/staff",label:"Staff workspace"},{path:"/staff/documents",label:"Documents"},{path:"/staff/content",label:"Publishing"},
  {path:"/account",label:"Customer account"},{path:"/sign-in",label:"Sign in"}];
export default async function MobilePreview({searchParams}:{searchParams:Promise<{path?:string;width?:string}>}) {
  if(process.env.NODE_ENV==="production")notFound();
  const query=await searchParams,path=pages.some(page=>page.path===query.path)?query.path!:"/";
  const width=["320","390","430"].includes(query.width??"")?Number(query.width):390;
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <p className="eyebrow">LOCAL TESTING</p><h1>Mobile preview</h1>
    <p>Use the website inside this phone frame. It uses your current signed-in account. Sign out and sign in inside the frame to switch between Owner, Staff and Customer.</p>
    <form className="mobile-preview-controls" action="/dev/mobile">
      <label>Page<select name="path" defaultValue={path}>{pages.map(page=><option key={page.path} value={page.path}>{page.label}</option>)}</select></label>
      <label>Phone width<select name="width" defaultValue={width}>{[320,390,430].map(size=><option key={size} value={size}>{size} px</option>)}</select></label>
      <button className="button button-small">Show preview</button>
    </form>
    <p>This checks the narrow layout. A real phone is still useful for testing its keyboard, camera and downloads.</p>
    <div className="mobile-preview-stage"><iframe className="mobile-preview-frame" title="Live mobile website preview" src={path} width={width} height={844}/></div>
  </main>;
}
