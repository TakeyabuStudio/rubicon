import { execSticky } from './_util.js';
import { ruby } from '../ast.js';

/**
 * `html`（HTMLルビタグ）: `<ruby>親<rt>ルビ</rt></ruby>`。NOTATION §3.6。
 * Privatter(#22) も html を共用（公式取説で `<ruby><rt><rp>` を案内）。
 *
 * 入力パース: `<ruby>`〜`</ruby>` を解析。`<rp>` 内は破棄、`<rt>` 内をルビ、
 * それ以外（`<rb>` は除去）を親文字とする。
 * 出力: rp 付き・互換重視の形で生成する。
 */
const RE = /<ruby>([\s\S]*?)<\/ruby>/y;

export default {
  id: 'html',
  kind: 'ruby',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    if (!m) return null;
    let inner = m[1];
    inner = inner.replace(/<rp>[\s\S]*?<\/rp>/g, '');
    const rt = inner.match(/<rt>([\s\S]*?)<\/rt>/);
    const rubyText = rt ? rt[1] : '';
    const base = inner
      .replace(/<rt>[\s\S]*?<\/rt>/g, '')
      .replace(/<\/?rb>/g, '')
      .trim();
    return { node: ruby(base, rubyText), length: m[0].length };
  },
  render(node) {
    return `<ruby>${node.base}<rp>（</rp><rt>${node.ruby}</rt><rp>）</rp></ruby>`;
  },
};
