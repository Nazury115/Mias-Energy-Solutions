// Read-only compatibility for appliance details saved before the planner was retired.
// No intake parser, calculator or equipment/pricing recommendations are exposed here.
export const solarCategories={lighting:"Lighting / electronics",refrigeration:"Refrigeration / compressor",motor:"Motor / pump",heating:"Heating",other:"Other / unsure"};
export type SavedLoadSummary={version:"load-summary-v1";mode:"load-summary";area:string;backupHours:string|null;
  loads:{name:string;quantity:number;watts:string|null;hours:string|null;category:keyof typeof solarCategories;essential:boolean;simultaneous:boolean;dailyWh:string|null}[];
  totals:{connectedW:string;selectedW:string|null;dailyWh:string;essentialWh:string;connectedIncomplete:boolean;selectedIncomplete:boolean;
    dailyIncomplete:boolean;essentialIncomplete:boolean;knownEnergyLines:number;essentialLines:number;selectedLines:number};assessmentReasons:string[]};
export const assessmentLabels:Record<string,string>={"unknown-values":"Some ratings or operating hours are unknown.",motor:"Motor / pump starting requirements need technical review.",refrigeration:"Compressor starting and operating patterns need technical review.",other:"Other or uncertain load types need technical review."};
function format(value:bigint,places:number):string {
  const digits=value.toString().padStart(places+1,"0");
  return (digits.slice(0,-places)+"."+digits.slice(-places)).replace(/\.?0+$/,"");
}
export function toKwh(value:string):string {
  const [whole,fraction=""]=value.split(".");
  return format(BigInt(whole)*BigInt(10000)+BigInt(fraction.padEnd(4,"0")),7);
}
export function toKw(value:string):string {
  const [whole,fraction=""]=value.split(".");
  return format(BigInt(whole)*BigInt(100)+BigInt(fraction.padEnd(2,"0")),5);
}
