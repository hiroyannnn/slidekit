import type { SlideDef, SlideProps } from "@/lib/types";

function PageNumber({ current, total }: SlideProps) {
  return (
    <div className="absolute bottom-6 right-8 text-sm text-slate-400">
      {current} / {total}
    </div>
  );
}

function TitleSlide(props: SlideProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white">
      <h1 className="text-7xl font-bold tracking-tight">Slides in React</h1>
      <p className="mt-6 text-2xl text-slate-300">
        Next.js + Tailwind + Print CSS
      </p>
      <PageNumber {...props} />
    </div>
  );
}

function ContentSlide(props: SlideProps) {
  return (
    <div className="relative h-full w-full p-16">
      <h2 className="text-5xl font-bold text-slate-900">なぜReactで書くのか</h2>
      <ul className="mt-12 space-y-6 text-2xl text-slate-700">
        <li>• エージェントのフィードバックループが速い</li>
        <li>• CSSとコンポーネントで自由に表現できる</li>
        <li>• 差分修正がコンポーネント単位で完結</li>
        <li>• PDF出力もブラウザ印刷機能で完結</li>
      </ul>
      <PageNumber {...props} />
    </div>
  );
}

function CodeSlide(props: SlideProps) {
  return (
    <div className="relative h-full w-full p-16">
      <h2 className="text-5xl font-bold text-slate-900">印刷CSS</h2>
      <pre className="mt-10 rounded-lg bg-slate-900 p-8 text-lg text-slate-100">
        <code>{`@page {
  size: 1280px 720px;
  margin: 0;
}
@media print {
  .slide-print {
    page-break-after: always;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}`}</code>
      </pre>
      <PageNumber {...props} />
    </div>
  );
}

function TwoColumnSlide(props: SlideProps) {
  return (
    <div className="relative grid h-full w-full grid-cols-2 gap-12 p-16">
      <div>
        <h3 className="text-3xl font-bold text-emerald-700">React有利</h3>
        <ul className="mt-6 space-y-3 text-xl text-slate-700">
          <li>表現力</li>
          <li>エージェント親和性</li>
          <li>差分修正</li>
        </ul>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-amber-700">Marp/pptx有利</h3>
        <ul className="mt-6 space-y-3 text-xl text-slate-700">
          <li>共同編集</li>
          <li>テンプレ準拠</li>
          <li>厳密なページ制御</li>
        </ul>
      </div>
      <PageNumber {...props} />
    </div>
  );
}

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
