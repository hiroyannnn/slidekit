"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlideFrame } from "@/components/SlideFrame";
import { slides } from "@/lib/slides";

export default function DeckPage() {
  const searchParams = useSearchParams();
  const isPrint = searchParams.get("print") === "1";
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    if (isPrint) return;
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [isPrint]);

  // Sync with URL hash
  useEffect(() => {
    if (isPrint) return;
    const fromHash = () => {
      const n = parseInt(window.location.hash.slice(1), 10);
      if (!Number.isNaN(n) && n >= 1 && n <= slides.length) {
        setIndex(n - 1);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [isPrint]);

  // Keyboard navigation
  useEffect(() => {
    if (isPrint) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        setIndex((i) => {
          const next = Math.min(i + 1, slides.length - 1);
          window.location.hash = String(next + 1);
          return next;
        });
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setIndex((i) => {
          const next = Math.max(i - 1, 0);
          window.location.hash = String(next + 1);
          return next;
        });
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPrint, toggleFullscreen]);

  // Print mode: render all slides stacked for PDF export
  if (isPrint) {
    return (
      <div className="print-root">
        {slides.map((s, i) => {
          const Slide = s.component;
          return (
            <SlideFrame key={s.id} print>
              <Slide current={i + 1} total={slides.length} />
            </SlideFrame>
          );
        })}
      </div>
    );
  }

  // Screen mode: one slide at a time
  const Slide = slides[index].component;
  return (
    <>
      <SlideFrame>
        <Slide current={index + 1} total={slides.length} />
      </SlideFrame>
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
        className="fixed bottom-4 right-4 rounded-md bg-slate-900/60 px-3 py-2 text-xs text-white shadow-lg backdrop-blur transition hover:bg-slate-900 print:hidden"
      >
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>
    </>
  );
}
