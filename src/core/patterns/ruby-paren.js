import { execSticky } from './_util.js';
import { ruby } from '../ast.js';

/**
 * `paren`（丸括弧ルビ）: `漢字（ルビ）`。NOTATION §3.3。
 * 誤爆リスクが高い（通常の丸括弧の補足説明をルビと誤認する）ため、
 * 入力パーサでは既定無効。ユーザーが対応サイト(なろう/ノベルアップ＋/ノベラボ)で
 * 明示オプトインした場合のみ有効化する（buildActivePatterns 側で制御）。
 * パース専用。出力では使わず general 形で出す。
 */
const RE = /([一-龠々]+)[（(]([^（）()\n]+)[）)]/y;

export default {
  id: 'paren',
  kind: 'ruby',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: ruby(m[1], m[2]), length: m[0].length } : null;
  },
  render(node, ctx) {
    const pipe = ctx.options.pipe === 'halfwidth' ? '|' : '｜';
    return `${pipe}${node.base}《${node.ruby}》`;
  },
};
