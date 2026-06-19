import { execSticky } from './_util.js';
import { ruby } from '../ast.js';

/**
 * `general`（一般ルビ）: `｜親文字《ルビ》`。NOTATION §3.1。
 * 縦棒は全角｜(U+FF5C)・半角|(U+007C)の両方を受理。《》は U+300A/U+300B。
 * 出力の縦棒は ctx.options.pipe で全角/半角を切り替える（既定=全角。ツギクル等は半角）。
 */
// base/ruby は区切り文字(縦棒・《・》)を含まない＝他のルビ/傍点をまたいで誤マッチしない。
const RE = /[｜|]([^｜|《》\n]+)《([^《》\n]+)》/y;

export default {
  id: 'general',
  kind: 'ruby',
  /**
   * @param {string} input @param {number} pos
   * @returns {{node: import('../ast.js').RubyNode, length: number}|null}
   */
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: ruby(m[1], m[2]), length: m[0].length } : null;
  },
  /** @param {import('../ast.js').RubyNode} node */
  render(node, ctx) {
    const pipe = ctx.options.pipe === 'halfwidth' ? '|' : '｜';
    return `${pipe}${node.base}《${node.ruby}》`;
  },
};
