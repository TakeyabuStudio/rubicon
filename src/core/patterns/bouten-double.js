import { execSticky } from './_util.js';
import { bouten } from '../ast.js';

/**
 * `bouten_double`（二重山括弧の専用傍点）: `《《テキスト》》`。NOTATION §1.2。
 * カクヨム・アルファポリス・ハーメルン等。
 */
const RE = /《《([^《》\n]+)》》/y;

export default {
  id: 'bouten_double',
  kind: 'bouten',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: bouten(m[1]), length: m[0].length } : null;
  },
  render(node) {
    return `《《${node.value}》》`;
  },
};
