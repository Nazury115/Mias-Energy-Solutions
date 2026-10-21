"use client";
import { useRef, type CSSProperties } from "react";
import { useScrollProgress } from "@/lib/use-scroll-progress";

// Each word brightens as the statement is scrolled through; screen readers get the plain sentence.
export function ScrollStatement({ text }: { text: string }) {
  const statement = useRef<HTMLParagraphElement>(null);
  useScrollProgress(statement, "read");
  const words = text.split(" ");
  return <p ref={statement} className="scroll-statement" style={{ "--words": words.length } as CSSProperties}>
    <span className="visually-hidden">{text}</span>
    <span aria-hidden="true">{words.map((word, index) => <span key={index} className="statement-word" style={{ "--i": index } as CSSProperties}>{word} </span>)}</span>
  </p>;
}
