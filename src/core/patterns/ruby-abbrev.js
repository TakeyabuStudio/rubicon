import { execSticky } from './_util.js';
import { ruby } from '../ast.js';

/**
 * `abbrev`（略記ルビ）: 親文字が漢字のみのとき縦棒省略可。`漢字《ルビ》`。NOTATION §3.2。
 * パース専用（中間ASTでは general と同じ ruby ノードへ正規化。出力は general 等で行う）。
 * パース順は general(縦棒あり) → abbrev(縦棒なし) の順で試すこと。
 */
const RE = /([一-龠々〆ヶ]+)《([^《》\n]+)》/y;

export default {
  id: 'abbrev',
  kind: 'ruby',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: ruby(m[1], m[2]), length: m[0].length } : null;
  },
  // パース専用。サイト定義の ruby.render が 'abbrev' を指すことはない。
  // 万一参照された場合に備え general 形でフォールバック出力する。
  render(node, ctx) {
    const pipe = ctx.options.pipe === 'halfwidth' ? '|' : '｜';
    return `${pipe}${node.base}《${node.ruby}》`;
  },
};
