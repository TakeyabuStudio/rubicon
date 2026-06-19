import { execSticky } from './patterns/_util.js';
import { unknown } from './ast.js';

/**
 * 非対応記法の検出定義。SPEC §2.3 / NOTATION §6 T6。
 * マッチした記法はマークアップを削除し、内側テキストは保持しつつ、削除した旨を警告に集計する。
 *
 * 注意（誤爆リスク）: ここを安易に増やすと正規の本文を巻き込む。
 * MVP では最も一般的なマークダウン太字 `**…**` のみを対象とする。
 * 文字サイズ・文字色など他の非対応記法は、実需と各サイトの実記法を確認のうえ追加すること
 * （推測で広げない）。— TODO
 *
 * @type {{kind: string, re: RegExp}[]}
 */
export const UNKNOWN_DEFS = [
  { kind: '太字', re: /\*\*(.+?)\*\*/y },
];

/**
 * UNKNOWN_DEFS をトークナイザが扱えるパターン形へラップする。
 * 通常パターンより低優先（ruby/bouten の後）で試すこと。
 * @returns {{id:string, isUnknown:true, match:(input:string,pos:number)=>({node:any,length:number}|null)}[]}
 */
export function unknownPatterns() {
  return UNKNOWN_DEFS.map(({ kind, re }) => ({
    id: `unknown:${kind}`,
    isUnknown: true,
    match(input, pos) {
      const m = execSticky(re, input, pos);
      if (!m) return null;
      return { node: unknown(m[0], kind, m[1]), length: m[0].length };
    },
  }));
}

/**
 * AST から削除済み非対応記法を種別ごとに集計し、警告リストを生成する。
 * @param {import('./ast.js').AST} ast
 * @returns {{kind:string, count:number}[]}
 */
export function collectWarnings(ast) {
  const counts = new Map();
  for (const node of ast) {
    if (node.type === 'unknown') {
      counts.set(node.kind, (counts.get(node.kind) || 0) + 1);
    }
  }
  return [...counts.entries()].map(([kind, count]) => ({ kind, count }));
}
