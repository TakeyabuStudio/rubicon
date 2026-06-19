/**
 * パターンレジストリ。patternId → パターンモジュール のマップを構築する。
 *
 * 設計方針（NOTATION §1）: サイトごとに固有実装を書くのではなく、
 * 収束した少数のパターンを実装し、各サイト定義(sites/definitions/*.json)が
 * patternId でこれらを参照・割り当てる。
 */
import general from './ruby-general.js';
import abbrev from './ruby-abbrev.js';
import abbrevAlnum from './ruby-abbrev-alnum.js';
import paren from './ruby-paren.js';
import pixiv from './ruby-pixiv.js';
import crepu from './ruby-crepu.js';
import fujossy from './ruby-fujossy.js';
import forestpagePlus from './ruby-forestpage-plus.js';
import denden from './ruby-denden.js';
import maho from './ruby-maho.js';
import html from './ruby-html.js';

import boutenRuby from './bouten-ruby.js';
import boutenDouble from './bouten-double.js';
import boutenFujossy from './bouten-fujossy.js';
import boutenPixiv from './bouten-pixiv.js';
import boutenDenden from './bouten-denden.js';
import boutenAozora from './bouten-aozora.js';
import boutenHtml from './bouten-html.js';

const ALL = [
  general, abbrev, abbrevAlnum, paren, pixiv, crepu, fujossy, forestpagePlus, denden, maho, html,
  boutenRuby, boutenDouble, boutenFujossy, boutenPixiv, boutenDenden, boutenAozora, boutenHtml,
];

/** @type {Map<string, {id:string, kind:'ruby'|'bouten', match:Function, render?:Function}>} */
export const PATTERNS = new Map(ALL.map((p) => [p.id, p]));

/**
 * patternId からパターンを取得（未登録は明示エラーで早期検知）。
 * @param {string} id
 */
export function getPattern(id) {
  const p = PATTERNS.get(id);
  if (!p) throw new Error(`未登録のパターンID: ${id}`);
  return p;
}
