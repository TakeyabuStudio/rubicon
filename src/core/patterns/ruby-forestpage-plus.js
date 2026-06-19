import { execSticky } from './_util.js';
import { ruby } from '../ast.js';

/**
 * `forestpage+`（forestpage+独自ルビ）: `[#ruby=親文字_ルビ#]`。NOTATION §3.4。
 */
const RE = /\[#ruby=([^_\n]+?)_([^#\n]+?)#\]/y;

export default {
  id: 'forestpage_plus',
  kind: 'ruby',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: ruby(m[1], m[2]), length: m[0].length } : null;
  },
  render(node) {
    return `[#ruby=${node.base}_${node.ruby}#]`;
  },
};
