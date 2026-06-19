import { execSticky } from './_util.js';
import { ruby } from '../ast.js';

/**
 * `maho`（魔法のiらんど独自ルビ）: `_親文字@ルビ_`。NOTATION §3.4。
 * アンダースコアで囲み、半角 `@` で親文字とルビを区切る。一般ルビではない。
 * 本文中の通常のアンダースコアを誤検出しないよう、`_…@…_` の3記号がそろう場合のみマッチ。
 */
const RE = /_([^@_\n]+)@([^_\n]+)_/y;

export default {
  id: 'maho',
  kind: 'ruby',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: ruby(m[1], m[2]), length: m[0].length } : null;
  },
  render(node) {
    return `_${node.base}@${node.ruby}_`;
  },
};
