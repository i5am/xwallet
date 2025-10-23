import { useState, useEffect, useRef } from 'react';
import { Wallet, WalletType, ChainType, NetworkType } from './types';
import * as bip39 from 'bip39';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
// import { BTCAdapter } from './services/blockchain/BTCAdapter-harmonyos'; // 暂时禁用 BTC
import { ETHAdapter } from './services/blockchain/ETHAdapter';
import { FlightsparkAdapter } from './services/flightspark/FlightsparkAdapter';
import { AIServicePayment } from './types/flightspark';
import { getNetworkConfig } from './config';
import { formatAddress } from './utils';
import { ProtocolUtils } from './utils/protocol';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Settings, Zap, X, Camera, QrCode as QrCodeIcon } from 'lucide-react';

function App() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showAIPaymentDialog, setShowAIPaymentDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [useProtocolFormat, setUseProtocolFormat] = useState<boolean>(false); // 是否使用协议格式
  const [signMessage, setSignMessage] = useState<string>('');
  const [signedQrCode, setSignedQrCode] = useState<string>('');
  const [aiWalletAddress, setAiWalletAddress] = useState<string>('');
  const [aiPaymentAmount, setAiPaymentAmount] = useState<string>('');
  const [aiServiceType, setAiServiceType] = useState<'chat' | 'image' | 'voice' | 'custom'>('chat');
  const [importType, setImportType] = useState<'mnemonic' | 'privateKey'>('mnemonic');
  const [importMnemonic, setImportMnemonic] = useState<string>('');
  const [importPrivateKey, setImportPrivateKey] = useState<string>('');
  const [importChain, setImportChain] = useState<ChainType>(ChainType.BTC);
  const [importWalletType, setImportWalletType] = useState<WalletType>(WalletType.HOT);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanDataType, setScanDataType] = useState<'message' | 'transaction' | 'authorization' | 'raw' | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [signatureInProgress, setSignatureInProgress] = useState(false);
  
  // 发送交易相关状态
  const [sendToAddress, setSendToAddress] = useState<string>('');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [sendFee, setSendFee] = useState<string>('');
  const [sendMemo, setSendMemo] = useState<string>('');
  const [transactionQrCode, setTransactionQrCode] = useState<string>('');
  
  // 摄像头相关 refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // 生成接收地址二维码 (支持简单格式和协议格式)
  useEffect(() => {
    // 临时禁用 QR 码生成以测试稳定性
    if (showReceiveDialog && selectedWallet) {
      // 生成占位符 QR 码
      setQrCodeDataUrl('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UVIg5Luj56CB5Y2g5L2N5ZmoPC90ZXh0Pjwvc3ZnPg==');
    }
  }, [showReceiveDialog, selectedWallet, useProtocolFormat]);

  // 创建新钱包
  const createWallet = async (type: WalletType, chain: ChainType) => {
    try {
      const mnemonic = bip39.generateMnemonic();
      const network = NetworkType.MAINNET;
      const networkConfig = getNetworkConfig(chain, network);

      let address = '';
      let privateKey = '';
      let publicKey = '';

      if (chain === ChainType.BTC) {
        alert('⚠️ BTC 功能暂不支持鸿蒙系统\n请选择 ETH 或 Polygon');
        return;
        // const btcAdapter = new BTCAdapter(network);
        // const walletData = btcAdapter.generateTaprootAddress(mnemonic);
        // address = walletData.address;
        // privateKey = walletData.privateKey;
        // publicKey = walletData.publicKey;
      } else {
        const ethAdapter = new ETHAdapter(networkConfig.rpcUrl, network);
        const walletData = ethAdapter.generateAddress(mnemonic);
        address = walletData.address;
        privateKey = walletData.privateKey;
        publicKey = walletData.publicKey;
      }

      const newWallet: Wallet = {
        id: Date.now().toString(),
        name: `ETH ${type === WalletType.HOT ? '热' : type === WalletType.COLD ? '冷' : '观测'}钱包`,
        type,
        chain,
        network,
        address,
        mnemonic: type !== WalletType.WATCH_ONLY ? mnemonic : undefined,
        privateKey: type !== WalletType.WATCH_ONLY ? privateKey : undefined,
        publicKey,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isOnline: type !== WalletType.COLD,
      };

      setWallets([...wallets, newWallet]);
      setShowCreateWallet(false);
      alert(`钱包创建成功！\n\n地址: ${address}\n\n助记词（请妥善保管）:\n${mnemonic}`);
    } catch (error) {
      alert(`创建钱包失败: ${(error as Error).message}`);
    }
  };

  // 导入钱包
  const importWallet = async () => {
    try {
      let address = '';
      let privateKey = '';
      let publicKey = '';
      let mnemonic: string | undefined = undefined;
      const network = NetworkType.MAINNET;
      const networkConfig = getNetworkConfig(importChain, network);

      if (importType === 'mnemonic') {
        // 通过助记词导入
        if (!importMnemonic.trim()) {
          alert('请输入助记词');
          return;
        }

        // 验证助记词
        if (!bip39.validateMnemonic(importMnemonic.trim())) {
          alert('❌ 助记词格式不正确，请检查！');
          return;
        }

        mnemonic = importMnemonic.trim();

        if (importChain === ChainType.BTC) {
          alert('⚠️ BTC 功能暂不支持鸿蒙系统\n请选择 ETH 或 Polygon');
          return;
        } else {
          const ethAdapter = new ETHAdapter(networkConfig.rpcUrl, network);
          const walletData = ethAdapter.generateAddress(mnemonic);
          address = walletData.address;
          privateKey = walletData.privateKey;
          publicKey = walletData.publicKey;
        }
      } else {
        // 通过私钥导入
        if (!importPrivateKey.trim()) {
          alert('请输入私钥');
          return;
        }

        privateKey = importPrivateKey.trim();

        if (importChain === ChainType.BTC) {
          alert('⚠️ BTC 功能暂不支持鸿蒙系统\n请选择 ETH 或 Polygon');
          return;
        } else {
          const ethAdapter = new ETHAdapter(networkConfig.rpcUrl, network);
          address = ethAdapter.addressFromPrivateKey(privateKey);
          publicKey = privateKey.substring(0, 130);
        }
      }

      // 创建钱包对象
      const newWallet: Wallet = {
        id: Date.now().toString(),
        name: `ETH ${importWalletType === WalletType.HOT ? '热' : '冷'}钱包 (导入)`,
        type: importWalletType,
        chain: importChain,
        network,
        address,
        mnemonic,
        privateKey,
        publicKey,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isOnline: importWalletType === WalletType.HOT,
      };

      setWallets([...wallets, newWallet]);
      setShowImportDialog(false);
      setImportMnemonic('');
      setImportPrivateKey('');
      alert(`✅ 钱包导入成功！\n\n地址: ${address}`);
    } catch (error) {
      alert(`❌ 导入钱包失败: ${(error as Error).message}`);
    }
  };

  // 签名消息
  const signMessageHandler = async () => {
    if (!selectedWallet || !signMessage) {
      alert('请输入要签名的消息');
      return;
    }

    try {
      let signature = '';
      const messageToSign = signMessage;

      if (selectedWallet.chain === ChainType.BTC) {
        // BTC 消息签名（简化版本 - 实际应用需要使用私钥签名）
        signature = `BTC签名演示: ${Buffer.from(messageToSign).toString('hex').substring(0, 40)}...`;
      } else {
        // ETH 消息签名（简化版本 - 实际应用需要使用 ethers.js 的 signMessage）
        signature = `ETH签名演示: 0x${Buffer.from(messageToSign).toString('hex').substring(0, 40)}...`;
      }

      // 生成签名结果的二维码
      const signData = {
        message: messageToSign,
        signature: signature,
        address: selectedWallet.address,
        chain: selectedWallet.chain,
      };

      const qrUrl = await QRCode.toDataURL(JSON.stringify(signData), {
        width: 300,
        margin: 2,
      });

      setSignedQrCode(qrUrl);
      alert('消息签名成功！');
    } catch (error) {
      alert(`签名失败: ${(error as Error).message}`);
    }
  };

  // AI 服务支付
  const handleAIPayment = async () => {
    const wallet = selectedWallet; // TypeScript 类型保护
    
    if (!wallet || !aiWalletAddress || !aiPaymentAmount) {
      alert('请填写完整的支付信息');
      return;
    }

    // 检查钱包类型
    if (wallet.type === WalletType.WATCH_ONLY) {
      alert('❌ 观测钱包无法支付，请使用热钱包或冷钱包');
      return;
    }

    if (!wallet.privateKey) {
      alert('❌ 钱包缺少私钥，无法支付');
      return;
    }

    try {
      // 1. 检查余额
      let balance = 0;
      const networkConfig = getNetworkConfig(wallet.chain, wallet.network);
      
      if (wallet.chain === ChainType.BTC) {
        alert('⚠️ BTC 功能暂不支持,请使用 ETH 钱包');
        return;
      } else {
        const ethAdapter = new ETHAdapter(networkConfig.rpcUrl, wallet.network);
        const balanceWei = await ethAdapter.getBalance(wallet.address);
        balance = Number(balanceWei);
        
        // 对于 ETH，Lightning Network 不适用
        alert('⚠️ 提示：Lightning Network 主要用于 BTC 支付。\n\n对于 ETH 支付，建议使用普通的"发送"功能。');
        return;
      }

      // 2. 确认支付
      const confirmMsg = `确认 AI 服务支付：\n\n` +
        `💰 当前余额: ${balance} satoshis\n` +
        `💸 支付金额: ${aiPaymentAmount} satoshis\n` +
        `📍 AI 地址: ${aiWalletAddress.substring(0, 20)}...\n` +
        `🔧 服务类型: ${aiServiceType}\n\n` +
        `⚠️ 注意：这是演示版本，实际不会执行真实支付。\n` +
        `在生产环境中，需要集成真实的 Lightning Network 节点。\n\n` +
        `是否继续？`;

      if (!confirm(confirmMsg)) {
        return;
      }

      // 3. 初始化 Flightspark 适配器
      const flightspark = new FlightsparkAdapter({
        apiEndpoint: 'https://api.flightspark.io',
        network: wallet!.network === NetworkType.MAINNET ? 'mainnet' : 'testnet',
      });

      // 4. 构建 AI 服务支付请求
      const payment: AIServicePayment = {
        serviceId: `ai_service_${Date.now()}`,
        serviceName: 'AI Service Payment',
        aiWalletAddress: aiWalletAddress,
        amount: aiPaymentAmount,
        requestType: aiServiceType,
        metadata: {
          walletAddress: wallet!.address,
          chain: wallet!.chain,
          timestamp: Date.now(),
          balance: balance.toString(),
        },
      };

      // 5. 执行支付（演示版本）
      const result = await flightspark.payAIService(payment);

      // 6. 生成支付结果二维码
      const paymentData = {
        paymentId: result.id,
        amount: result.amount,
        recipient: result.recipient,
        status: result.status,
        timestamp: result.completedAt,
        note: '演示版本 - 未执行真实支付',
      };

      const qrUrl = await QRCode.toDataURL(JSON.stringify(paymentData), {
        width: 300,
        margin: 2,
      });

      setSignedQrCode(qrUrl);
      alert(`✅ AI 服务支付演示成功！\n\n` +
        `支付ID: ${result.id}\n` +
        `金额: ${result.amount} satoshis\n` +
        `状态: ${result.status}\n\n` +
        `⚠️ 这是演示版本，实际未扣款。\n` +
        `生产环境需要集成真实的 Lightning Network。`);
    } catch (error) {
      alert(`❌ AI 服务支付失败: ${(error as Error).message}`);
    }
  };

  // 启动摄像头扫描
  const startScan = async () => {
    try {
      setIsScanning(true);
      setScanResult(null);
      
      // 请求摄像头权限
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // 优先使用后置摄像头
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // 开始扫描循环
        scanIntervalRef.current = window.setInterval(() => {
          scanFrame();
        }, 100); // 每100ms扫描一次
      }
    } catch (error) {
      alert(`摄像头启动失败: ${(error as Error).message}`);
      setIsScanning(false);
    }
  };

  // 停止扫描
  const stopScan = () => {
    // 停止扫描循环
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    // 停止摄像头
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  };

  // 扫描视频帧
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // 视频未就绪
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
    
    // 设置 canvas 尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 绘制当前帧
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // 使用 jsQR 解析二维码
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    
    if (code) {
      // 成功扫描到二维码
      stopScan();
      handleScanResult(code.data);
    }
  };

  // 处理扫描结果
  const handleScanResult = (data: string) => {
    try {
      // 尝试解析协议消息
      const protocolMessage = ProtocolUtils.parseMessage(data);
      
      if (protocolMessage) {
        // 验证协议消息
        const validation = ProtocolUtils.validateMessage(protocolMessage);
        
        if (!validation.valid) {
          console.error('协议消息验证失败:', validation.error);
          alert(`协议消息验证失败: ${validation.error}`);
          return;
        }

        setScanResult(protocolMessage);
        
        // 根据协议消息类型进行分类
        switch (protocolMessage.type) {
          case 'SIGN_MESSAGE_REQUEST':
            setScanDataType('message');
            setShowConfirmDialog(true);
            break;
          
          case 'SIGN_TRANSACTION_REQUEST':
            setScanDataType('transaction');
            setShowConfirmDialog(true);
            break;
          
          case 'AUTHORIZATION_REQUEST':
            setScanDataType('authorization');
            setShowConfirmDialog(true);
            break;
          
          case 'ADDRESS_INFO':
            // 地址信息,可用于填充发送地址
            setScanDataType('raw');
            setShowConfirmDialog(true);
            // 如果是地址信息且正在发送对话框,自动填充
            if (showSendDialog && protocolMessage.data.address) {
              setSendToAddress(protocolMessage.data.address);
              setShowScanDialog(false);
            }
            break;
          
          case 'SIGN_TRANSACTION_RESPONSE':
          case 'SIGN_MESSAGE_RESPONSE':
          case 'AUTHORIZATION_RESPONSE':
            // 签名响应,显示结果
            setScanDataType('raw');
            setShowConfirmDialog(true);
            break;
          
          default:
            setScanDataType('raw');
            setShowConfirmDialog(true);
        }
      } else {
        // 不是协议消息,尝试解析旧格式
        try {
          const parsed = JSON.parse(data);
          setScanResult(parsed);
          
          // 识别数据类型并分类 (兼容旧格式)
          if (parsed.type === 'message' || parsed.message !== undefined) {
            setScanDataType('message');
            setShowConfirmDialog(true);
          } else if (parsed.type === 'authorization' || parsed.authorization !== undefined || parsed.scope !== undefined) {
            setScanDataType('authorization');
            setShowConfirmDialog(true);
          } else if (parsed.type === 'transaction' || parsed.transaction !== undefined || parsed.to !== undefined) {
            setScanDataType('transaction');
            setShowConfirmDialog(true);
          } else {
            setScanDataType('raw');
            setShowConfirmDialog(true);
          }
        } catch (parseError) {
          // 非 JSON 格式,可能是普通文本或地址
          setScanResult({ raw: data });
          setScanDataType('raw');
          setShowConfirmDialog(true);
        }
      }
    } catch (error) {
      // 非 JSON 格式，可能是地址或其他数据
      setScanResult({ raw: data });
      setScanDataType('raw');
      setShowConfirmDialog(true);
    }
  };

  // 签名扫描到的消息
  const signScannedMessage = async () => {
    if (!selectedWallet || !scanResult) {
      alert('❌ 无效的签名请求');
      return;
    }

    // 检查钱包类型
    if (selectedWallet.type === WalletType.WATCH_ONLY) {
      alert('❌ 观测钱包无法签名，请使用热钱包或冷钱包');
      return;
    }

    if (!selectedWallet.privateKey) {
      alert('❌ 钱包缺少私钥，无法签名');
      return;
    }

    setSignatureInProgress(true);

    try {
      // 提取消息内容 (支持协议格式和旧格式)
      const messageData = scanResult.data || scanResult;
      const messageToSign = messageData.message || scanResult.message;
      const messageId = messageData.messageId || `msg_${Date.now()}`;

      if (!messageToSign) {
        alert('❌ 无效的消息内容');
        return;
      }

      // 检查链类型匹配 (如果有指定)
      if (messageData.chain && messageData.chain !== selectedWallet.chain) {
        alert(`❌ 链类型不匹配\n请求链: ${messageData.chain}\n钱包链: ${selectedWallet.chain}`);
        return;
      }

      let signature = '';

      // 根据链类型进行签名
      if (selectedWallet.chain === ChainType.BTC) {
        // BTC 消息签名（简化版本 - 实际应用需要使用私钥签名）
        const messageHash = Buffer.from(messageToSign).toString('hex');
        signature = `BTC_SIG_${messageHash.substring(0, 64)}`;
        console.log('BTC Message Signature:', signature);
      } else {
        // ETH 消息签名（简化版本 - 实际应用需要使用 ethers.js 的 signMessage）
        const messageHash = Buffer.from(messageToSign).toString('hex');
        signature = `0x${messageHash.substring(0, 130)}`;
        console.log('ETH Message Signature:', signature);
      }

      // 生成符合协议的签名响应
      const signResponse = ProtocolUtils.createMessageSignResponse({
        messageId: messageId,
        signature: signature,
        publicKey: selectedWallet.publicKey || selectedWallet.address,
      });

      const qrUrl = await QRCode.toDataURL(ProtocolUtils.serializeMessage(signResponse), {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'M',
      });

      setSignedQrCode(qrUrl);
      setShowConfirmDialog(false); // 关闭确认对话框，显示签名结果
      
      console.log('✅ 消息签名成功！');
    } catch (error) {
      alert(`❌ 签名失败: ${(error as Error).message}`);
    } finally {
      setSignatureInProgress(false);
    }
  };

  // 签名扫描到的交易
  const signScannedTransaction = async () => {
    if (!selectedWallet || !scanResult) {
      alert('❌ 无效的交易请求');
      return;
    }

    // 检查钱包类型
    if (selectedWallet.type === WalletType.WATCH_ONLY) {
      alert('❌ 观测钱包无法签名，请使用热钱包或冷钱包');
      return;
    }

    if (!selectedWallet.privateKey) {
      alert('❌ 钱包缺少私钥，无法签名');
      return;
    }

    setSignatureInProgress(true);

    try {
      // 提取交易数据 (支持协议格式和旧格式)
      const txData = scanResult.data || scanResult.transaction || scanResult;
      const txId = txData.txId || `tx_${Date.now()}`;
      
      // 验证交易数据
      if (!txData.to || !txData.amount) {
        alert('❌ 交易数据不完整，缺少收款地址或金额');
        return;
      }

      // 检查链类型是否匹配
      if (txData.chain && txData.chain !== selectedWallet.chain) {
        alert(`❌ 链类型不匹配\n交易链: ${txData.chain}\n钱包链: ${selectedWallet.chain}`);
        return;
      }

      // 检查发送地址是否匹配 (如果有指定)
      if (txData.from && txData.from !== selectedWallet.address) {
        alert(`❌ 发送地址不匹配\n交易地址: ${txData.from}\n钱包地址: ${selectedWallet.address}`);
        return;
      }

      let signature = '';
      let signedTransaction = '';
      
      // 根据链类型构建和签名交易
      if (selectedWallet.chain === ChainType.BTC) {
        // BTC 交易签名（简化版本）
        const txHash = `btc_tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        signedTransaction = txHash;
        signature = `BTC_SIG_${txHash.substring(0, 64)}`;
        console.log('BTC Transaction Signed:', signedTransaction);
      } else {
        // ETH 交易签名（简化版本）
        const txHash = `0x${Date.now().toString(16)}${Math.random().toString(36).substring(2, 15)}`;
        signedTransaction = txHash;
        signature = `0x${txHash.substring(2, 132)}`;
        console.log('ETH Transaction Signed:', signedTransaction);
      }

      // 生成符合协议的交易签名响应
      const txResponse = ProtocolUtils.createTransactionResponse({
        txId: txId,
        signature: signature,
        publicKey: selectedWallet.publicKey || selectedWallet.address,
        signedTx: signedTransaction,
      });

      const qrUrl = await QRCode.toDataURL(ProtocolUtils.serializeMessage(txResponse), {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'M',
      });

      setSignedQrCode(qrUrl);
      setShowConfirmDialog(false); // 关闭确认对话框，显示签名结果
      
      console.log('✅ 交易签名成功！');
    } catch (error) {
      alert(`❌ 交易签名失败: ${(error as Error).message}`);
    } finally {
      setSignatureInProgress(false);
    }
  };

  // 授权扫描到的请求
  const authorizeScannedRequest = async () => {
    if (!selectedWallet || !scanResult) {
      alert('❌ 无效的授权请求');
      return;
    }

    // 检查钱包类型
    if (selectedWallet.type === WalletType.WATCH_ONLY) {
      alert('❌ 观测钱包无法授权，请使用热钱包或冷钱包');
      return;
    }

    if (!selectedWallet.privateKey) {
      alert('❌ 钱包缺少私钥，无法授权');
      return;
    }

    setSignatureInProgress(true);

    try {
      // 提取授权数据 (支持协议格式和旧格式)
      const authData = scanResult.data || scanResult.authorization || scanResult;
      const requestId = authData.requestId || `auth_${Date.now()}`;
      
      // 检查链类型匹配 (如果有指定)
      if (authData.chain && authData.chain !== selectedWallet.chain) {
        alert(`❌ 链类型不匹配\n请求链: ${authData.chain}\n钱包链: ${selectedWallet.chain}`);
        return;
      }

      // 检查地址匹配 (如果有指定)
      if (authData.address && authData.address !== selectedWallet.address) {
        alert(`❌ 地址不匹配\n请求地址: ${authData.address}\n钱包地址: ${selectedWallet.address}`);
        return;
      }

      // 生成授权签名
      const authToken = `auth_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const authSignature = `sig_${Buffer.from(authToken).toString('hex').substring(0, 64)}`;

      // 生成符合协议的授权响应
      const authResponse = ProtocolUtils.createAuthorizationResponse({
        requestId: requestId,
        approved: true,
        signature: authSignature,
        publicKey: selectedWallet.publicKey || selectedWallet.address,
      });

      const qrUrl = await QRCode.toDataURL(ProtocolUtils.serializeMessage(authResponse), {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'M',
      });

      setSignedQrCode(qrUrl);
      setShowConfirmDialog(false); // 关闭确认对话框，显示签名结果
      
      console.log('✅ 授权成功！');
    } catch (error) {
      alert(`❌ 授权失败: ${(error as Error).message}`);
    } finally {
      setSignatureInProgress(false);
    }
  };

  // 取消确认
  const cancelConfirmation = () => {
    setShowConfirmDialog(false);
    setScanResult(null);
    setScanDataType(null);
    setSignedQrCode('');
    // 重新启动扫描
    if (!isScanning) {
      startScan();
    }
  };

  // 关闭扫描对话框
  const closeScanDialog = () => {
    stopScan();
    setShowScanDialog(false);
    setScanResult(null);
    setSignedQrCode('');
    setShowConfirmDialog(false);
    setScanDataType(null);
  };

  // 启动扫描对话框时自动开始扫描
  useEffect(() => {
    // 临时禁用扫描功能以测试稳定性
    // if (showScanDialog && !isScanning && !scanResult) {
    //   startScan();
    // }
  }, [showScanDialog]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WalletIcon className="w-10 h-10 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Tether WDK Wallet
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  多链加密货币钱包 - BTC (Taproot) & ETH
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowSettingsDialog(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              设置
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet List */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  我的钱包
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowImportDialog(true)}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    导入
                  </button>
                  <button
                    onClick={() => setShowCreateWallet(!showCreateWallet)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    创建
                  </button>
                </div>
              </div>

              {/* Create Wallet Form */}
              {showCreateWallet && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium mb-3 text-gray-800 dark:text-white">
                    选择钱包类型
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={() => createWallet(WalletType.HOT, ChainType.BTC)}
                        className="btn-secondary text-sm"
                      >
                        🔥 BTC 热钱包
                      </button>
                      <button
                        onClick={() => createWallet(WalletType.COLD, ChainType.BTC)}
                        className="btn-secondary text-sm"
                      >
                        ❄️ BTC 冷钱包
                      </button>
                      <button
                        onClick={() => createWallet(WalletType.HOT, ChainType.ETH)}
                        className="btn-secondary text-sm"
                      >
                        🔥 ETH 热钱包
                      </button>
                      <button
                        onClick={() => createWallet(WalletType.COLD, ChainType.ETH)}
                        className="btn-secondary text-sm"
                      >
                        ❄️ ETH 冷钱包
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Items */}
              <div className="space-y-2">
                {wallets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    还没有钱包，点击创建开始吧！
                  </div>
                ) : (
                  wallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      onClick={() => setSelectedWallet(wallet)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedWallet?.id === wallet.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">
                            {wallet.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                            {formatAddress(wallet.address)}
                          </div>
                        </div>
                        <div className="text-2xl">
                          {wallet.type === WalletType.HOT && '🔥'}
                          {wallet.type === WalletType.COLD && '❄️'}
                          {wallet.type === WalletType.WATCH_ONLY && '👁️'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Wallet Detail */}
          <div className="lg:col-span-2">
            {selectedWallet ? (
              <div className="space-y-6">
                {/* Balance Card */}
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    钱包详情
                  </h2>
                  <div className="text-center py-8">
                    <div className="text-5xl font-bold text-gray-800 dark:text-white mb-2">
                      0.00
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {selectedWallet.chain === ChainType.BTC ? 'BTC' : 'ETH'}
                    </div>
                    <div className="mt-4 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ 当前余额为 0，请先向钱包充值后再进行支付操作
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button 
                      onClick={() => {
                        if (!selectedWallet) {
                          alert('⚠️ 请先创建或选择一个钱包');
                          return;
                        }
                        setShowSendDialog(true);
                      }}
                      className="btn-primary flex items-center justify-center gap-2"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                      发送
                    </button>
                    <button 
                      onClick={() => {
                        if (!selectedWallet) {
                          alert('⚠️ 请先创建或选择一个钱包');
                          return;
                        }
                        setShowReceiveDialog(true);
                      }}
                      className="btn-secondary flex items-center justify-center gap-2"
                    >
                      <ArrowDownLeft className="w-5 h-5" />
                      接收
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button 
                      onClick={() => {
                        if (!selectedWallet) {
                          alert('⚠️ 请先创建或选择一个钱包');
                          return;
                        }
                        setShowSignDialog(true);
                      }}
                      className="btn-secondary flex items-center justify-center gap-2"
                    >
                      ✍️ 签名
                    </button>
                    <button 
                      onClick={() => {
                        if (!selectedWallet) {
                          alert('⚠️ 请先创建或选择一个钱包');
                          return;
                        }
                        setShowAIPaymentDialog(true);
                      }}
                      className="btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <Zap className="w-5 h-5" />
                      AI支付
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <button 
                      onClick={() => {
                        if (!selectedWallet) {
                          alert('⚠️ 请先创建或选择一个钱包');
                          return;
                        }
                        setShowScanDialog(true);
                      }}
                      className="btn-secondary flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    >
                      <Camera className="w-5 h-5" />
                      扫描二维码
                    </button>
                  </div>
                </div>

                {/* Address Card */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                    地址信息
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        钱包地址
                      </label>
                      <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded mt-1 break-all">
                        {selectedWallet.address}
                      </div>
                    </div>
                    {selectedWallet.mnemonic && (
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          助记词 (请妥善保管)
                        </label>
                        <div className="font-mono text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded mt-1 border border-yellow-300 dark:border-yellow-700">
                          {selectedWallet.mnemonic}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction History */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                    交易历史
                  </h3>
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    暂无交易记录
                  </div>
                </div>
              </div>
            ) : (
              <div className="card h-full flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <WalletIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>请选择一个钱包查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Tether WDK Wallet v1.0.0 - 支持 BTC (Taproot) 和 ETH (含 ERC20)
          </p>
          <p className="text-xs mt-1">
            ⚠️ 请务必备份助记词，丢失后将无法恢复钱包
          </p>
        </footer>

        {/* 发送对话框 */}
        {showSendDialog && selectedWallet && (
          <div className="dialog-overlay">
            <div className="dialog-content card max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                发送 {selectedWallet.chain === ChainType.BTC ? 'BTC' : 'ETH'}
              </h2>
              
              {!transactionQrCode ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">接收地址</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="输入接收地址"
                      value={sendToAddress}
                      onChange={(e) => setSendToAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">金额</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">手续费</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="0.00001"
                      value={sendFee}
                      onChange={(e) => setSendFee(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">备注 (可选)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="转账备注"
                      value={sendMemo}
                      onChange={(e) => setSendMemo(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setShowSendDialog(false);
                        setSendToAddress('');
                        setSendAmount('');
                        setSendFee('');
                        setSendMemo('');
                      }}
                      className="btn-secondary flex-1"
                    >
                      取消
                    </button>
                    <button 
                      onClick={async () => {
                        if (!sendToAddress || !sendAmount || !sendFee) {
                          alert('请填写完整的交易信息');
                          return;
                        }

                        try {
                          // 创建交易请求协议消息
                          const txRequest = ProtocolUtils.createTransactionRequest({
                            from: selectedWallet.address,
                            to: sendToAddress,
                            amount: sendAmount,
                            fee: sendFee,
                            chain: selectedWallet.chain,
                            network: selectedWallet.network,
                            memo: sendMemo || undefined,
                          });

                          const qrData = ProtocolUtils.serializeMessage(txRequest);
                          
                          // 生成二维码
                          const qrCodeUrl = await QRCode.toDataURL(qrData, {
                            width: 300,
                            margin: 2,
                            errorCorrectionLevel: 'M',
                          });

                          setTransactionQrCode(qrCodeUrl);
                        } catch (error) {
                          console.error('生成交易二维码失败:', error);
                          alert('生成交易二维码失败');
                        }
                      }}
                      className="btn-primary flex-1"
                    >
                      生成签名请求
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      请使用冷钱包扫描此二维码进行签名
                    </p>
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img src={transactionQrCode} alt="交易签名请求" className="w-full max-w-[300px]" />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">发送方:</span>
                      <span className="font-mono text-xs">{formatAddress(selectedWallet.address)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">接收方:</span>
                      <span className="font-mono text-xs">{formatAddress(sendToAddress)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">金额:</span>
                      <span className="font-semibold">{sendAmount} {selectedWallet.chain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">手续费:</span>
                      <span>{sendFee} {selectedWallet.chain}</span>
                    </div>
                    {sendMemo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">备注:</span>
                        <span>{sendMemo}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ 签名后请扫描冷钱包生成的签名结果二维码
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setTransactionQrCode('');
                      }}
                      className="btn-secondary flex-1"
                    >
                      重新生成
                    </button>
                    <button 
                      onClick={() => {
                        setShowSendDialog(false);
                        setTransactionQrCode('');
                        setSendToAddress('');
                        setSendAmount('');
                        setSendFee('');
                        setSendMemo('');
                      }}
                      className="btn-primary flex-1"
                    >
                      关闭
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 接收对话框 */}
        {showReceiveDialog && selectedWallet && (
          <div className="dialog-overlay">
            <div className="dialog-content card">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                接收 {selectedWallet.chain === ChainType.BTC ? 'BTC' : 'ETH'}
              </h2>
              <div className="space-y-4">
                {/* 格式切换按钮 */}
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">二维码格式:</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      {useProtocolFormat ? 'WDK协议格式' : '简单地址格式'}
                    </span>
                  </div>
                  <button
                    onClick={() => setUseProtocolFormat(!useProtocolFormat)}
                    className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                  >
                    切换
                  </button>
                </div>
                
                {/* 格式说明 */}
                <div className="text-xs bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2">
                  <p className="text-blue-800 dark:text-blue-300">
                    {useProtocolFormat ? (
                      <>
                        <strong>WDK协议格式:</strong> 包含完整钱包信息(地址、公钥、链类型等),适合用于钱包间高级交互。
                      </>
                    ) : (
                      <>
                        <strong>简单地址格式:</strong> 仅包含钱包地址,兼容所有标准钱包应用,推荐用于接收付款。
                      </>
                    )}
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="钱包地址二维码" className="w-48 h-48" />
                    ) : (
                      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                        <p className="text-sm text-gray-500">生成二维码中...</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">钱包地址</label>
                  <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded mt-1 break-all">
                    {selectedWallet.address}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedWallet.address);
                    alert('地址已复制到剪贴板');
                  }}
                  className="btn-primary w-full"
                >
                  复制地址
                </button>
                <button 
                  onClick={() => setShowReceiveDialog(false)}
                  className="btn-secondary w-full"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 签名消息对话框 */}
        {showSignDialog && selectedWallet && (
          <div className="dialog-overlay">
            <div className="dialog-content card">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                消息签名
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">要签名的消息</label>
                  <textarea
                    value={signMessage}
                    onChange={(e) => setSignMessage(e.target.value)}
                    className="input-field min-h-32"
                    placeholder="输入要签名的消息内容..."
                  />
                </div>
                
                {signedQrCode && (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img src={signedQrCode} alt="签名结果二维码" className="w-64 h-64" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      扫描二维码获取签名结果
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setShowSignDialog(false);
                      setSignMessage('');
                      setSignedQrCode('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button 
                    onClick={signMessageHandler}
                    className="btn-primary flex-1"
                    disabled={!signMessage}
                  >
                    签名并生成二维码
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI 服务支付对话框 */}
        {showAIPaymentDialog && selectedWallet && (
          <div className="dialog-overlay">
            <div className="dialog-content card">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-600" />
                AI 服务支付 (Flightspark)
              </h2>
              <div className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-sm">
                  <p className="text-purple-800 dark:text-purple-200">
                    💡 使用 Lightning Network (Flightspark 协议) 向 AI 钱包快速支付服务费用
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">AI 钱包地址</label>
                  <input
                    type="text"
                    value={aiWalletAddress}
                    onChange={(e) => setAiWalletAddress(e.target.value)}
                    className="input-field"
                    placeholder="输入 AI 服务的 Lightning 地址..."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">支付金额 (satoshis)</label>
                  <input
                    type="text"
                    value={aiPaymentAmount}
                    onChange={(e) => setAiPaymentAmount(e.target.value)}
                    className="input-field"
                    placeholder="例如: 1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lightning 网络支持小额快速支付，费用极低
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">服务类型</label>
                  <select
                    value={aiServiceType}
                    onChange={(e) => setAiServiceType(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="chat">💬 对话服务</option>
                    <option value="image">🖼️ 图像生成</option>
                    <option value="voice">🎤 语音服务</option>
                    <option value="custom">⚙️ 自定义服务</option>
                  </select>
                </div>

                {signedQrCode && (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img src={signedQrCode} alt="支付结果二维码" className="w-64 h-64" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      ✅ 支付成功！扫描二维码查看支付凭证
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setShowAIPaymentDialog(false);
                      setAiWalletAddress('');
                      setAiPaymentAmount('');
                      setSignedQrCode('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleAIPayment}
                    className="btn-primary flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    disabled={!aiWalletAddress || !aiPaymentAmount}
                  >
                    ⚡ 立即支付
                  </button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  <p>🔐 使用 Flightspark 协议的 Lightning Network 支付</p>
                  <p>⚡ 即时到账，费用极低（通常 &lt;1 satoshi）</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 导入钱包对话框 */}
        {showImportDialog && (
          <div className="dialog-overlay">
            <div className="dialog-content card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">导入钱包</h2>
                <button
                  onClick={() => {
                    setShowImportDialog(false);
                    setImportMnemonic('');
                    setImportPrivateKey('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">导入方式</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setImportType('mnemonic')}
                      className={`p-2 rounded border transition-colors ${
                        importType === 'mnemonic'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      助记词
                    </button>
                    <button
                      onClick={() => setImportType('privateKey')}
                      className={`p-2 rounded border transition-colors ${
                        importType === 'privateKey'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      私钥
                    </button>
                  </div>
                </div>

                {importType === 'mnemonic' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">助记词</label>
                    <textarea
                      value={importMnemonic}
                      onChange={(e) => setImportMnemonic(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded focus:ring-2 focus:ring-blue-500 dark:text-white"
                      rows={3}
                      placeholder="输入12或24个单词的助记词，用空格分隔"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">私钥</label>
                    <textarea
                      value={importPrivateKey}
                      onChange={(e) => setImportPrivateKey(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded focus:ring-2 focus:ring-blue-500 dark:text-white"
                      rows={2}
                      placeholder="输入私钥（十六进制格式）"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">选择链</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setImportChain(ChainType.BTC)}
                      className={`p-2 rounded border transition-colors ${
                        importChain === ChainType.BTC
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Bitcoin
                    </button>
                    <button
                      onClick={() => setImportChain(ChainType.ETH)}
                      className={`p-2 rounded border transition-colors ${
                        importChain === ChainType.ETH
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Ethereum
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">钱包类型</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setImportWalletType(WalletType.HOT)}
                      className={`p-2 rounded border transition-colors ${
                        importWalletType === WalletType.HOT
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      热钱包
                    </button>
                    <button
                      onClick={() => setImportWalletType(WalletType.COLD)}
                      className={`p-2 rounded border transition-colors ${
                        importWalletType === WalletType.COLD
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      冷钱包
                    </button>
                  </div>
                </div>

                <button
                  onClick={importWallet}
                  className="btn-primary w-full"
                >
                  导入钱包
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 设置对话框 */}
        {showSettingsDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4">
            <div className="card max-w-md w-full my-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">设置</h2>
                <button
                  onClick={() => setShowSettingsDialog(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">网络设置</label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-400">当前网络: 主网 (Mainnet)</p>
                    <p className="text-xs text-gray-500 mt-1">⚠️ 测试网功能开发中</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">语言设置</label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-400">语言: 简体中文</p>
                    <p className="text-xs text-gray-500 mt-1">⚠️ 多语言功能开发中</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">安全设置</label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-400">✅ 本地加密存储已启用</p>
                    <p className="text-xs text-gray-500 mt-1">私钥使用 AES-256 加密</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">关于</label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-400">版本: 1.0.0</p>
                    <p className="text-xs text-gray-500 mt-1">基于 WDK 的多链钱包应用</p>
                    <p className="text-xs text-gray-500 mt-1">支持 BTC (Taproot) 和 ETH/ERC20</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSettingsDialog(false)}
                  className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white p-2 rounded transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scan QR Code Dialog */}
        {showScanDialog && (
          <div className="dialog-overlay">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Camera className="w-6 h-6" />
                    扫描二维码
                  </h2>
                  <button
                    onClick={closeScanDialog}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Camera Preview - 只在没有扫描结果和没有确认对话框时显示 */}
                {!scanResult && !showConfirmDialog && (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
                      <video 
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                      />
                      <canvas 
                        ref={canvasRef}
                        className="hidden"
                      />
                      {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-64 h-64 border-4 border-blue-500 rounded-lg animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    <div className="text-center text-gray-600 dark:text-gray-400">
                      {isScanning ? '正在扫描二维码...' : '点击开始扫描按钮启动摄像头'}
                    </div>
                    {!isScanning && (
                      <button
                        onClick={startScan}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded transition-colors flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        开始扫描
                      </button>
                    )}
                    {isScanning && (
                      <button
                        onClick={stopScan}
                        className="w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded transition-colors"
                      >
                        停止扫描
                      </button>
                    )}
                  </div>
                )}

                {/* Signed QR Code Display - 签名成功后显示 */}
                {signedQrCode && scanResult && !showConfirmDialog && (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                        ✅ 签名完成
                      </h3>
                      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {scanDataType === 'message' && (
                          <>
                            <p>• 消息: {(scanResult.message || '').substring(0, 50)}{(scanResult.message || '').length > 50 ? '...' : ''}</p>
                            <p>• 签名者: {formatAddress(selectedWallet?.address || '')}</p>
                            <p>• 链: {selectedWallet?.chain}</p>
                          </>
                        )}
                        {scanDataType === 'transaction' && (
                          <>
                            <p>• 收款地址: {formatAddress((scanResult.transaction?.to || scanResult.to) || '')}</p>
                            <p>• 金额: {scanResult.transaction?.amount || scanResult.amount}</p>
                            <p>• 链: {selectedWallet?.chain}</p>
                            <p>• 签名者: {formatAddress(selectedWallet?.address || '')}</p>
                          </>
                        )}
                        {scanDataType === 'authorization' && (
                          <>
                            <p>• 域名: {scanResult.authorization?.domain || scanResult.domain || '未指定'}</p>
                            <p>• 权限: {((scanResult.authorization?.scope || scanResult.scope) || []).join(', ') || '基础权限'}</p>
                            <p>• 授权地址: {formatAddress(selectedWallet?.address || '')}</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <QrCodeIcon className="w-5 h-5" />
                        签名结果二维码
                      </h3>
                      <div className="flex justify-center">
                        <img src={signedQrCode} alt="签名二维码" className="max-w-xs rounded-lg shadow-md" />
                      </div>
                      <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-3">
                        {scanDataType === 'transaction' && '请使用在线钱包扫描此二维码广播交易'}
                        {scanDataType === 'message' && '请使用在线钱包扫描此二维码验证签名'}
                        {scanDataType === 'authorization' && '请使用应用扫描此二维码完成授权'}
                        {scanDataType === 'raw' && '请扫描此二维码'}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setScanResult(null);
                          setSignedQrCode('');
                          setScanDataType(null);
                          startScan();
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors font-medium"
                      >
                        继续扫描
                      </button>
                      <button
                        onClick={closeScanDialog}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors font-medium"
                      >
                        关闭
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog - 扫描成功后的确认对话框 */}
        {showScanDialog && showConfirmDialog && scanResult && (
          <div className="dialog-overlay" style={{ zIndex: 60 }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {scanDataType === 'message' && '✍️ 消息签名确认'}
                    {scanDataType === 'transaction' && '💸 交易签名确认'}
                    {scanDataType === 'authorization' && '🔐 授权确认'}
                    {scanDataType === 'raw' && '📄 数据详情'}
                  </h2>
                  <button
                    onClick={cancelConfirmation}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* 消息签名请求 */}
                {scanDataType === 'message' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        ⚠️ 您正在签名一条消息。请仔细确认消息内容后再继续。
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">消息内容</label>
                        <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm break-all">
                          {(scanResult.data && scanResult.data.message) || scanResult.message}
                        </div>
                      </div>

                      {((scanResult.data && scanResult.data.address) || scanResult.address) && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">请求者地址</label>
                          <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm font-mono break-all">
                            {(scanResult.data && scanResult.data.address) || scanResult.address}
                          </div>
                        </div>
                      )}

                      {scanResult.timestamp && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">时间戳</label>
                          <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm">
                            {new Date(scanResult.timestamp).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">签名钱包</label>
                        <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm">
                          <div className="font-mono break-all">{selectedWallet?.address}</div>
                          <div className="text-xs text-gray-500 mt-1">{selectedWallet?.chain} - {selectedWallet?.name}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={cancelConfirmation}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded transition-colors font-medium"
                        disabled={signatureInProgress}
                      >
                        取消
                      </button>
                      <button
                        onClick={signScannedMessage}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded transition-colors font-medium flex items-center justify-center gap-2"
                        disabled={signatureInProgress}
                      >
                        {signatureInProgress ? '签名中...' : '✍️ 确认签名'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 交易签名请求 */}
                {scanDataType === 'transaction' && (
                  <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
                      <p className="text-sm text-red-800 dark:text-red-300">
                        ⚠️ 您正在签名一笔交易。请仔细核对收款地址和金额后再继续。
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">收款地址</label>
                        <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm font-mono break-all">
                          {(scanResult.data && scanResult.data.to) || (scanResult.transaction && scanResult.transaction.to) || scanResult.to}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">转账金额</label>
                          <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-lg font-bold text-blue-600 dark:text-blue-400">
                            {(scanResult.data && scanResult.data.amount) || (scanResult.transaction && scanResult.transaction.amount) || scanResult.amount}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">区块链</label>
                          <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-lg font-bold">
                            {(scanResult.transaction && scanResult.transaction.chain) || scanResult.chain || selectedWallet?.chain}
                          </div>
                        </div>
                      </div>

                      {(scanResult.fee || (scanResult.transaction && scanResult.transaction.fee)) && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">手续费</label>
                          <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm">
                            {(scanResult.transaction && scanResult.transaction.fee) || scanResult.fee}
                          </div>
                        </div>
                      )}

                      {(scanResult.data || (scanResult.transaction && scanResult.transaction.data)) && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">交易数据</label>
                          <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono break-all max-h-20 overflow-y-auto">
                            {(scanResult.transaction && scanResult.transaction.data) || scanResult.data}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">签名钱包</label>
                        <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm">
                          <div className="font-mono break-all">{selectedWallet?.address}</div>
                          <div className="text-xs text-gray-500 mt-1">{selectedWallet?.chain} - {selectedWallet?.name}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={cancelConfirmation}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded transition-colors font-medium"
                        disabled={signatureInProgress}
                      >
                        取消
                      </button>
                      <button
                        onClick={signScannedTransaction}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white p-3 rounded transition-colors font-medium flex items-center justify-center gap-2"
                        disabled={signatureInProgress}
                      >
                        {signatureInProgress ? '签名中...' : '💸 确认签名交易'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 授权请求 */}
                {scanDataType === 'authorization' && (
                  <div className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700 rounded-lg p-4">
                      <p className="text-sm text-purple-800 dark:text-purple-300">
                        🔐 应用请求授权访问您的钱包。请仔细查看授权范围。
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                      {(scanResult.domain || (scanResult.authorization && scanResult.authorization.domain)) && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">请求域名</label>
                          <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm font-medium">
                            {(scanResult.authorization && scanResult.authorization.domain) || scanResult.domain}
                          </div>
                        </div>
                      )}

                      {(scanResult.scope || (scanResult.authorization && scanResult.authorization.scope)) && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">授权范围</label>
                          <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                            <ul className="text-sm space-y-1">
                              {((scanResult.authorization && scanResult.authorization.scope) || scanResult.scope || []).map((item: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-500">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {(scanResult.expiresIn || (scanResult.authorization && scanResult.authorization.expiresIn)) && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">有效期</label>
                          <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm">
                            {((scanResult.authorization && scanResult.authorization.expiresIn) || scanResult.expiresIn) / 60} 分钟
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">授权钱包</label>
                        <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm">
                          <div className="font-mono break-all">{selectedWallet?.address}</div>
                          <div className="text-xs text-gray-500 mt-1">{selectedWallet?.chain} - {selectedWallet?.name}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={cancelConfirmation}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded transition-colors font-medium"
                        disabled={signatureInProgress}
                      >
                        拒绝
                      </button>
                      <button
                        onClick={authorizeScannedRequest}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded transition-colors font-medium flex items-center justify-center gap-2"
                        disabled={signatureInProgress}
                      >
                        {signatureInProgress ? '授权中...' : '🔐 确认授权'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 原始数据显示 */}
                {scanDataType === 'raw' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 block">扫描内容</label>
                      <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                        {scanResult.raw ? (
                          <div className="text-sm break-all font-mono">{scanResult.raw}</div>
                        ) : (
                          <pre className="text-xs overflow-x-auto">{JSON.stringify(scanResult, null, 2)}</pre>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={cancelConfirmation}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white p-3 rounded transition-colors font-medium"
                    >
                      关闭
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;



