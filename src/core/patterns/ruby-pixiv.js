import { execSticky } from './_util.js';
import { ruby } from '../ast.js';

/**
 * `pixiv`（pixiv小説独自ルビ）: `[[rb:親文字 > ルビ]]`。NOTATION §3.4。
 * Xfolio も pixiv 準拠。`>` 前後の半角スペースは入力では任意、出力は ` > ` 固定。
 */
const RE = /\[\[rb:([^>\]\n]+?)\s*>\s*([^\]\n]+?)\]\]/y;

export default {
  id: 'pixiv',
  kind: 'ruby',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: ruby(m[1], m[2]), length: m[0].length } : null;
  },
  render(node) {
    return `[[rb:${node.base} > ${node.ruby}]]`;
  },
};
