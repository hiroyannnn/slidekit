# slidekit

React (Next.js + Tailwind) で書くスライドテンプレート。ブラウザで発表 → PlaywrightでPDF出力。

## Quick Start

`Use this template` で複製した直後に:

1. `pnpm install && pnpm exec playwright install chromium`
2. `package.json` の `name` をプロジェクト名に変更
3. `lib/slides.tsx` を編集してスライドを差し替え(サンプル4枚が編集起点)
4. `pnpm dev` で http://localhost:3000 を開いて確認
5. `pnpm export:pdf` で `slides.pdf` を生成

> Claude Code で作業する場合は `CLAUDE.md` の指針も参照。

## セットアップ

```bash
pnpm install
pnpm exec playwright install chromium
```

## 開発

```bash
pnpm dev
# http://localhost:3000
```

- `→` `Space` `PageDown`: 次のスライド
- `←` `PageUp`: 前のスライド
- URL末尾の `#3` で3枚目に直接ジャンプ

## スライドの追加

`lib/slides.tsx` の `slides` 配列にコンポーネントを足すだけ。1スライド = 1コンポーネント。

```tsx
function MySlide(props: SlideProps) {
  return (
    <div className="relative h-full w-full p-16">
      <h2 className="text-5xl font-bold">タイトル</h2>
      <PageNumber {...props} />
    </div>
  );
}

// 配列に追加
{ id: "my-slide", component: MySlide, notes: "発表メモ" }
```

スライドは固定 `1280x720` で書く。画面表示時は自動で `transform: scale()` でフィット。

## PDF出力

```bash
pnpm build
pnpm export:pdf
# → slides.pdf
```

手動で出したい場合は `pnpm dev` 起動後に `http://localhost:3000/?print=1` を開いて `Cmd+P` → PDFとして保存。

## 設計メモ

- **画面と印刷で同じサイズ**: 全スライドを `1280x720` 基準で書く。画面では `scale` でフィット、印刷では `@page` で実寸出力。レイアウト崩れの2系統メンテを回避。
- **`?print=1` で全スライド縦並び**: PlaywrightからこのURLにアクセスすると、全スライドが1ページずつのPDFに変換される。
- **フォント待機**: PDF生成前に `document.fonts.ready` を待つ。日本語Webフォントの豆腐化を防ぐ。
- **`deviceScaleFactor: 2`**: Retina想定で2倍解像度。

## ハマりどころ

- **背景色が出ない**: `printBackground: true` と `print-color-adjust: exact` 両方必須。
- **アニメーションがPDFに出ない**: 当然なので、`@media print` で最終状態を表示する分岐を入れる。
- **インタラクティブ要素**: `print:hidden` と `hidden print:block` で出し分け。
