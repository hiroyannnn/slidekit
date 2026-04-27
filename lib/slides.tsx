import type { SlideDef } from "@/lib/types";
import {
  CodeSlide,
  ContentSlide,
  TitleSlide,
  TwoColumnSlide,
} from "@/lib/templates/default";

export const slides: SlideDef[] = [
  { id: "title", component: TitleSlide },
  {
    id: "why-react",
    component: ContentSlide,
    notes: "ここでエージェント連携の話を強調する",
  },
  { id: "print-css", component: CodeSlide },
  { id: "comparison", component: TwoColumnSlide },
];
