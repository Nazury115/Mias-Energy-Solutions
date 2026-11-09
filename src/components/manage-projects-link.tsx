"use client";
import { useEffect, useState } from "react";
export function ManageProjectsLink() {
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/session",{cache:"no-store",signal:controller.signal}).then(response=>response.ok?response.json():null)
      .then(data=>setVisible(["owner","staff"].includes(data?.role))).catch(()=>{});
    return ()=>controller.abort();
  },[]);
  return visible?<p><a className="button button-small" href="/staff/content">Manage projects</a></p>:null;
}
