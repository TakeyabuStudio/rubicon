import { execSticky } from './_util.js';
import { bouten } from '../ast.js';

/**
 * `bouten_ruby`（中黒代用の傍点）: `｜テキスト《・・》`。NOTATION §1.2 / §3.1。
 * ルビに中黒(・ U+30FB)を当てて傍点を代用する。中黒の数＝親文字の文字数。
 * 出力時は value の文字数ぶん `・` を並べる（MVP方針: まとめて中黒N個）。
 */
const RE = /[｜|]([^｜|《》\n]+)《(・+)》/y;

export default {
  id: 'bouten_ruby',
  kind: 'bouten',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: bouten(m[1]), length: m[0].length } : null;
  },
  /** @param {import('../ast.js').BoutenNode} node */
  render(node, ctx) {
    const pipe = ctx.options.pipe === 'halfwidth' ? '|' : '｜';
    const dots = '・'.repeat([...node.value].length);
    return `${pipe}${node.value}《${dots}》`;
  },
};
