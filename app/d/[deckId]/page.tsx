"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { SlideFrame } from "@/components/SlideFrame";
import { findDeck } from "@/lib/decks";

export default function DeckPage() {
  const params = useParams<{ deckId: string }>();
  const deckId = params.deckId;
  const deck = findDeck(deckId);

  const searchParams = useSearchParams();
  const isPrint = searchParams.get("print") === "1";
  const isOverview = searchParams.get("overview") === "1";
  const showDrafts = searchParams.get("showDrafts") === "1";
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Drafts are hidden by default in every mode (screen / overview / print).
  // Use ?showDrafts=1 to include them. PDF export hits ?print=1 per deck, so
  // drafts stay out of the per-deck PDF unless explicitly opted in.
  const visibleSlides = useMemo(
    () =>
      deck
        ? showDrafts
          ? deck.slides
          : deck.slides.filter((s) => !s.draft)
        : [],
    [deck, showDrafts],
  );

  const overviewHref = useMemo(() => {
    const qp = new URLSearchParams();
    qp.set("overview", "1");
    if (showDrafts) qp.set("showDrafts", "1");
    return `/d/${deckId}?${qp.toString()}`;
  }, [deckId, showDrafts]);

  const slideHref = useCallback(
    (n: number) => {
      const qp = new URLSearchParams();
      if (showDrafts) qp.set("showDrafts", "1");
      const qs = qp.toString();
      return `/d/${deckId}${qs ? `?${qs}` : ""}#${n}`;
    },
    [deckId, showDrafts],
  );

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.warn("Failed to exit fullscreen:", err);
      });
    } else {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Failed to enter fullscreen:", err);
      });
    }
  }, []);

  useEffect(() => {
    if (isPrint || isOverview) return;
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [isPrint, isOverview]);

  // Sync with URL hash
  useEffect(() => {
    if (isPrint || isOverview) return;
    const fromHash = () => {
      const n = parseInt(window.location.hash.slice(1), 10);
      if (!Number.isNaN(n) && n >= 1 && n <= visibleSlides.length) {
        setIndex(n - 1);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [isPrint, isOverview, visibleSlides.length]);

  // Keyboard navigation
  useEffect(() => {
    if (isPrint || isOverview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        setIndex((i) => {
          const next = Math.min(i + 1, visibleSlides.length - 1);
          window.location.hash = String(next + 1);
          return next;
        });
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setIndex((i) => {
          const next = Math.max(i - 1, 0);
          window.location.hash = String(next + 1);
          return next;
        });
      } else if (
        (e.key === "f" || e.key === "F") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPrint, isOverview, visibleSlides.length, toggleFullscreen]);

  if (!deck) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 text-slate-600">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold text-slate-900">
            デッキが見つかりません: {deckId}
          </p>
          <p className="mt-2 text-sm">
            <a href="/" className="text-slate-700 underline">
              ファイル一覧へ戻る
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Print mode: render all slides stacked for PDF export
  if (isPrint) {
    return (
      <div className="print-root">
        {visibleSlides.map((s, i) => {
          const Slide = s.component;
          return (
            <SlideFrame key={s.id} print>
              <Slide current={i + 1} total={visibleSlides.length} />
            </SlideFrame>
          );
        })}
      </div>
    );
  }

  // Overview mode: thumbnail grid for managing the deck
  if (isOverview) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-500">
                <a href="/" className="hover:underline">
                  ← ファイル一覧
                </a>
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {deck.title}
              </h1>
              <p className="text-sm text-slate-600">
                {visibleSlides.length} slide
                {visibleSlides.length === 1 ? "" : "s"}
                {showDrafts ? " (drafts shown)" : ""}
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <a
                href={
                  showDrafts
                    ? `/d/${deckId}?overview=1`
                    : `/d/${deckId}?overview=1&showDrafts=1`
                }
                className="rounded-md bg-white px-3 py-2 text-slate-700 shadow hover:bg-slate-50"
              >
                {showDrafts ? "Hide drafts" : "Show drafts"}
              </a>
              <a
                href={slideHref(1)}
                className="rounded-md bg-slate-900 px-3 py-2 text-white shadow hover:bg-slate-800"
              >
                Open deck
              </a>
            </div>
          </header>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
            {visibleSlides.map((s, i) => {
              const Slide = s.component;
              return (
                <a
                  key={s.id}
                  href={slideHref(i + 1)}
                  className="group flex flex-col gap-2"
                >
                  <div className="overflow-hidden rounded-md ring-1 ring-slate-200 transition group-hover:ring-2 group-hover:ring-slate-900">
                    <SlideFrame thumbnailWidth={320}>
                      <Slide current={i + 1} total={visibleSlides.length} />
                    </SlideFrame>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="truncate">
                      <span className="font-mono text-slate-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>{" "}
                      {s.id}
                    </span>
                    {s.draft && (
                      <span className="rounded bg-amber-200 px-1.5 py-0.5 text-amber-900">
                        draft
                      </span>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Screen mode: one slide at a time
  if (visibleSlides.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 text-slate-600">
        このデッキにはスライドがありません(
        <code className="mx-1">lib/decks/{deckId}.tsx</code>)。
      </div>
    );
  }
  const safeIndex = Math.min(index, visibleSlides.length - 1);
  const Slide = visibleSlides[safeIndex].component;
  return (
    <>
      <SlideFrame>
        <Slide current={safeIndex + 1} total={visibleSlides.length} />
      </SlideFrame>
      {!isFullscreen && (
        <div className="fixed bottom-4 right-4 flex gap-2 print:hidden">
          <a
            href="/"
            aria-label="Files"
            title="Files"
            className="rounded-md bg-slate-900/60 px-3 py-2 text-xs text-white shadow-lg backdrop-blur transition hover:bg-slate-900"
          >
            Files
          </a>
          <a
            href={overviewHref}
            aria-label="Overview"
            title="Overview"
            className="rounded-md bg-slate-900/60 px-3 py-2 text-xs text-white shadow-lg backdrop-blur transition hover:bg-slate-900"
          >
            Overview
          </a>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Enter fullscreen"
            title="Fullscreen (F)"
            className="rounded-md bg-slate-900/60 px-3 py-2 text-xs text-white shadow-lg backdrop-blur transition hover:bg-slate-900"
          >
            Fullscreen
          </button>
        </div>
      )}
    </>
  );
}
