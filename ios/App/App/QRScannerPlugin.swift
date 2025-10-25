import Foundation
import Capacitor
import AVFoundation
import UIKit

@objc(QRScannerPlugin)
public class QRScannerPlugin: CAPPlugin, AVCaptureMetadataOutputObjectsDelegate {
    private var captureSession: AVCaptureSession?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var scanCallback: CAPPluginCall?
    
    @objc func startScan(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.scanCallback = call
            
            // 检查相机权限
            let status = AVCaptureDevice.authorizationStatus(for: .video)
            
            if status == .authorized {
                self.setupCamera()
            } else if status == .notDetermined {
                AVCaptureDevice.requestAccess(for: .video) { granted in
                    if granted {
                        self.setupCamera()
                    } else {
                        call.reject("Camera permission denied")
                    }
                }
            } else {
                call.reject("Camera permission denied")
            }
        }
    }
    
    @objc func stopScan(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.cleanup()
            call.resolve()
        }
    }
    
    private func setupCamera() {
        guard let captureDevice = AVCaptureDevice.default(for: .video) else {
            scanCallback?.reject("No camera available")
            return
        }
        
        do {
            let input = try AVCaptureDeviceInput(device: captureDevice)
            captureSession = AVCaptureSession()
            captureSession?.addInput(input)
            
            let output = AVCaptureMetadataOutput()
            captureSession?.addOutput(output)
            
            output.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
            output.metadataObjectTypes = [.qr, .ean8, .ean13, .code128]
            
            // 创建预览层
            previewLayer = AVCaptureVideoPreviewLayer(session: captureSession!)
            previewLayer?.frame = bridge?.viewController?.view.bounds ?? .zero
            previewLayer?.videoGravity = .resizeAspectFill
            
            // 添加到视图
            if let previewLayer = previewLayer {
                bridge?.viewController?.view.layer.addSublayer(previewLayer)
            }
            
            // 开始扫描
            DispatchQueue.global(qos: .userInitiated).async {
                self.captureSession?.startRunning()
            }
            
        } catch {
            scanCallback?.reject("Failed to setup camera: \(error.localizedDescription)")
        }
    }
    
    public func metadataOutput(_ output: AVCaptureMetadataOutput, 
                               didOutput metadataObjects: [AVMetadataObject], 
                               from connection: AVCaptureConnection) {
        
        if let metadataObject = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
           let stringValue = metadataObject.stringValue {
            
            // 震动反馈
            AudioServicesPlaySystemSound(SystemSoundID(kSystemSoundID_Vibrate))
            
            // 返回结果
            cleanup()
            scanCallback?.resolve([
                "text": stringValue,
                "format": metadataObject.type.rawValue
            ])
        }
    }
    
    private func cleanup() {
        captureSession?.stopRunning()
        previewLayer?.removeFromSuperlayer()
        captureSession = nil
        previewLayer = nil
    }
}
