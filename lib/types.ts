import type { ComponentType } from "react";

export type SlideProps = {
  current: number;
  total: number;
};

export type SlideDef = {
  id: string;
  component: ComponentType<SlideProps>;
  notes?: string;
};

export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;
