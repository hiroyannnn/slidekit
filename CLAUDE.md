# CLAUDE.md

slidekit リポジトリで作業する Claude Code 向けの指針。

## プロジェクト構造

```
slidekit/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # ルートレイアウト(フォント設定はここ)
│   ├── page.tsx          # キーボード操作・印刷モード分岐
│   └── globals.css       # Tailwind + 印刷用 @page / @media print
├── components/
│   └── SlideFrame.tsx    # 1280x720 を画面に scale フィット / 印刷時は実寸
├── lib/
│   ├── types.ts          # SlideDef, SlideProps, SLIDE_WIDTH/HEIGHT 定数
│   └── slides.tsx        # スライド本体(編集起点)
├── scripts/
│   └── export-pdf.ts     # `next start` → Playwright で PDF 出力
└── next.config.ts
```

## スライドの追加・編集

`lib/slides.tsx` の `slides: SlideDef[]` 配列にコンポーネントを追加するだけ。

```tsx
function MySlide(props: SlideProps) {
  return (
    <div className="relative h-full w-full p-16">
      <h2 className="text-5xl font-bold">タイトル</h2>
      <PageNumber {...props} />
    </div>
  );
}

export const slides: SlideDef[] = [
  // ...
  { id: "my-slide", component: MySlide, notes: "発表メモ(任意)" },
];
```

## 設計上の制約

**1スライド = 1280x720 固定**

- `SLIDE_WIDTH` / `SLIDE_HEIGHT`(`lib/types.ts`)は変更しない
- 画面では `SlideFrame` が `transform: scale()` で自動フィット
- 印刷では `@page { size: 1280px 720px }`(`app/globals.css`)で実寸出力
- 画面用と印刷用でレイアウト2系統メンテを避けるための前提

## PDF 出力の仕組み

```
pnpm export:pdf
  └─ scripts/export-pdf.ts
      ├─ next start (port 3456) を spawn
      ├─ http://localhost:3456/?print=1 にアクセス
      │   └─ app/page.tsx が isPrint 分岐 → 全スライドを縦並びレンダ
      ├─ document.fonts.ready を待機(日本語Webフォント豆腐化対策)
      └─ Playwright page.pdf({ width: 1280px, height: 720px, printBackground: true })
```

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

## よく使うコマンド

```bash
pnpm dev          # 開発サーバ(http://localhost:3000)
pnpm build        # プロダクションビルド
pnpm export:pdf   # slides.pdf を生成(事前に pnpm build が必要、内部で next start を spawn)
```

## 開発手順の原則

ユーザのグローバル CLAUDE.md(TDD、コミット粒度、日本語コミットメッセージ等)に従う。
スライド本体はテスト対象外だが、`scripts/` や `lib/types.ts` のロジック変更時は最小限の確認を行う。
