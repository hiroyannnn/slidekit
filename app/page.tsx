"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SlideFrame } from "@/components/SlideFrame";
import { decks } from "@/lib/decks";

export default function DeckListPage() {
  const searchParams = useSearchParams();
  const showDrafts = searchParams.get("showDrafts") === "1";

  const items = useMemo(
    () =>
      decks.map((deck) => {
        const visible = showDrafts
          ? deck.slides
          : deck.slides.filter((s) => !s.draft);
        const cover = visible[0] ?? deck.slides[0];
        return { deck, visible, cover };
      }),
    [showDrafts],
  );

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Slide files</h1>
            <p className="text-sm text-slate-600">
              {decks.length} deck{decks.length === 1 ? "" : "s"}
              {showDrafts ? " (drafts shown)" : ""}
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <a
              href={showDrafts ? "/" : "/?showDrafts=1"}
              className="rounded-md bg-white px-3 py-2 text-slate-700 shadow hover:bg-slate-50"
            >
              {showDrafts ? "Hide drafts" : "Show drafts"}
            </a>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="rounded-md bg-white p-8 text-slate-600 shadow">
            デッキがありません。<code className="mx-1">lib/decks/</code> に
            ファイルを追加して <code className="mx-1">lib/decks/index.ts</code>{" "}
            に登録してください。
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
            {items.map(({ deck, visible, cover }) => {
              const Cover = cover?.component;
              const deckHref = showDrafts
                ? `/d/${deck.id}?showDrafts=1`
                : `/d/${deck.id}`;
              const overviewHref = showDrafts
                ? `/d/${deck.id}?overview=1&showDrafts=1`
                : `/d/${deck.id}?overview=1`;
              return (
                <div key={deck.id} className="flex flex-col gap-2">
                  <a href={deckHref} className="group block">
                    <div className="overflow-hidden rounded-md ring-1 ring-slate-200 transition group-hover:ring-2 group-hover:ring-slate-900">
                      <SlideFrame thumbnailWidth={320}>
                        {Cover ? (
                          <Cover current={1} total={visible.length || 1} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            (空のデッキ)
                          </div>
                        )}
                      </SlideFrame>
                    </div>
                  </a>
                  <div className="flex items-baseline justify-between gap-2">
                    <a
                      href={deckHref}
                      className="truncate text-base font-semibold text-slate-900 hover:underline"
                    >
                      {deck.title}
                    </a>
                    <span className="shrink-0 font-mono text-xs text-slate-500">
                      {visible.length} slide
                      {visible.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {deck.description && (
                    <p className="text-xs text-slate-600">{deck.description}</p>
                  )}
                  <div className="flex gap-2 text-xs">
                    <a
                      href={deckHref}
                      className="rounded bg-slate-900 px-2 py-1 text-white hover:bg-slate-800"
                    >
                      Open
                    </a>
                    <a
                      href={overviewHref}
                      className="rounded bg-white px-2 py-1 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Overview
                    </a>
                    <span className="ml-auto self-center font-mono text-slate-400">
                      {deck.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
