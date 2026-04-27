# CLAUDE.md

slidekit リポジトリで作業する Claude Code 向けの指針。

## プロジェクト構造

```
slidekit/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # ルートレイアウト(フォント設定はここ)
│   ├── page.tsx               # ファイル一覧(デッキ一覧)ページ
│   ├── d/[deckId]/page.tsx    # デッキビューア(画面 / overview / print)
│   └── globals.css            # Tailwind + 印刷用 @page / @media print
├── components/
│   └── SlideFrame.tsx         # 1280x720 を画面に scale フィット / 印刷時は実寸
├── lib/
│   ├── types.ts               # SlideDef, DeckDef, SlideProps, SLIDE_WIDTH/HEIGHT
│   ├── decks/                 # ★ 1ファイル = 1デッキ(編集起点)
│   │   ├── index.ts           # decks: DeckDef[] と findDeck()
│   │   └── example.tsx        # サンプルデッキ
│   └── templates/default/     # 共通スライドテンプレート(任意で使う)
├── scripts/
│   └── export-pdf.ts          # `next start` → Playwright で各デッキを PDF 化
└── next.config.ts
```

## デッキ(ファイル)の追加・編集

ミーティング1回ぶん = 1 ファイル を `lib/decks/<id>.tsx` に置き、
`lib/decks/index.ts` の `decks` 配列に追加する。

```tsx
// lib/decks/all-hands-2026-04.tsx
import type { DeckDef } from "../types";

function TitleSlide() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <h1 className="text-7xl font-bold">全体定例 2026/04</h1>
    </div>
  );
}

export const allHands202604Deck: DeckDef = {
  id: "all-hands-2026-04",   // URL: /d/all-hands-2026-04
  title: "全体定例 2026/04",
  description: "全体定例で話した内容まとめ",
  slides: [
    { id: "title", component: TitleSlide },
    // ...
  ],
};
```

```ts
// lib/decks/index.ts
import { exampleDeck } from "./example";
import { allHands202604Deck } from "./all-hands-2026-04";

export const decks: DeckDef[] = [exampleDeck, allHands202604Deck];
```

`SlideDef` のシグネチャは従来どおり (`id`, `component`, `notes?`, `draft?`)。
共通テンプレを使いたい場合は `lib/templates/default` から取り回す。

## ファイル一覧 / オーバービュー / ドラフト

- **`/`**: ファイル一覧(デッキ一覧)ページ。各デッキのカバー(先頭スライド)
  サムネ + タイトル + slide count を一覧。`Open` で本編、`Overview` でデッキ
  内オーバービューに飛ぶ
- **`/d/<deckId>`**: デッキ本編。キーボード操作 / 全画面 / ハッシュジャンプ
- **`/d/<deckId>?overview=1`**: デッキ内オーバービュー(サムネグリッド)
- `SlideDef.draft = true` を付けたスライドは画面・PDF 双方からデフォルトで除外
  される(作りかけを残しつつデッキから外す用途)
- `?showDrafts=1` を併用するとドラフトも含めて表示・出力する。`pnpm export:pdf`
  でドラフトを PDF に乗せたい場合は、`scripts/export-pdf.ts` の URL に
  `&showDrafts=1` を一時的に足すか、ドラフトフラグを外す

## 設計上の制約

**1スライド = 1280x720 固定**

- `SLIDE_WIDTH` / `SLIDE_HEIGHT`(`lib/types.ts`)は変更しない
- 画面では `SlideFrame` が `transform: scale()` で自動フィット
- 印刷では `@page { size: 1280px 720px }`(`app/globals.css`)で実寸出力
- 画面用と印刷用でレイアウト2系統メンテを避けるための前提

## PDF 出力の仕組み

```
pnpm export:pdf [<deckId>]
  └─ scripts/export-pdf.ts
      ├─ next start (port 3456) を spawn
      ├─ 各デッキについて
      │   ├─ http://localhost:3456/d/<deckId>?print=1 にアクセス
      │   │   └─ app/d/[deckId]/page.tsx が isPrint 分岐 → 全スライドを縦並びレンダ
      │   ├─ document.fonts.ready を待機(日本語Webフォント豆腐化対策)
      │   └─ Playwright page.pdf({ width: 1280px, height: 720px, printBackground: true })
      │       → slides-<deckId>.pdf に書き出し
      └─ ...
```

引数なしで全デッキ、`pnpm export:pdf <deckId>` で単発出力。

`?print=1` スキームは PDF 出力の根幹。リファクタしない。

## 画面 / 印刷の出し分け

スライド内で要素を出し分けたい場合は Tailwind の `print:` ユーティリティを使う:

```tsx
<button className="print:hidden">クリック</button>
<div className="hidden print:block">印刷用の代替表示</div>
```

`app/globals.css` の `@media print` には**全体スタイル**だけを置く。
個別要素の出し分けは `print:` ユーティリティで対応する(CSS 分岐の散在を防ぐ)。

## フォント追加

`app/layout.tsx` で `next/font` を使う:

```tsx
import { Noto_Sans_JP } from "next/font/google";
const noto = Noto_Sans_JP({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={noto.className}>
      <body><Suspense>{children}</Suspense></body>
    </html>
  );
}
```

PDF 出力時も `document.fonts.ready` 待機があるので反映される。
追加後は必ず `pnpm export:pdf` で実際に PDF に乗っているか目視確認する。

## やってはいけないこと

- スライドサイズ(1280x720)の変更 — 印刷とPlaywright設定が連動しているため
- `?print=1` クエリスキームのリファクタ — PDF 出力パイプラインの根幹
- `app/globals.css` への画面/印刷分岐の追加 — `print:` ユーティリティで個別対応
- `next-env.d.ts` の手編集 — Next.js が自動生成する
- `lib/decks/<id>.tsx` 内で `next/font` などサーバ専用 API を使わない
  — 一覧ページからもインポートされるため、純粋な React コンポーネントに留める

## よく使うコマンド

```bash
pnpm dev                       # 開発サーバ(http://localhost:3000)
pnpm build                     # プロダクションビルド
pnpm export:pdf                # 全デッキを slides-<deckId>.pdf に出力
pnpm export:pdf <deckId>       # 1デッキだけ出力
```

## 開発手順の原則

ユーザのグローバル CLAUDE.md(TDD、コミット粒度、日本語コミットメッセージ等)に従う。
スライド本体はテスト対象外だが、`scripts/`、`lib/types.ts`、`lib/decks/index.ts`
のロジック変更時は最小限の確認を行う。
