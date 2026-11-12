"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function JobRefresh() {
  const router = useRouter();
  useEffect(() => {
    function refresh() {
      if (document.hidden || document.querySelector("form:focus-within, .chat-attach[open]")) return;
      for (const input of document.querySelectorAll<HTMLInputElement>('main input[type="file"]')) {
        if (input.files?.length) return;
      }
      router.refresh();
    }
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
  return null;
}
