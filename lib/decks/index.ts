import type { DeckDef } from "../types";
import { exampleDeck } from "./example";

/**
 * デッキ一覧。1ファイル = 1デッキ で `lib/decks/*.tsx` に置き、
 * ここに追加することでファイル一覧ページ (`/`) と PDF 出力に反映される。
 */
export const decks: DeckDef[] = [exampleDeck];

export function findDeck(id: string): DeckDef | undefined {
  return decks.find((d) => d.id === id);
}
