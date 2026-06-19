import { execSticky } from './_util.js';
import { ruby } from '../ast.js';

/**
 * `denden`（でんでんマークダウン式ルビ）: `{親文字|ルビ}`。中括弧＋半角バー。NOTATION §3.5。
 * #28 Markdown も同一実装（でんでん式を採用）。
 * MVP はグループルビ（バー1本）のみ。複数バーのモノルビは未対応（NOTATION §7-4 / TODO）。
 */
const RE = /\{([^|{}\n]+)\|([^{}\n]+)\}/y;

export default {
  id: 'denden',
  kind: 'ruby',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: ruby(m[1], m[2]), length: m[0].length } : null;
  },
  render(node) {
    return `{${node.base}|${node.ruby}}`;
  },
};
