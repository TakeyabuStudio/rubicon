/**
 * 中間AST（抽象構文木）のノード定義とファクトリ関数。
 *
 * 設計の正は RUBICON_NOTATION.md §5。
 * 入力サイトのパーサが各サイト記法をこのASTへ正規化し、
 * 出力サイトのレンダラがこのASTから各サイト記法を生成する。
 * これにより N×N の変換組み合わせ爆発を防ぐ（中間AST方式 / SPEC §3.1）。
 *
 * @typedef {Object} TextNode    テキスト（無変換でパススルー）
 * @property {"text"} type
 * @property {string} value
 *
 * @typedef {Object} RubyNode    ルビ（振り仮名）。general/abbrev/paren/各独自ルビを統一表現。
 * @property {"ruby"} type
 * @property {string} base       親文字
 * @property {string} ruby       ルビ文字
 *
 * @typedef {Object} BoutenNode  傍点（強調点）。全傍点記法を黒ゴマ1種に正規化。
 * @property {"bouten"} type
 * @property {string} value      傍点を打つ対象テキスト
 *
 * @typedef {Object} NewlineNode 改行
 * @property {"newline"} type
 *
 * @typedef {Object} IndentNode  字下げ。全角空白の連続数 or 青空字下げ注記を正規化。
 * @property {"indent"} type
 * @property {number} level      字下げ量（全角空白の個数に相当）
 *
 * @typedef {Object} UnknownNode 非対応記法。マークアップは削除するが内側テキストは保持し、
 *                               削除した旨を警告に集計する（SPEC §2.3 / NOTATION §6 T6）。
 * @property {"unknown"} type
 * @property {string} original   元の記法全体（警告表示・デバッグ用）
 * @property {string} kind       記法種別（例: "太字"）。警告の分類に使う
 * @property {string} value      マークアップ除去後の内側テキスト（出力で保持）
 *
 * @typedef {TextNode|RubyNode|BoutenNode|NewlineNode|IndentNode|UnknownNode} ASTNode
 * @typedef {ASTNode[]} AST
 */

/** @returns {TextNode} */
export const text = (value) => ({ type: 'text', value });

/** @returns {RubyNode} */
export const ruby = (base, ruby) => ({ type: 'ruby', base, ruby });

/** @returns {BoutenNode} */
export const bouten = (value) => ({ type: 'bouten', value });

/** @returns {NewlineNode} */
export const newline = () => ({ type: 'newline' });

/** @returns {IndentNode} */
export const indent = (level) => ({ type: 'indent', level });

/** @returns {UnknownNode} */
export const unknown = (original, kind, value) => ({ type: 'unknown', original, kind, value });
