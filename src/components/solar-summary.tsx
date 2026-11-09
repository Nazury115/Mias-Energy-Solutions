import { assessmentLabels,solarCategories,toKw,toKwh,type SavedLoadSummary } from "@/lib/saved-load-summary";

export function SolarSummary({plan}:{plan:SavedLoadSummary}) {
  const t=plan.totals;
  return <section className="account-card solar-summary" data-solar-summary>
    <p className="eyebrow">ORIGINAL SAVED INPUTS</p><h2>Original request load details</h2>
    <p className="notice">These details were saved with the original request. Mias must assess site conditions and confirm suitable equipment and current prices separately.</p>
    <dl className="solar-totals">
      <div><dt>Listed connected power{t.connectedIncomplete?" — known portion only":""}</dt><dd>{plan.loads.some(load=>load.watts!==null)?`${t.connectedW} W · ${toKw(t.connectedW)} kW`:"No known wattage ratings"}</dd></div>
      <div><dt>Selected running power{t.selectedIncomplete?" — known portion only":""}</dt><dd>{t.selectedW===null?"No simultaneous-use scenario selected":t.selectedIncomplete&&t.selectedW==="0"?"No known ratings in the selected scenario":`${t.selectedW} W · ${toKw(t.selectedW)} kW`}</dd></div>
      <div><dt>Daily energy{t.dailyIncomplete?" — known portion only":""}</dt><dd>{t.knownEnergyLines?`${t.dailyWh} Wh · ${toKwh(t.dailyWh)} kWh`:"No complete daily energy inputs"}</dd></div>
      <div><dt>Essential daily energy{t.essentialIncomplete?" — known portion only":""}</dt><dd>{!t.essentialLines?"No essential loads marked":!plan.loads.some(load=>load.essential&&load.dailyWh!==null)?"No complete essential-load energy inputs":`${t.essentialWh} Wh · ${toKwh(t.essentialWh)} kWh`}</dd></div>
    </dl>
    {t.dailyIncomplete&&<p className="notice">Known portion only: {plan.loads.length-t.knownEnergyLines} appliance row(s) have unknown watts or operating hours. This is not a complete household energy total.</p>}
    <p className="field-hint">Connected power sums the listed ratings. Selected running power uses your chosen group and excludes starting surges. Daily energy = quantity × watts × operating hours. No cycling or standby behavior is inferred.</p>
    <div className="table-scroll"><table className="data-table solar-summary-table"><thead><tr><th>Appliance</th><th>Qty</th><th>Watts each</th><th>Hours/day</th><th>Daily energy</th><th>Your selections</th></tr></thead><tbody>
      {plan.loads.map((load,index)=><tr key={index}><td>{load.name}<br/><small>{solarCategories[load.category]}</small></td><td>{load.quantity}</td><td>{load.watts===null?"Unknown":load.watts+" W"}</td><td>{load.hours??"Unknown"}</td><td>{load.dailyWh===null?"Unknown":load.dailyWh+" Wh"}</td><td>{[load.essential?"Essential":null,load.simultaneous?"Run together":null].filter(Boolean).join(" · ")||"None"}</td></tr>)}
    </tbody></table></div>
    {plan.assessmentReasons.length>0&&<div className="solar-assessment"><h3>Technical assessment required</h3><ul>{plan.assessmentReasons.map(reason=><li key={reason}>{assessmentLabels[reason]}</li>)}</ul></div>}
    <p>Area: {plan.area||"Not supplied"} · Desired backup: {plan.backupHours===null?"Not specified":plan.backupHours+" hours"}. Backup duration is an assessment preference.</p>
    <p className="field-hint">Original calculation version: <code>{plan.version}</code>. These saved details preserve the original request; later assessments do not change them.</p>
  </section>;
}
