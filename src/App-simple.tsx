import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>🎉 WDK Wallet</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        应用成功启动!鸿蒙系统兼容测试版本
      </p>
      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          点击测试 ({count})
        </button>
      </div>
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h3>系统信息:</h3>
        <p>• User Agent: {navigator.userAgent}</p>
        <p>• 屏幕尺寸: {window.screen.width} x {window.screen.height}</p>
        <p>• React 版本: 18.2.0</p>
      </div>
    </div>
  );
}

export default App;
