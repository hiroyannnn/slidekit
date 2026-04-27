import type { ComponentType } from "react";

export type SlideProps = {
  current: number;
  total: number;
};

export type SlideDef = {
  id: string;
  component: ComponentType<SlideProps>;
  notes?: string;
  draft?: boolean;
};

export type DeckDef = {
  /** URL path segment under /d/ — keep ASCII / kebab-case. */
  id: string;
  /** Display name shown on the file list page. */
  title: string;
  /** Optional one-liner shown under the title. */
  description?: string;
  slides: SlideDef[];
};

export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;
