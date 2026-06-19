/**
 * 全28サイト定義のロードとアクセサ。
 * 配列順は mockup の入力チップ/出力チェックボックス/対応サイトタイル(01〜28)の順と一致させること。
 * 記法の正は RUBICON_NOTATION.md §2。各JSONはそこからの機械転記。
 */
import narou from './definitions/narou.json';
import kakuyomu from './definitions/kakuyomu.json';
import alphapolis from './definitions/alphapolis.json';
import novelup from './definitions/novelup.json';
import estar from './definitions/estar.json';
import novelism from './definitions/novelism.json';
import hameln from './definitions/hameln.json';
import pixiv from './definitions/pixiv.json';
import noveldays from './definitions/noveldays.json';
import novelpia from './definitions/novelpia.json';
import novelabo from './definitions/novelabo.json';
import solispia from './definitions/solispia.json';
import maho from './definitions/maho.json';
import novema from './definitions/novema.json';
import noichigo from './definitions/noichigo.json';
import berrys from './definitions/berrys.json';
import tugikuru from './definitions/tugikuru.json';
import nola from './definitions/nola.json';
import note from './definitions/note.json';
import fujossy from './definitions/fujossy.json';
import forestpagePlus from './definitions/forestpage_plus.json';
import privatter from './definitions/privatter.json';
import xfolio from './definitions/xfolio.json';
import crepu from './definitions/crepu.json';
import aozora from './definitions/aozora.json';
import denden from './definitions/denden.json';
import html from './definitions/html.json';
import markdown from './definitions/markdown.json';

/** @type {object[]} mockup の表示順(01〜28) */
export const SITES = [
  narou, kakuyomu, alphapolis, novelup, estar, novelism, hameln, pixiv, noveldays, novelpia,
  novelabo, solispia, maho, novema, noichigo, berrys, tugikuru, nola, note, fujossy,
  forestpagePlus, privatter, xfolio, crepu, aozora, denden, html, markdown,
];

/** @type {Map<string, object>} id → サイト定義 */
export const SITE_MAP = new Map(SITES.map((s) => [s.id, s]));

/** @param {string} id @returns {object} */
export function getSite(id) {
  const s = SITE_MAP.get(id);
  if (!s) throw new Error(`未登録のサイトID: ${id}`);
  return s;
}
