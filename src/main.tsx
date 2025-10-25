// Polyfills 必须最先导入
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 必须最先导入 Buffer polyfill
import { Buffer } from 'buffer';

// 确保 Buffer 全局可用
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  if (!(window as any).global) {
    (window as any).global = window;
  }
  if (!(window as any).process) {
    (window as any).process = { 
      env: {},
      version: '16.0.0',
      nextTick: (fn: Function) => setTimeout(fn, 0)
    };
  }
}

// 全局 Buffer 也要设置
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

// 移除调试信息
console.log('🚀 WDK Wallet 启动中...');

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 鸿蒙系统错误捕获
window.addEventListener('error', (e) => {
  console.error('❌ Global error:', e.error);
  console.error('Error stack:', e.error?.stack);
  const errorMsg = e.error?.message || e.message || '未知错误';
  const errorStack = e.error?.stack || '';
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; background: white; font-family: monospace; white-space: pre-wrap;">
      <h2>应用错误</h2>
      <p><strong>错误信息:</strong> ${errorMsg}</p>
      <p><strong>堆栈:</strong></p>
      <pre style="overflow-x: auto;">${errorStack}</pre>
      <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px;">重新加载</button>
    </div>
  `;
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ Unhandled rejection:', e.reason);
  alert('Promise rejection: ' + e.reason);
});

// 确保 DOM 已加载
const initApp = () => {
  console.log('🔧 initApp 开始执行');
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found!');
    alert('错误: 找不到 root 元素');
    document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found</div>';
    return;
  }

  try {
    console.log('Initializing React app...');
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('✅ React app initialized successfully');
    
    // 隐藏加载提示
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
  } catch (error) {
    console.error('Failed to initialize app:', error);
    alert('初始化失败: ' + error);
    root.innerHTML = `<div style="padding: 20px; color: red;">Failed to initialize: ${error}</div>`;
  }
};

console.log('⏳ 等待 DOM 加载...');

// 等待 DOM 完全加载
if (document.readyState === 'loading') {
  console.log('DOM 正在加载，添加事件监听器');
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  console.log('DOM 已加载，立即初始化');
  initApp();
}
