import { getPattern } from './patterns/index.js';
import { renderAozoraIndentedLines } from './patterns/aozora.js';

const FULLWIDTH_SPACE = '　'; // U+3000

/**
 * インラインノード（text/ruby/bouten/unknown）を出力サイト記法の文字列へ変換する。
 * indent/newline は行レベルで処理するためここでは扱わない。
 *
 * @param {import('./ast.js').ASTNode} node
 * @param {object} site 出力サイト定義
 * @param {object} ctx { options }
 * @returns {string}
 */
function renderInline(node, site, ctx) {
  switch (node.type) {
    case 'text':
      return node.value;
    case 'unknown':
      return node.value; // マークアップ除去後の内側テキストを保持
    case 'ruby': {
      const id = site.ruby && site.ruby.render;
      if (!id) return node.base; // ルビ非対応サイト: 親文字のみ
      return getPattern(id).render(node, ctx);
    }
    case 'bouten': {
      const id = site.bouten && site.bouten.render;
      if (!id) return node.value; // 傍点記法のないサイト: 対象テキストのみ（傍点を落とす）
      return getPattern(id).render(node, ctx);
    }
    case 'indent':
      return FULLWIDTH_SPACE.repeat(node.level); // フォールバック（通常は行レベルで処理）
    default:
      return '';
  }
}

/**
 * AST を行配列（newline 区切り）へ分割する。各行は newline を含まないノード配列。
 * @param {import('./ast.js').AST} ast
 * @returns {import('./ast.js').ASTNode[][]}
 */
function splitLines(ast) {
  const lines = [[]];
  for (const node of ast) {
    if (node.type === 'newline') lines.push([]);
    else lines[lines.length - 1].push(node);
  }
  return lines;
}

/**
 * 中間ASTを指定サイトの記法でレンダリングする。
 *
 * 出力サイトが傍点記法を持たない（site.bouten が null）場合、AST中の傍点は
 * 対象テキストのみを残してマークを落とすが、サイレントにはせず警告として件数を返す
 * （ユーザーが「傍点が消えた」ことに気づけるように）。
 *
 * @param {import('./ast.js').AST} ast
 * @param {object} site 出力サイト定義
 * @returns {{text: string, warnings: {kind:string,count:number}[]}}
 */
export function render(ast, site) {
  const ctx = { site, options: site.options || {} };
  const lines = splitLines(ast);

  // 出力側の警告: 傍点非対応サイトへ傍点を出力した場合の削除件数
  const warnings = [];
  const supportsBouten = !!(site.bouten && site.bouten.render);
  if (!supportsBouten) {
    const dropped = ast.reduce((n, node) => (node.type === 'bouten' ? n + 1 : n), 0);
    if (dropped > 0) warnings.push({ kind: '傍点', count: dropped });
  }

  if (site.indent === 'aozora') {
    // 青空: 字下げ量を行ごとに集計し、連続行のブロック化・括弧類例外を処理
    const items = lines.map((line) => {
      let level = 0;
      const rest = [];
      for (const node of line) {
        if (node.type === 'indent') level = node.level;
        else rest.push(node);
      }
      const body = rest.map((n) => renderInline(n, site, ctx)).join('');
      return { level, body };
    });
    return { text: renderAozoraIndentedLines(items), warnings };
  }

  // 汎用: 字下げは全角空白へ展開し、その他はインライン変換
  const text = lines
    .map((line) =>
      line
        .map((node) =>
          node.type === 'indent'
            ? FULLWIDTH_SPACE.repeat(node.level)
            : renderInline(node, site, ctx)
        )
        .join('')
    )
    .join('\n');
  return { text, warnings };
}
