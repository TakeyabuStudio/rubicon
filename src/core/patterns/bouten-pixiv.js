import { execSticky } from './_util.js';
import { bouten } from '../ast.js';

/**
 * `bouten_pixiv`（pixiv独自傍点）: `[[emphasismark:テキスト>﹅]]`。NOTATION §1.2。
 * 記号(`>` の後)は変更可だが、中間ASTでは黒ゴマ1種に正規化するため入力では破棄し、
 * 出力は標準のゴマ点 `﹅`(U+FE45) 固定とする。Xfolio も pixiv 準拠。
 */
const RE = /\[\[emphasismark:([^>\]\n]+)>([^\]\n]+)\]\]/y;
const MARK = '﹅';

export default {
  id: 'bouten_pixiv',
  kind: 'bouten',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: bouten(m[1]), length: m[0].length } : null;
  },
  render(node) {
    return `[[emphasismark:${node.value}>${MARK}]]`;
  },
};
