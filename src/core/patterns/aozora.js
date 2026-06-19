import { KAKKO_HEAD, intToZen } from './_util.js';

/**
 * 青空文庫(#25)の特殊処理。NOTATION §3.7。
 * 傍点の前方参照型の前処理と、字下げ注記の入出力を担う。
 * ルビは general/abbrev と同形なので専用処理は不要（ruby.render='general'）。
 */

/**
 * 傍点の前方参照型 `本当［＃「本当」に傍点］` を、開始/終了型
 * `［＃傍点］本当［＃傍点終わり］` へ変換する前処理。
 * 注記の直前テキストの末尾が対象文字列に一致する範囲だけを傍点化する（2段階処理）。
 * 一致しない場合は変換せず原文を残す（誤マッチ防止）。
 *
 * @param {string} text 入力テキスト全体
 * @returns {string} 開始/終了型へ正規化したテキスト
 */
export function preprocessAozoraForwardBouten(text) {
  // ［＃「対象」に〔種別〕傍点］ を拾う（種別は白ゴマ/丸 等を許容）
  const re = /［＃「(.+?)」に[^」］]*?傍点］/g;
  let result = '';
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    const target = m[1];
    const before = text.slice(last, m.index);
    if (before.endsWith(target)) {
      const head = before.slice(0, before.length - target.length);
      result += `${head}［＃傍点］${target}［＃傍点終わり］`;
    } else {
      // 直前テキストと一致しない＝前方参照を解決できない。原文のまま残す。
      result += before + m[0];
    }
    last = re.lastIndex;
  }
  result += text.slice(last);
  return result;
}

const BLOCK_START_RE = /^［＃ここから([０-９0-9]+)字下げ］/;
const BLOCK_END_RE = /^［＃ここで字下げ終わり］/;
const LINE_INDENT_RE = /^［＃([０-９0-9]+)字下げ］/;

export const aozoraIndent = {
  blockStartRe: BLOCK_START_RE,
  blockEndRe: BLOCK_END_RE,
  lineIndentRe: LINE_INDENT_RE,
};

/**
 * 青空字下げの出力（他サイト→青空）。NOTATION §3.7。
 * level>0 の連続行は `［＃ここからN字下げ］…［＃ここで字下げ終わり］` でまとめ、
 * 単独行は `［＃N字下げ］…` の1行注記にする。
 * 行頭が括弧類の行は字下げ注記を付けない（公式仕様）。
 *
 * @param {{level:number, body:string}[]} items 行ごとの字下げ量と本文
 * @returns {string} 改行連結済みの青空テキスト
 */
export function renderAozoraIndentedLines(items) {
  const out = [];
  let i = 0;
  while (i < items.length) {
    const it = items[i];
    const indentable = it.level > 0 && !KAKKO_HEAD.test(it.body);
    if (!indentable) {
      out.push(it.body); // level 0 または括弧類始まり → 注記なし
      i += 1;
      continue;
    }
    // 同じ字下げ量が続き、かつ括弧類始まりでない連続行をまとめる
    let j = i + 1;
    while (j < items.length && items[j].level === it.level && !KAKKO_HEAD.test(items[j].body)) {
      j += 1;
    }
    if (j - i >= 2) {
      out.push(`［＃ここから${intToZen(it.level)}字下げ］`);
      for (let k = i; k < j; k += 1) out.push(items[k].body);
      out.push('［＃ここで字下げ終わり］');
      i = j;
    } else {
      out.push(`［＃${intToZen(it.level)}字下げ］${it.body}`);
      i += 1;
    }
  }
  return out.join('\n');
}
