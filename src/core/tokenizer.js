import { getPattern } from './patterns/index.js';
import { unknownPatterns } from './unknown.js';
import { text } from './ast.js';

/**
 * 入力サイト定義から「インライン走査で試すパターン列」を優先度順に構築する。
 *
 * 優先度: 傍点パターン → ルビパターン → 非対応記法（unknown）。
 * 傍点を先に試すのは、`bouten_ruby`(`｜本当《・・》`) を一般ルビと誤認しないため、
 * また `bouten_double`(`《《…》》`) 等を確実に拾うため（NOTATION §3）。
 *
 * @param {object} site サイト定義
 * @param {{enableParen?: boolean}} [opts] 変換オプション
 * @returns {{id:string, match:Function, isUnknown?:boolean}[]}
 */
export function buildActivePatterns(site, opts = {}) {
  const list = [];

  // 1. 傍点（site.bouten が null のサイトは傍点記法なし）
  if (site.bouten && Array.isArray(site.bouten.parse)) {
    for (const id of site.bouten.parse) list.push(getPattern(id));
  }

  // 2. ルビ
  if (site.ruby && Array.isArray(site.ruby.parse)) {
    for (const id of site.ruby.parse) list.push(getPattern(id));
  }
  // paren（丸括弧ルビ）は既定無効。対応サイトかつ明示オプトイン時のみ末尾に追加。
  if (opts.enableParen && site.options && site.options.parenRubyOptIn) {
    list.push(getPattern('paren'));
  }

  // 3. 非対応記法（最低優先）
  list.push(...unknownPatterns());

  return list;
}

/**
 * 1行ぶんの本文をインライン走査して AST ノード配列を返す（最早マッチ方式）。
 * 現在位置で有効パターンを優先度順に試し、最初にマッチしたものを採用して前進する。
 * どれもマッチしなければ1文字をテキストバッファに溜める。
 *
 * @param {string} content 字下げを除いた行本文
 * @param {{id:string, match:Function}[]} patterns buildActivePatterns の結果
 * @param {object} ctx レンダラ用ではないがパターンmatch互換のため受け渡す
 * @returns {import('./ast.js').ASTNode[]}
 */
export function tokenizeInline(content, patterns, ctx) {
  const nodes = [];
  let buf = '';
  let pos = 0;
  const n = content.length;

  const flush = () => {
    if (buf) {
      nodes.push(text(buf));
      buf = '';
    }
  };

  while (pos < n) {
    let matched = null;
    for (const p of patterns) {
      const r = p.match(content, pos, ctx);
      if (r) {
        matched = r;
        break;
      }
    }
    if (matched && matched.length > 0) {
      flush();
      nodes.push(matched.node);
      pos += matched.length;
    } else {
      buf += content[pos];
      pos += 1;
    }
  }
  flush();
  return nodes;
}
