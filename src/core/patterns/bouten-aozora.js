import { execSticky } from './_util.js';
import { bouten } from '../ast.js';

/**
 * `bouten_aozora`（青空文庫の傍点・開始/終了型）。NOTATION §3.7。
 *
 * 出力は開始/終了型 `［＃傍点］テキスト［＃傍点終わり］` を採用（前方参照型は誤マッチ危険）。
 * 入力は両型を受理するが、前方参照型は aozora.js の前処理で開始/終了型へ変換済みの前提。
 * このパターンは開始/終了型のみを扱う。
 * 傍点の種類（黒ゴマ/白ゴマ/丸傍点等）は黒ゴマ1種に正規化するため、
 * 入力の `［＃丸傍点］…［＃丸傍点終わり］` 等も受理して bouten へ正規化する。
 */
const RE = /［＃[^］]*?傍点］([\s\S]*?)［＃[^］]*?傍点終わり］/y;

export default {
  id: 'bouten_aozora',
  kind: 'bouten',
  match(input, pos) {
    const m = execSticky(RE, input, pos);
    return m ? { node: bouten(m[1]), length: m[0].length } : null;
  },
  render(node) {
    return `［＃傍点］${node.value}［＃傍点終わり］`;
  },
};
