import { execSticky } from './_util.js';
import { ruby } from '../ast.js';

/**
 * `fujossy`（fujossy独自ルビ）: `｜親文字(ルビ)`。NOTATION §1.1 / §3.4。
 * fujossy は「記号すべて半角」。入力は全角｜も受理するが、出力は半角縦棒・半角括弧固定。
 * （NOTATION §3.4 の出力テンプレ表記 `｜{base}({ruby})` には全角｜が混じるが、
 *   同所の注記「記号すべて半角」を正として半角 `|` を採用。要再確認なら TODO。）
 */
const RE = /[｜|]([^｜|()（）\n]+)\(([^()\n]+)\)/y;

export default {
  id: 'fujossy',
  kind: 'ruby',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: ruby(m[1], m[2]), length: m[0].length } : null;
  },
  render(node) {
    return `|${node.base}(${node.ruby})`;
  },
};
