import { execSticky } from './_util.js';
import { bouten } from '../ast.js';

/**
 * `bouten_fujossy`（fujossy独自傍点）: `:テキスト|`。コロン＋縦棒、半角。NOTATION §1.2。
 */
const RE = /:([^|\n]+)\|/y;

export default {
  id: 'bouten_fujossy',
  kind: 'bouten',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: bouten(m[1]), length: m[0].length } : null;
  },
  render(node) {
    return `:${node.value}|`;
  },
};
