import { execSticky } from './_util.js';
import { bouten } from '../ast.js';

/**
 * `bouten_denden`（でんでん傍点）: `*テキスト*`。NOTATION §1.2。
 * でんでんマークダウンでは縦書き時に圏点化する（横書きは斜体になる点に注意）。
 * #28 Markdown も同一実装（NOTATION §2.3 は「統一傍点記法なし」と注記するが、
 * §3.5「でんでん式と同一実装」に従い `*..*` を採用）。
 */
const RE = /\*([^*\n]+)\*/y;

export default {
  id: 'bouten_denden',
  kind: 'bouten',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: bouten(m[1]), length: m[0].length } : null;
  },
  render(node) {
    return `*${node.value}*`;
  },
};
