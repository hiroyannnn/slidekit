# slidekit

React (Next.js + Tailwind) で書くスライドテンプレート。ブラウザで発表 → PlaywrightでPDF出力。

## Quick Start

`Use this template` で複製した直後に:

1. `pnpm install && pnpm exec playwright install chromium`
2. `package.json` の `name` をプロジェクト名に変更
3. `lib/decks/example.tsx` を編集して中身を差し替えるか、`lib/decks/<id>.tsx`
   を新規追加して `lib/decks/index.ts` の `decks` 配列に登録
4. `pnpm dev` で http://localhost:3000(ファイル一覧)を開いてデッキを選択
5. `pnpm export:pdf` でデッキごとに `slides-<deckId>.pdf` を生成

> Claude Code で作業する場合は `CLAUDE.md` の指針も参照。

## セットアップ

```bash
pnpm install
pnpm exec playwright install chromium
```

## 開発

```bash
pnpm dev
# http://localhost:3000  ← ファイル一覧(デッキ一覧)
```

- ルートはデッキ一覧ページ。各デッキを `Open` で本編、`Overview` でサムネ一覧
- デッキ本編 (`/d/<deckId>`) でのキー操作:
  - `→` `Space` `PageDown`: 次のスライド
  - `←` `PageUp`: 前のスライド
  - URL末尾の `#3` で3枚目に直接ジャンプ
  - `F`: 全画面切り替え

## スライド/デッキの追加

ミーティング1回ぶん = 1ファイルを `lib/decks/<id>.tsx` に置き、
`lib/decks/index.ts` の `decks` 配列に追加する。

```tsx
// lib/decks/all-hands-2026-04.tsx
import type { DeckDef, SlideProps } from "../types";

function TitleSlide(_: SlideProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <h1 className="text-7xl font-bold">全体定例 2026/04</h1>
    </div>
  );
}

export const allHands202604Deck: DeckDef = {
  id: "all-hands-2026-04",   // → /d/all-hands-2026-04
  title: "全体定例 2026/04",
  description: "全体定例で話した内容まとめ",
  slides: [
    { id: "title", component: TitleSlide },
  ],
};
```

```ts
// lib/decks/index.ts
import { exampleDeck } from "./example";
import { allHands202604Deck } from "./all-hands-2026-04";

export const decks: DeckDef[] = [exampleDeck, allHands202604Deck];
```

スライドは固定 `1280x720` で書く。画面表示時は自動で `transform: scale()` でフィット。

## PDF出力

```bash
pnpm build
pnpm export:pdf            # 全デッキを slides-<deckId>.pdf に出力
pnpm export:pdf example    # 1デッキだけ
```

手動で出したい場合は `pnpm dev` 起動後に `http://localhost:3000/d/<deckId>?print=1` を開いて `Cmd+P` → PDFとして保存。

## 設計メモ

- **画面と印刷で同じサイズ**: 全スライドを `1280x720` 基準で書く。画面では `scale` でフィット、印刷では `@page` で実寸出力。レイアウト崩れの2系統メンテを回避。
- **`?print=1` で全スライド縦並び**: PlaywrightからこのURLにアクセスすると、全スライドが1ページずつのPDFに変換される。
- **フォント待機**: PDF生成前に `document.fonts.ready` を待つ。日本語Webフォントの豆腐化を防ぐ。
- **`deviceScaleFactor: 2`**: Retina想定で2倍解像度。

## ハマりどころ

- **背景色が出ない**: `printBackground: true` と `print-color-adjust: exact` 両方必須。
- **アニメーションがPDFに出ない**: 当然なので、`@media print` で最終状態を表示する分岐を入れる。
- **インタラクティブ要素**: `print:hidden` と `hidden print:block` で出し分け。
