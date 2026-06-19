import { buildActivePatterns, tokenizeInline } from './tokenizer.js';
import { preprocessAozoraForwardBouten, aozoraIndent } from './patterns/aozora.js';
import { zenToInt } from './patterns/_util.js';
import { indent, newline } from './ast.js';
import { collectWarnings } from './unknown.js';

const LEADING_FULLWIDTH_SPACE = /^(　+)/; // 行頭の全角空白(U+3000)連続

/**
 * 入力テキストを指定サイトの記法で解析し、中間ASTへ変換する。
 *
 * 2階層構造:
 *  1. 行レベル: 字下げ(全角空白 / 青空字下げ注記)を indent ノードへ。行間に newline。
 *  2. インラインレベル: ルビ・傍点・非対応記法・テキストを tokenizeInline で走査。
 *
 * @param {string} input 原稿テキスト
 * @param {object} site 入力サイト定義
 * @param {{enableParen?: boolean}} [opts]
 * @returns {{ast: import('./ast.js').AST, warnings: {kind:string,count:number}[]}}
 */
export function parse(input, site, opts = {}) {
  // 改行コードを LF へ正規化
  let text = input.replace(/\r\n|\r/g, '\n');

  // 青空: 傍点の前方参照型を開始/終了型へ前処理
  const isAozora = site.bouten && site.bouten.parse && site.bouten.parse.includes('bouten_aozora');
  if (isAozora) {
    text = preprocessAozoraForwardBouten(text);
  }

  const ctx = { site, options: site.options || {} };
  const patterns = buildActivePatterns(site, opts);
  const lines = text.split('\n');

  /** @type {import('./ast.js').ASTNode[][]} 出力行（各行=ノード配列）。ブロック注記行は出力しない */
  const outLines = [];
  let blockLevel = 0; // 青空 ［＃ここからN字下げ］ の状態

  for (const rawLine of lines) {
    if (site.indent === 'aozora') {
      const start = aozoraIndent.blockStartRe.exec(rawLine);
      if (start) {
        blockLevel = zenToInt(start[1]);
        continue; // マーカー行は出力しない
      }
      if (aozoraIndent.blockEndRe.test(rawLine)) {
        blockLevel = 0;
        continue;
      }
      let level = blockLevel;
      let content = rawLine;
      const lineMark = aozoraIndent.lineIndentRe.exec(rawLine);
      if (lineMark) {
        level = zenToInt(lineMark[1]);
        content = rawLine.slice(lineMark[0].length);
      } else {
        const sp = LEADING_FULLWIDTH_SPACE.exec(rawLine);
        if (sp) {
          level = sp[1].length;
          content = rawLine.slice(sp[1].length);
        }
      }
      const nodes = [];
      if (level > 0) nodes.push(indent(level));
      nodes.push(...tokenizeInline(content, patterns, ctx));
      outLines.push(nodes);
    } else {
      // 汎用: 行頭の全角空白を字下げとして取り込む
      let level = 0;
      let content = rawLine;
      const sp = LEADING_FULLWIDTH_SPACE.exec(rawLine);
      if (sp) {
        level = sp[1].length;
        content = rawLine.slice(sp[1].length);
      }
      const nodes = [];
      if (level > 0) nodes.push(indent(level));
      nodes.push(...tokenizeInline(content, patterns, ctx));
      outLines.push(nodes);
    }
  }

  // 出力行を newline で連結して平坦なASTへ
  /** @type {import('./ast.js').AST} */
  const ast = [];
  outLines.forEach((nodes, idx) => {
    if (idx > 0) ast.push(newline());
    ast.push(...nodes);
  });

  return { ast, warnings: collectWarnings(ast) };
}
