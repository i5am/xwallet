import React, { useEffect, useState } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Camera } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkSupport();
    return () => {
      stopScan();
    };
  }, []);

  const checkSupport = async () => {
    try {
      const result = await BarcodeScanner.isSupported();
      setIsSupported(result.supported);
      
      if (result.supported) {
        // 请求权限
        const permissions = await BarcodeScanner.checkPermissions();
        if (permissions.camera !== 'granted') {
          const request = await BarcodeScanner.requestPermissions();
          if (request.camera !== 'granted') {
            setError('需要相机权限才能扫描二维码');
            return;
          }
        }
        startScan();
      } else {
        setError('当前设备不支持二维码扫描');
      }
    } catch (err) {
      console.error('Check support error:', err);
      setError('初始化扫描器失败');
    }
  };

  const startScan = async () => {
    try {
      // 隐藏应用内容
      document.querySelector('body')?.classList.add('barcode-scanner-active');
      
      // 开始扫描
      const listener = await BarcodeScanner.addListener('barcodeScanned', (result) => {
        console.log('Barcode scanned:', result);
        if (result.barcode && result.barcode.rawValue) {
          onScan(result.barcode.rawValue);
          stopScan();
        }
      });

      await BarcodeScanner.startScan();
    } catch (err) {
      console.error('Start scan error:', err);
      setError('启动扫描失败');
      stopScan();
    }
  };

  const stopScan = async () => {
    try {
      await BarcodeScanner.stopScan();
      await BarcodeScanner.removeAllListeners();
      document.querySelector('body')?.classList.remove('barcode-scanner-active');
      onClose();
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

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            不支持扫描
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            当前设备不支持二维码扫描功能
          </p>
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
    <div className="fixed inset-0 z-50">
      {/* 扫描指示器 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full flex items-center gap-2">
          <Camera className="w-5 h-5 animate-pulse" />
          <span>请对准二维码</span>
        </div>
      </div>
      
      {/* 取消按钮 */}
      <button
        onClick={stopScan}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 bg-white px-6 py-3 rounded-full font-medium"
      >
        取消扫描
      </button>
    </div>
  );
};
