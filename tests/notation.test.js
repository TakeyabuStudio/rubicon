import { describe, it, expect } from 'vitest';
import { parse, render, convert } from '../src/core/index.js';
import { getSite } from '../src/sites/index.js';

/** 入力サイトidで parse → 出力サイトidで render し、出力テキストを返すヘルパ */
function conv(text, fromId, toId, opts) {
  const { ast } = parse(text, getSite(fromId), opts);
  return render(ast, getSite(toId)).text;
}

describe('NOTATION §6 テストケース', () => {
  it('T1 なろう → カクヨム（傍点 中黒代用→二重山括弧）', () => {
    // SPEC 例1 / NOTATION §2.1 整合: なろうの傍点は bouten_ruby(中黒)
    const input = '｜私《わたし》は｜本当《・・》嬉しい';
    expect(conv(input, 'narou', 'kakuyomu')).toBe('｜私《わたし》は《《本当》》嬉しい');
  });

  it('T1b なろう → カクヨム（NOTATION §6 T1 リテラル入力。同形出力）', () => {
    const input = '｜私《わたし》は《《本当》》嬉しい';
    expect(conv(input, 'narou', 'kakuyomu')).toBe('｜私《わたし》は《《本当》》嬉しい');
  });

  it('T2 なろう → pixiv', () => {
    const input = '｜私《わたし》は｜本当《・・》嬉しい';
    expect(conv(input, 'narou', 'pixiv')).toBe('[[rb:私 > わたし]]は[[emphasismark:本当>﹅]]嬉しい');
  });

  it('T3 なろう → でんでん', () => {
    expect(conv('｜私《わたし》', 'narou', 'denden')).toBe('{私|わたし}');
  });

  it('T4 カクヨム傍点 → なろう（傍点代用・中黒は親文字数）', () => {
    expect(conv('《《本当》》', 'kakuyomu', 'narou')).toBe('｜本当《・・》');
  });

  it('T5 青空文庫 出力（傍点・開始/終了型）', () => {
    expect(conv('《《本当》》', 'kakuyomu', 'aozora')).toBe('［＃傍点］本当［＃傍点終わり］');
  });

  it('T5b 他サイト → 青空（字下げ・1行）', () => {
    // 行頭に全角空白2個
    expect(conv('　　セリフ', 'narou', 'aozora')).toBe('［＃２字下げ］セリフ');
  });

  it('T5c 他サイト → 青空（字下げ・連続行はブロック化）', () => {
    const input = '　　行1\n　　行2';
    expect(conv(input, 'narou', 'aozora')).toBe(
      '［＃ここから２字下げ］\n行1\n行2\n［＃ここで字下げ終わり］'
    );
  });

  it('T5d 他サイト → 青空（行頭が括弧類なら字下げ注記なし）', () => {
    expect(conv('　　「セリフ」', 'narou', 'aozora')).toBe('「セリフ」');
  });

  it('T6 非対応記法（太字）は削除し警告を集計', () => {
    const { ast, warnings } = parse('**強調**', getSite('narou'));
    expect(render(ast, getSite('narou')).text).toBe('強調');
    expect(warnings).toEqual([{ kind: '太字', count: 1 }]);
  });

  it('T7 字下げ・空行はパススルー', () => {
    const input = '　セリフ\n\n次段落';
    expect(conv(input, 'narou', 'narou')).toBe('　セリフ\n\n次段落');
  });
});

describe('青空文庫 入力（前方参照型・開始/終了型の受理）', () => {
  it('開始/終了型を傍点として受理', () => {
    expect(conv('［＃傍点］本当［＃傍点終わり］', 'aozora', 'kakuyomu')).toBe('《《本当》》');
  });

  it('前方参照型を傍点として受理（直前テキスト一致時）', () => {
    expect(conv('本当［＃「本当」に傍点］', 'aozora', 'kakuyomu')).toBe('《《本当》》');
  });

  it('青空 字下げ注記入力 → 全角空白展開', () => {
    expect(conv('［＃２字下げ］セリフ', 'aozora', 'narou')).toBe('　　セリフ');
  });
});

