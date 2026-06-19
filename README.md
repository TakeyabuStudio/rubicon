# るびこん (Rubicon)

WEB小説投稿サイト **28形式** のルビ・傍点・字下げ・空白記法を相互変換する、完全クライアントサイドのWEBツール。

- 公開: https://rubicon.pages.dev/
- ライセンス: MIT
- 運営: [Takeyabu Studio](https://takeyabustudio.github.io/)

## プライバシー保証（データ送信ゼロ）

入力した小説は **あなたのブラウザの中だけ** で処理されます。

- 変換はすべてクライアントサイドの JavaScript で完結します。
- `fetch` / `XMLHttpRequest` / `WebSocket` / `sendBeacon` などの送信APIをコードに一切含みません。
- トラッキング・解析ツールは導入していません。Cookie も使いません。
- 全コードを本リポジトリで公開しています。開発者ツールのネットワークタブで送信ゼロを検証できます。

## アーキテクチャ

入力サイトのパーサ → **中間AST** → 出力サイトのレンダラ という中間表現方式で、N×N の変換組み合わせ爆発を防いでいます。

- 記法の定義は `RUBICON_NOTATION.md` が唯一の正。
- 見た目（UI/レイアウト/色）は `RUBICON_mockup.html` が唯一の正。
- 28サイトの記法は少数の「パターン」に収束する。`src/core/patterns/` がパターン実装、
  `src/sites/definitions/*.json` が各サイトへのパターン割り当て。

```
src/
├── core/            変換エンジン（UIから独立・テスト可能）
│   ├── ast.js       中間ASTのノード定義
│   ├── parse.js     入力テキスト → AST
│   ├── render.js    AST → 出力テキスト
│   ├── tokenizer.js 行レベル＋インライン走査
│   └── patterns/    ルビ/傍点の各記法パターン
├── sites/           28サイト定義（パターンID割り当て）
├── ui/              変換UIの結線（innerHTML不使用・textContentのみ）
└── styles/          デザイントークン + メインスタイル
```

## 開発

```bash
npm install      # 依存: vite / vitest（ともに MIT、ランタイム依存ゼロ）
npm run dev      # 開発サーバ（ホットリロード）
npm test         # NOTATION §6 のテストケースを検証
npm run build    # dist/ へプロダクションビルド
```

## 配信

Cloudflare Pages（`rubicon.pages.dev`）。`public/_headers` でセキュリティヘッダを付与し、
securityheaders.com A評価を目標とします。
