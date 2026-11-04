"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { ChatMessage } from "@/lib/job-conversation";

const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", hour: "2-digit", minute: "2-digit" });
const day = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", year: "numeric", month: "short", day: "numeric" });
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();

export function JobConversation({ initial, endpoint, children }: { initial: ChatMessage[]; endpoint: string; children: ReactNode }) {
  const [messages, setMessages] = useState(initial);
  const [unavailable, setUnavailable] = useState(false);
  const [offline, setOffline] = useState(false);
  const [newBelow, setNewBelow] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const follow = useRef(true);
  const last = useRef<string | undefined>(undefined);

  useEffect(() => {
    setMessages(initial);
    const controller = new AbortController();
    let fetching = false;
    async function refresh() {
      if (fetching || document.hidden || controller.signal.aborted) return;
      fetching = true;
      try {
        const response = await fetch(endpoint, { cache: "no-store", redirect: "manual", signal: controller.signal });
        if (response.type === "opaqueredirect" || [401, 403, 404].includes(response.status)) {
          setUnavailable(true);
          controller.abort();
          return;
        }
        if (!response.ok) throw new Error();
        const next: ChatMessage[] = await response.json();
        if (!controller.signal.aborted) {
          setMessages(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
          setOffline(false);
        }
      } catch { if (!controller.signal.aborted) setOffline(true); }
      finally { fetching = false; }
    }
    const timer = window.setInterval(refresh, 3000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [endpoint, initial]);

  useLayoutEffect(() => {
    const box = list.current;
    if (!box) return;
    const tail = messages.at(-1)?.id;
    if (follow.current) box.scrollTop = box.scrollHeight;
    else if (tail !== last.current) setNewBelow(true);
    last.current = tail;
  }, [messages]);

  useEffect(() => {
    const box = list.current;
    if (!box || unavailable || !("IntersectionObserver" in window)) return;
    const controller = new AbortController();
    const visible = new Set<string>();
    let saving = false;
    let timer = 0;
    async function record() {
      if (saving || document.hidden || !document.hasFocus() || !visible.size) return;
      const ids = [...visible].slice(0, 50);
      saving = true;
      try {
        const response = await fetch(endpoint, { method: "POST", redirect: "manual", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }), signal: controller.signal });
        if (response.ok) ids.forEach(id => visible.delete(id));
      } catch { /* Retry visible messages on the next tick. */ }
      finally { saving = false; }
    }
    const schedule = () => { window.clearTimeout(timer); timer = window.setTimeout(record, 250); };
    // A viewport-rooted observer clips against BOTH the scroll pane and the page.
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.unseen!;
        if (entry.isIntersecting && entry.intersectionRect.height >= 1) visible.add(id);
        else visible.delete(id);
      }
      schedule();
    });
    box.querySelectorAll("[data-unseen]").forEach(node => observer.observe(node));
    window.addEventListener("focus", schedule);
    document.addEventListener("visibilitychange", schedule);
    const retry = window.setInterval(record, 3000);
    return () => {
      controller.abort();
      observer.disconnect();
      window.clearTimeout(timer);
      window.clearInterval(retry);
      window.removeEventListener("focus", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [endpoint, messages, unavailable]);

  return <section className="account-card job-chat" aria-labelledby="conversation-heading">
    <header><h2 id="conversation-heading">Job conversation</h2><p className="field-hint">Shared with Mias and this job’s invited contacts · Zambia time</p></header>
    {unavailable ? <p role="alert">This conversation is no longer available. Sign in again or contact Mias about your access.</p> : <>
      <ol className="chat-thread" ref={list} aria-label="Conversation history" tabIndex={0} onScroll={event => {
        const box = event.currentTarget;
        follow.current = box.scrollHeight - box.scrollTop - box.clientHeight < 32;
        if (follow.current) setNewBelow(false);
      }}>
        {!messages.length && <li className="chat-empty">No messages yet. Start the conversation below.</li>}
        {messages.map((message, i) => {
          const date = new Date(message.at);
          const dateLabel = day.format(date);
          return <li key={message.id} className={message.own ? "chat-row own" : "chat-row"}>
            {(i === 0 || day.format(new Date(messages[i - 1].at)) !== dateLabel) && <div className="chat-date">{dateLabel}</div>}
            <div className="chat-line"><span className="chat-avatar" aria-hidden="true">{initials(message.author)}</span>
              <div className="chat-bubble" data-unseen={!message.own && !message.seen ? message.id : undefined}>
                <div className="chat-by"><strong>{message.author}{message.own && " · You"}</strong><time dateTime={message.at}>{time.format(date)}</time></div>
                {message.update && <strong className="chat-update">Job update</strong>}
                <p>{message.body}</p>
                {message.own && <small className="chat-receipt">{message.reads.length ? message.reads.map((read, n) =>
                  <span key={n}>✓✓ Read by {read.name} · <time dateTime={read.at} title={day.format(new Date(read.at))}>{time.format(new Date(read.at))}</time></span>) : "✓ Sent"}</small>}
              </div>
            </div>
          </li>;
        })}
      </ol>
      {newBelow && <button type="button" className="chat-jump" onClick={() => { if (list.current) list.current.scrollTop = list.current.scrollHeight; follow.current = true; setNewBelow(false); }}>New messages ↓</button>}
      {offline && <p className="field-hint">Waiting to reconnect. New messages will appear when the connection returns.</p>}
      {children}
    </>}
  </section>;
}
