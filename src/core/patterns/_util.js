/**
 * パターン実装の共通ユーティリティ。
 */

/**
 * sticky(/y) 正規表現を指定位置でだけ照合する。
 * `re` には必ず `y` フラグを付けること。lastIndex を pos に固定して exec する。
 *
 * @param {RegExp} re   sticky フラグ付き正規表現（モジュールスコープで使い回す）
 * @param {string} input 走査対象（通常は1行ぶんの文字列）
 * @param {number} pos  照合開始位置
 * @returns {RegExpExecArray|null} pos で始まるマッチ、なければ null
 */
export function execSticky(re, input, pos) {
  re.lastIndex = pos;
  const m = re.exec(input);
  return m && m.index === pos ? m : null;
}

/**
 * 全角アラビア数字（０-９）を含む文字列を整数へ変換する。青空文庫字下げ注記用。
 * 半角数字も許容する。
 * @param {string} s
 * @returns {number}
 */
export function zenToInt(s) {
  const half = s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  return parseInt(half, 10);
}

/**
 * 整数を全角アラビア数字へ変換する。青空文庫字下げ注記の出力用（例: 10 → "１０"）。
 * @param {number} n
 * @returns {string}
 */
export function intToZen(n) {
  return String(n).replace(/[0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));
}

/**
 * 青空文庫で行頭が括弧類の場合は字下げ注記を付けない（公式仕様 / NOTATION §3.7）。
 * 行頭がこれらの文字なら true。
 */
export const KAKKO_HEAD = /^[「」（）『』【】]/;
