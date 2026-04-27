import type { DeckDef } from "../types";
import {
  CodeSlide,
  ContentSlide,
  TitleSlide,
  TwoColumnSlide,
} from "../templates/default";

export const exampleDeck: DeckDef = {
  id: "example",
  title: "サンプルデッキ",
  description: "テンプレートに同梱のサンプル(編集起点)",
  slides: [
    { id: "title", component: TitleSlide },
    {
      id: "why-react",
      component: ContentSlide,
      notes: "ここでエージェント連携の話を強調する",
    },
    { id: "print-css", component: CodeSlide },
    { id: "comparison", component: TwoColumnSlide },
  ],
};
