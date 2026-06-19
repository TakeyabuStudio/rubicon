import { execSticky } from './_util.js';
import { ruby } from '../ast.js';

/**
 * ノベルアップ＋ 専用の略記ルビ拡張: 親文字が英字 `abc《》` / 数字 `123《》` のケース。
 * NOTATION §2.1 #4 に `abc《》` / `123《》` を別記法として明記。
 * 親文字の文字クラスは半角/全角の英数字とする（NOTATION本文の `abc`/`123` 表記からの解釈。
 * 漢字は ruby-abbrev が担当するので重複させない）。パース専用。
 */
const RE = /([A-Za-zＡ-Ｚａ-ｚ0-9０-９]+)《([^《》\n]+)》/y;

export default {
  id: 'abbrev_alnum',
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
