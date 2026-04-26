"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SLIDE_WIDTH, SLIDE_HEIGHT } from "@/lib/types";

type Props = {
  children: ReactNode;
  /** When true, disables scaling (for PDF export). Set via ?print=1 */
  print?: boolean;
};

/**
 * Renders a slide at fixed 1280x720, scaled to fit viewport on screen.
 * For print, no scaling is applied so @page size matches exactly.
 */
export function SlideFrame({ children, print = false }: Props) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (print) return;
    const update = () => {
      const s = Math.min(
        window.innerWidth / SLIDE_WIDTH,
        window.innerHeight / SLIDE_HEIGHT,
      );
      setScale(s);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [print]);

  if (print) {
    return (
      <div
        className="slide-print bg-white text-slate-900"
        style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-slate-100">
      <div
        className="origin-center bg-white shadow-2xl"
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
