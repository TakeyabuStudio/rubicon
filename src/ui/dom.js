/**
 * 安全なDOMヘルパ。XSS対策として innerHTML を一切使わず textContent のみを使う
 * （SPEC §5.2: ユーザー入力は全て textContent で扱う / innerHTML 使用禁止）。
 */

/**
 * 要素を生成する。テキストは textContent で設定するため HTML は解釈されない。
 * @param {string} tag タグ名
 * @param {{class?:string, id?:string, text?:string, attrs?:Object, dataset?:Object}} [props]
 * @param {Node[]} [children]
 * @returns {HTMLElement}
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  if (props.class) node.className = props.class;
  if (props.id) node.id = props.id;
  if (props.text != null) node.textContent = props.text;
  if (props.attrs) {
    for (const [k, v] of Object.entries(props.attrs)) node.setAttribute(k, v);
  }
  if (props.dataset) {
    for (const [k, v] of Object.entries(props.dataset)) node.dataset[k] = v;
  }
  for (const child of children) node.appendChild(child);
  return node;
}

/** 子ノードを全削除する。 @param {Node} node */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}
