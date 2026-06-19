import { execSticky } from './_util.js';
import { bouten } from '../ast.js';

/**
 * `bouten_html`（HTML #27 の傍点）。NOTATION §3.6 / §7-3 の判断事項。
 *
 * 【出力方式の決定（要 NOTATION §3.6 追記）】
 *   `<span style="text-emphasis: filled sesame; ...">テキスト</span>` を採用。
 *   理由: ゴマ点(sesame)は日本語の傍点慣習に最も近く、CSS text-emphasis が傍点の標準表現。
 *   コピーされる出力テキストは自己完結し、当サイトのDOMには挿入しないため CSP とは無関係。
 *
 * 入力パース: text-emphasis を含む span を傍点として受理する。
 */
const RE = /<span\s+style="[^"]*text-emphasis[^"]*"\s*>([\s\S]*?)<\/span>/y;
const STYLE = 'text-emphasis: filled sesame; -webkit-text-emphasis: filled sesame;';

export default {
  id: 'bouten_html',
  kind: 'bouten',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: bouten(m[1]), length: m[0].length } : null;
  },
  render(node) {
    return `<span style="${STYLE}">${node.value}</span>`;
  },
};
