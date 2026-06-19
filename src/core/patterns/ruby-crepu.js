import { execSticky } from './_util.js';
import { ruby } from '../ast.js';

/**
 * `crepu`（くるっぷ独自ルビ）: `[RB:親文字,ルビ]`。NOTATION §3.4。
 */
const RE = /\[RB:([^,\]\n]+),([^\]\n]+)\]/y;

export default {
  id: 'crepu',
  kind: 'ruby',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: ruby(m[1], m[2]), length: m[0].length } : null;
  },
  render(node) {
    return `[RB:${node.base},${node.ruby}]`;
  },
};
