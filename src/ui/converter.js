/**
 * 変換UIの結線。mockup の CSS クラスをそのまま使い、入力チップ/出力チェックボックス/
 * 結果カードを動的生成する。変換は core/ のローカル処理のみ（外部送信ゼロ）。
 */
import { SITES, getSite } from '../sites/index.js';
import { convert } from '../core/index.js';
import { el, clear } from './dom.js';

const MAX_CHARS = 500000; // SPEC §5.4
const DEFAULT_OUTPUT_IDS = ['narou', 'kakuyomu']; // 初期チェック

/** 数値を桁区切りで表示 */
const fmt = (n) => n.toLocaleString('en-US');

/** トースト通知 */
function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = el('div', { class: 'toast', text: msg });
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

export function initConverter() {
  const inputSelector = document.getElementById('input-selector');
  const outputSelector = document.getElementById('output-selector');
  const textarea = document.getElementById('manuscript');
  const counter = document.getElementById('char-counter');
  const convertBtn = document.getElementById('convert-button');
  const alerts = document.getElementById('converter-alerts');
  const results = document.getElementById('results');

  if (!inputSelector || !outputSelector || !textarea || !convertBtn || !results) {
    return; // 変換ページ以外では何もしない
  }

  // 状態
  let inputId = SITES[0].id; // 既定: 先頭(なろう)
  const outputIds = new Set(DEFAULT_OUTPUT_IDS);

  // --- 入力フォーマット（単一選択チップ） ---
  const inputChips = new Map();
  for (const site of SITES) {
    const chip = el('button', {
      class: site.id === inputId ? 'site-chip active' : 'site-chip',
      text: site.name,
      dataset: { siteId: site.id },
      attrs: { type: 'button' },
    });
    chip.addEventListener('click', () => {
      inputId = site.id;
      for (const [id, c] of inputChips) c.classList.toggle('active', id === inputId);
    });
    inputChips.set(site.id, chip);
    inputSelector.appendChild(chip);
  }

  // --- 出力フォーマット（複数選択チェックボックス） ---
  const outputChecks = new Map();
  for (const site of SITES) {
    const check = el('button', {
      class: outputIds.has(site.id) ? 'site-checkbox checked' : 'site-checkbox',
      text: site.name,
      dataset: { siteId: site.id },
      attrs: { type: 'button', role: 'checkbox', 'aria-checked': String(outputIds.has(site.id)) },
    });
    check.addEventListener('click', () => {
      if (outputIds.has(site.id)) outputIds.delete(site.id);
      else outputIds.add(site.id);
      const on = outputIds.has(site.id);
      check.classList.toggle('checked', on);
      check.setAttribute('aria-checked', String(on));
    });
    outputChecks.set(site.id, check);
    outputSelector.appendChild(check);
  }

  // --- 一括操作 ---
  const setAll = (on) => {
    outputIds.clear();
    for (const [id, check] of outputChecks) {
      if (on) outputIds.add(id);
      check.classList.toggle('checked', on);
      check.setAttribute('aria-checked', String(on));
    }
  };
  document.querySelectorAll('[data-action="select-all"]').forEach((b) =>
    b.addEventListener('click', () => setAll(true))
  );
  document.querySelectorAll('[data-action="clear-all"]').forEach((b) =>
    b.addEventListener('click', () => setAll(false))
  );

  // --- 文字数カウンタ ---
  function updateCounter() {
    const len = textarea.value.length;
    if (counter) {
      counter.textContent = `${fmt(len)} / ${fmt(MAX_CHARS)}`;
      counter.classList.remove('warn', 'over');
      if (len > MAX_CHARS) counter.classList.add('over');
      else if (len > MAX_CHARS * 0.9) counter.classList.add('warn');
    }
    textarea.classList.toggle('error', len > MAX_CHARS);
  }
  textarea.addEventListener('input', updateCounter);

  // --- 警告表示 ---
  /**
   * @param {{kind:string,count:number}[]} parseWarnings 入力側（非対応記法の削除）
   * @param {{name:string,count:number}[]} boutenDrops 出力側（傍点非対応サイトでの削除）
   */
  function renderWarnings(parseWarnings, boutenDrops) {
    if (!alerts) return;
    clear(alerts);
    const mkAlert = (title, detail) =>
      el('div', { class: 'alert alert-warning' }, [
        el('span', { class: 'alert-icon', text: '⚠' }),
        el('div', { class: 'alert-body' }, [
          el('strong', { text: title }),
          el('span', { class: 'alert-detail', text: detail }),
        ]),
      ]);

    if (parseWarnings.length) {
      const detail = parseWarnings.map((w) => `${w.kind} (${w.count}箇所)`).join(' / ');
      alerts.appendChild(mkAlert('変換対象外の記法を削除しました', detail));
    }
    if (boutenDrops.length) {
      const detail = boutenDrops.map((d) => `「${d.name}」(${d.count}箇所)`).join(' / ');
      alerts.appendChild(
        mkAlert('傍点が非対応の形式で削除されました', detail)
      );
    }
  }

  // --- 結果カード ---
  function renderResults(items) {
    clear(results);
    for (const { site, text } of items) {
      const body = el('div', { class: 'result-body', text });
      const copyBtn = el('button', { class: 'button button-ghost', text: 'Copy', attrs: { type: 'button' } });
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(body.textContent).then(
          () => showToast('コピーしました'),
          () => showToast('コピーに失敗しました')
        );
      });
      const card = el('div', { class: 'result-card' }, [
        el('div', { class: 'result-header' }, [
          el('div', { class: 'result-format' }, [
            el('span', { class: 'result-format-label', text: 'Format:' }),
            el('span', { class: 'result-format-name', text: site.name }),
          ]),
          copyBtn,
        ]),
        body,
      ]);
      results.appendChild(card);
    }
  }

  // --- 変換実行 ---
  function runConvert() {
    const text = textarea.value;
    if (text.length > MAX_CHARS) {
      showToast('文字数が上限を超えています');
      return;
    }
    if (!text.trim()) {
      showToast('原稿を入力してください');
      return;
    }
    if (outputIds.size === 0) {
      showToast('出力フォーマットを選択してください');
      return;
    }
    convertBtn.classList.add('loading');
    // 同期処理だがスピナーを見せるため次フレームで実行
    requestAnimationFrame(() => {
      try {
        const fromSite = getSite(inputId);
        // SITES の並び順で出力（選択順ではなくサイト一覧順）
        const toSites = SITES.filter((s) => outputIds.has(s.id));
        const { warnings, results: items } = convert(text, fromSite, toSites);
        // 出力側の傍点削除をサイト名つきで集計
        const boutenDrops = items
          .map((it) => {
            const w = it.warnings.find((x) => x.kind === '傍点');
            return w ? { name: it.site.name, count: w.count } : null;
          })
          .filter(Boolean);
        renderWarnings(warnings, boutenDrops);
        renderResults(items);
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } finally {
        convertBtn.classList.remove('loading');
      }
    });
  }
  convertBtn.addEventListener('click', runConvert);
  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runConvert();
    }
  });

  // 初期化: デモ結果カード/警告を消し、カウンタを更新
  if (alerts) clear(alerts);
  clear(results);
  updateCounter();
}
