import React, { useEffect, useState } from 'react';
import { registerPlugin } from '@capacitor/core';
import { Camera } from 'lucide-react';

// 定义原生插件接口
interface QRScannerPlugin {
  startScan(): Promise<{ text: string; format: string }>;
  stopScan(): Promise<void>;
}

// 注册原生插件
const NativeQRScanner = registerPlugin<QRScannerPlugin>('QRScanner');

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScannerComponent: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    startScan();
    return () => {
      stopScan();
    };
  }, []);

  const startScan = async () => {
    try {
      // 调用原生 iOS 扫描
      const result = await NativeQRScanner.startScan();
      if (result && result.text) {
        onScan(result.text);
        onClose();
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || '扫描失败');
    }
  };

  const stopScan = async () => {
    try {
      await NativeQRScanner.stopScan();
    } catch (err) {
      console.error('Stop scan error:', err);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            扫描错误
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full btn-primary"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* 扫描指示器 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full flex items-center gap-2">
          <Camera className="w-5 h-5 animate-pulse" />
          <span>请对准二维码</span>
        </div>
      </div>
      
      {/* 取消按钮 */}
      <button
        onClick={() => { stopScan(); onClose(); }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 bg-white px-6 py-3 rounded-full font-medium"
      >
        取消扫描
      </button>
    </div>
  );
};