describe('各独自記法のラウンドトリップ・基本変換', () => {
  it('なろう → pixiv → なろう（ルビ＋傍点 往復）', () => {
    const input = '｜私《わたし》は｜本当《・・》嬉しい';
    const pix = conv(input, 'narou', 'pixiv');
    expect(conv(pix, 'pixiv', 'narou')).toBe(input);
  });

  it('くるっぷ crepu ルビの入出力', () => {
    expect(conv('[RB:私,わたし]', 'crepu', 'narou')).toBe('｜私《わたし》');
    expect(conv('｜私《わたし》', 'narou', 'crepu')).toBe('[RB:私,わたし]');
  });

  it('fujossy ルビ・傍点（半角記号）', () => {
    expect(conv('｜私(わたし)', 'fujossy', 'narou')).toBe('｜私《わたし》');
    expect(conv('｜本当《・・》', 'narou', 'fujossy')).toBe(':本当|');
  });

  it('魔法のiらんど maho ルビ', () => {
    expect(conv('_薔薇@バラ_', 'maho', 'narou')).toBe('｜薔薇《バラ》');
  });

  it('HTML ルビの入出力（rp付き）', () => {
    expect(conv('<ruby>私<rt>わたし</rt></ruby>', 'html', 'narou')).toBe('｜私《わたし》');
    expect(conv('｜私《わたし》', 'narou', 'html')).toBe(
      '<ruby>私<rp>（</rp><rt>わたし</rt><rp>）</rp></ruby>'
    );
  });

  it('HTML 傍点（text-emphasis span）', () => {
    expect(conv('《《本当》》', 'kakuyomu', 'html')).toBe(
      '<span style="text-emphasis: filled sesame; -webkit-text-emphasis: filled sesame;">本当</span>'
    );
  });

  it('略記ルビ（縦棒省略・漢字）を受理', () => {
    expect(conv('私《わたし》', 'narou', 'narou')).toBe('｜私《わたし》');
  });

  it('ツギクルは出力縦棒が半角固定', () => {
    expect(conv('｜私《わたし》', 'narou', 'tugikuru')).toBe('|私《わたし》');
  });

  it('paren 丸括弧ルビは既定無効、オプトインで有効', () => {
    // 既定: 丸括弧はルビ化されずテキストのまま
    expect(conv('私（わたし）', 'narou', 'narou')).toBe('私（わたし）');
    // オプトイン: ルビ化
    expect(conv('私（わたし）', 'narou', 'narou', { enableParen: true })).toBe('｜私《わたし》');
  });

  it('複数出力の一括変換', () => {
    const { results } = convert('｜私《わたし》', getSite('narou'), [getSite('pixiv'), getSite('denden')]);
    expect(results.map((r) => r.text)).toEqual(['[[rb:私 > わたし]]', '{私|わたし}']);
  });
});

describe('傍点非対応サイトへの出力（ルビは維持・傍点のみ削除して警告）', () => {
  // 確定(2026-06): Privatter / くるっぷ / 魔法のiらんど / Markdown は傍点を一次情報で
  // 確認できないため無効化。ルビ・字下げは従来どおり。傍点出力時はサイレントに消さず警告する。
  const boutenInput = '｜本当《・・》'; // なろうの傍点(中黒代用)

  for (const id of ['privatter', 'crepu', 'maho', 'markdown']) {
    it(`${id}: 傍点は対象テキストを残して削除し、警告を返す`, () => {
      const { ast } = parse(boutenInput, getSite('narou'));
      const { text, warnings } = render(ast, getSite(id));
      expect(text).not.toContain('《'); // 傍点マークは消える
      expect(text).toContain('本当'); // 対象テキストは残る
      expect(warnings).toEqual([{ kind: '傍点', count: 1 }]);
    });
  }

  it('ルビは維持される（傍点無効化はルビに影響しない）', () => {
    expect(conv('[RB:私,わたし]', 'crepu', 'crepu')).toBe('[RB:私,わたし]');
    expect(conv('_薔薇@バラ_', 'maho', 'maho')).toBe('_薔薇@バラ_');
    expect(conv('{私|わたし}', 'markdown', 'markdown')).toBe('{私|わたし}');
  });

  it('convert(): 出力側の傍点削除は result.warnings に入り、傍点対応サイトは空', () => {
    const { results } = convert('｜本当《・・》', getSite('narou'), [
      getSite('markdown'),
      getSite('pixiv'),
    ]);
    const md = results.find((r) => r.site.id === 'markdown');
    const px = results.find((r) => r.site.id === 'pixiv');
    expect(md.warnings).toEqual([{ kind: '傍点', count: 1 }]);
    expect(px.warnings).toEqual([]); // pixiv は傍点対応(bouten_pixiv)
  });
});
