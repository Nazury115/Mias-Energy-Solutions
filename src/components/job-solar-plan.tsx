import { SolarSummary } from "@/components/solar-summary";
import { jobSolarPlan } from "@/server/solar-plans";
import type { Viewer } from "@/server/session";
export async function JobSolarPlan({viewer,reference}:{viewer:Viewer;reference:string}) {
  const plan=await jobSolarPlan(viewer,reference);
  return plan?<SolarSummary plan={plan}/>:null;
}
