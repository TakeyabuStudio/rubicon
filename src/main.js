/**
 * UIエントリポイント。変換UIを初期化する。
 * 外部送信は一切行わない（fetch/XHR/WebSocket/Beacon なし）。
 */
import { initConverter } from './ui/converter.js';

initConverter();
