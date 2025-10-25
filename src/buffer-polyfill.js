import { Buffer } from 'buffer';
import process from 'process';

// 确保全局可用
if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = Buffer;
  globalThis.global = globalThis;
  globalThis.process = process;
  globalThis.process.env = globalThis.process.env || {};
}

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.global = window;
  window.process = process;
  window.process.env = window.process.env || {};
}

export { Buffer };
