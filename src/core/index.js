/**
 * 変換エンジンの公開API。UI層(src/ui)はここだけを参照する。
 * 入力サイトのパーサ → 中間AST → 出力サイトのレンダラ（SPEC §3.1）。
 */
import { parse } from './parse.js';
import { render } from './render.js';

export { parse } from './parse.js';
export { render } from './render.js';

/**
 * 1入力を複数の出力サイトへ一括変換する。
 *
 * @param {string} input 原稿テキスト
 * @param {object} fromSite 入力サイト定義
 * @param {object[]} toSites 出力サイト定義の配列
 * 返り値の warnings は入力側（非対応記法の削除）。各 result.warnings は出力側
 * （傍点非対応サイトへの傍点削除など）。
 *
 * @param {{enableParen?: boolean}} [opts]
 * @returns {{warnings: {kind:string,count:number}[], results: {site:object, text:string, warnings:{kind:string,count:number}[]}[]}}
 */
export function convert(input, fromSite, toSites, opts = {}) {
  const { ast, warnings } = parse(input, fromSite, opts);
  const results = toSites.map((site) => {
    const { text, warnings: outWarnings } = render(ast, site);
    return { site, text, warnings: outWarnings };
  });
  return { warnings, results };
}
