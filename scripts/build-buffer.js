// 生成浏览器兼容的 Buffer polyfill
import { Buffer } from 'buffer';
import fs from 'fs';

// 创建 UMD 包装器
const umdWrapper = `
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.buffer = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  
  // 使用已打包的 Buffer
  const Buffer = require('buffer').Buffer;
  
  return {
    Buffer: Buffer
  };
}));
`;

console.log('Building browser-compatible Buffer polyfill...');
console.log('Buffer:', typeof Buffer);
console.log('Buffer.alloc:', typeof Buffer.alloc);

fs.writeFileSync('public/buffer.min.js', umdWrapper);
console.log('✅ Buffer polyfill generated: public/buffer.min.js');
