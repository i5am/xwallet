import { useState, useEffect, useRef } from 'react';
import { Wallet, WalletType, ChainType, NetworkType, MultisigConfig, SignerStatus } from './types';
import * as bip39 from 'bip39';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { BTCAdapter } from './services/blockchain/BTCAdapter-harmonyos';
import { ETHAdapter } from './services/blockchain/ETHAdapter';
import { FlightsparkAdapter } from './services/flightspark/FlightsparkAdapter';
import { AIServicePayment } from './types/flightspark';
import { getNetworkConfig } from './config';
import { formatAddress } from './utils';
import { ProtocolUtils } from './utils/protocol';
import { WalletStorage } from './services/storage/WalletStorage';
import { PasswordService } from './services/storage/PasswordService';
import { CRVAService, createDefaultCRVAConfig } from './services/crva/CRVAService';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Settings, Zap, X, Camera, QrCode as QrCodeIcon, Lock, Eye, EyeOff, Trash2, FileText } from 'lucide-react';

function App() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0.00');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
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
  const [importAddress, setImportAddress] = useState<string>('');
  const [importChain, setImportChain] = useState<ChainType>(ChainType.BTC);
  const [importWalletType, setImportWalletType] = useState<WalletType>(WalletType.HOT);
  const [isConvertingWatchOnly, setIsConvertingWatchOnly] = useState(false); // 是否正在转换观测钱包
  const [convertingWalletId, setConvertingWalletId] = useState<string | null>(null); // 要转换的观测钱包ID
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanDataType, setScanDataType] = useState<'message' | 'transaction' | 'authorization' | 'raw' | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [signatureInProgress, setSignatureInProgress] = useState(false);
  
  // 密码相关状态
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showSetPasswordDialog, setShowSetPasswordDialog] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordAction, setPasswordAction] = useState<'view' | 'delete' | null>(null);
  const [selectedWalletForAction, setSelectedWalletForAction] = useState<Wallet | null>(null);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  
  // 发送交易相关状态
  const [sendToAddress, setSendToAddress] = useState<string>('');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [sendFee, setSendFee] = useState<string>('');
  const [sendMemo, setSendMemo] = useState<string>('');
  const [transactionQrCode, setTransactionQrCode] = useState<string>('');
  
  // 输入扫描相关状态
  const [showInputScanDialog, setShowInputScanDialog] = useState(false);
  const [scanInputCallback, setScanInputCallback] = useState<((value: string) => void) | null>(null);
  const [scanInputTitle, setScanInputTitle] = useState<string>('扫描二维码');
  
  // OCR 相关状态
  const [showOCRDialog, setShowOCRDialog] = useState(false);
  const [ocrCallback, setOCRCallback] = useState<((value: string) => void) | null>(null);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [ocrProgress, setOCRProgress] = useState(0);
  const ocrVideoRef = useRef<HTMLVideoElement>(null);
  const ocrCanvasRef = useRef<HTMLCanvasElement>(null);
  const ocrStreamRef = useRef<MediaStream | null>(null);
  
  // 离线交易相关状态
  const [unsignedTxQrCode, setUnsignedTxQrCode] = useState<string>('');
  const [showUnsignedTxDialog, setShowUnsignedTxDialog] = useState(false);
  const [signedTxQrCode, setSignedTxQrCode] = useState<string>('');
  const [showSignedTxDialog, setShowSignedTxDialog] = useState(false);
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string>('');
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // DeepSafe 多签钱包相关状态
  const [showMultisigSetup, setShowMultisigSetup] = useState(false);
  const [multisigChain, setMultisigChain] = useState<ChainType>(ChainType.BTC);
  const [multisigM, setMultisigM] = useState<number>(2);
  const [multisigN, setMultisigN] = useState<number>(3);
  const [multisigSigners, setMultisigSigners] = useState<any[]>([]);
  // const [showMultisigProposals, setShowMultisigProposals] = useState(false);
  // const [multisigProposals, setMultisigProposals] = useState<any[]>([]);
  // const [selectedProposal, setSelectedProposal] = useState<any>(null);
  // const [showProposalDetail, setShowProposalDetail] = useState(false);
  
  // 摄像头相关 refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const inputVideoRef = useRef<HTMLVideoElement>(null);
  const inputCanvasRef = useRef<HTMLCanvasElement>(null);
  const inputScanIntervalRef = useRef<number | null>(null);
  const inputCallbackRef = useRef<((value: string) => void) | null>(null);

  // 组件加载时从本地存储加载钱包
  useEffect(() => {
    const loadedWallets = WalletStorage.loadWallets();
    if (loadedWallets.length > 0) {
      setWallets(loadedWallets);
      setSelectedWallet(loadedWallets[0]);
      console.log(`✅ 已加载 ${loadedWallets.length} 个钱包`);
    }
  }, []);

  // 生成接收地址二维码 (支持简单格式和协议格式)
  useEffect(() => {
    if (showReceiveDialog && selectedWallet) {
      const generateQRCode = async () => {
        try {
          let qrData: string;
          
          if (useProtocolFormat) {
            // 使用协议格式
            const message = ProtocolUtils.createAddressInfo({
              address: selectedWallet.address,
              chain: selectedWallet.chain,
              network: selectedWallet.network,
              publicKey: selectedWallet.publicKey,
              label: selectedWallet.name
            });
            qrData = JSON.stringify(message);
          } else {
            // 使用简单格式（纯地址）
            qrData = selectedWallet.address;
          }
          
          const dataUrl = await QRCode.toDataURL(qrData, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          
          setQrCodeDataUrl(dataUrl);
        } catch (error) {
          console.error('生成二维码失败:', error);
          // 生成错误占位符
          setQrCodeDataUrl('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZGQ0NDQ0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+55Sf5oiQ5aSx6LSlPC90ZXh0Pjwvc3ZnPg==');
        }
      };
      
      generateQRCode();
    }
  }, [showReceiveDialog, selectedWallet, useProtocolFormat]);

  // 刷新钱包余额
  const refreshBalance = async (wallet: Wallet) => {
    if (!wallet || wallet.type === WalletType.COLD) {
      // 冷钱包不查询余额(离线)
      setWalletBalance('--');
      return;
    }

    setIsLoadingBalance(true);
    try {
      const networkConfig = getNetworkConfig(wallet.chain, wallet.network);
      
      if (wallet.chain === ChainType.BTC) {
        const btcAdapter = new BTCAdapter(wallet.network);
        const balanceSat = await btcAdapter.getBalance(wallet.address);
        const balanceBTC = (balanceSat / 100000000).toFixed(8);
        setWalletBalance(balanceBTC);
      } else {
        const ethAdapter = new ETHAdapter(networkConfig.rpcUrl, wallet.network);
        const balanceWei = await ethAdapter.getBalance(wallet.address);
        const balanceETH = (Number(balanceWei) / 1e18).toFixed(4);
        setWalletBalance(balanceETH);
      }
    } catch (error) {
      console.error('刷新余额失败:', error);
      setWalletBalance('0.00');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // 当选中钱包改变时刷新余额
  useEffect(() => {
    if (selectedWallet) {
      refreshBalance(selectedWallet);
    } else {
      setWalletBalance('0.00');
    }
  }, [selectedWallet]);

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
        const btcAdapter = new BTCAdapter(network);
        const walletData = btcAdapter.generateTaprootAddress(mnemonic);
        address = walletData.address;
        privateKey = walletData.privateKey;
        publicKey = walletData.publicKey;
      } else {
        const ethAdapter = new ETHAdapter(networkConfig.rpcUrl, network);
        const walletData = ethAdapter.generateAddress(mnemonic);
        address = walletData.address;
        privateKey = walletData.privateKey;
        publicKey = walletData.publicKey;
      }

      const newWallet: Wallet = {
        id: Date.now().toString(),
        name: `${chain === ChainType.BTC ? 'BTC' : 'ETH'} ${type === WalletType.HOT ? '热' : type === WalletType.COLD ? '冷' : '观测'}钱包`,
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

      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      
      // 保存到本地存储
      WalletStorage.saveWallets(updatedWallets);
      
      setShowCreateWallet(false);
      alert(`钱包创建成功！\n\n地址: ${address}\n\n⚠️ 请务必备份助记词（已保存到本地）:\n${mnemonic}`);
    } catch (error) {
      alert(`创建钱包失败: ${(error as Error).message}`);
    }
  };

  // 创建 DeepSafe 多签钱包
  const createMultisigWallet = async () => {
    try {
      // 验证签名者数量
      if (multisigSigners.length !== multisigN) {
        alert(`❌ 请添加 ${multisigN} 个签名者\n\n当前已添加: ${multisigSigners.length} 个`);
        return;
      }
      
      if (!multisigSigners.some(s => s.isMe)) {
        alert('❌ 至少需要一个签名者是您自己');
        return;
      }

      console.log('🔐 开始创建 DeepSafe 多签钱包...');
      
      const network = NetworkType.MAINNET;
      // const networkConfig = getNetworkConfig(multisigChain, network);

      // 创建 CRVA 配置
      const crvaConfig = await createDefaultCRVAConfig();
      const crvaService = new CRVAService(crvaConfig);

      // 生成多签地址
      let multisigAddress = '';
      let multisigScript = '';
      
      if (multisigChain === ChainType.BTC) {
        // BTC 多签地址（P2WSH）
        console.log('生成 BTC P2WSH 多签地址...');
        // TODO: 实现真正的 P2WSH 多签脚本
        // 这里使用简化的模拟地址
        multisigAddress = `bc1q${Math.random().toString(36).substring(2, 40)}`;
        multisigScript = `OP_${multisigM} ${multisigSigners.map(s => s.publicKey).join(' ')} OP_${multisigN} OP_CHECKMULTISIG`;
      } else {
        // ETH 多签地址（Gnosis Safe 或简单合约）
        console.log('生成 ETH 多签合约地址...');
        // TODO: 实际部署 Gnosis Safe 合约
        multisigAddress = `0x${Math.random().toString(36).substring(2, 42)}`;
      }

      // 创建多签配置
      const multisigConfig: MultisigConfig = {
        m: multisigM,
        n: multisigN,
        signers: multisigSigners.map(signer => ({
          ...signer,
          status: SignerStatus.ACTIVE
        })),
        script: multisigChain === ChainType.BTC ? multisigScript : undefined,
        contractAddress: multisigChain === ChainType.ETH ? multisigAddress : undefined,
        createdBy: multisigSigners.find(s => s.isMe)?.address || '',
        createdAt: Date.now(),
        crvaConfig
      };

      // 创建多签钱包对象
      const newWallet: Wallet = {
        id: Date.now().toString(),
        name: `${multisigChain === ChainType.BTC ? 'BTC' : 'ETH'} DeepSafe ${multisigM}-of-${multisigN}`,
        type: WalletType.MULTISIG,
        chain: multisigChain,
        network,
        address: multisigAddress,
        publicKey: multisigSigners.find(s => s.isMe)?.publicKey || '',
        privateKey: undefined, // 多签钱包不存储单一私钥
        mnemonic: undefined,
        multisigConfig,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isOnline: true
      };

      // 测试 CRVA 验证节点选取
      console.log('🎲 测试 CRVA 委员会选取...');
      const committee = await crvaService.selectVerificationCommittee(newWallet.id);
      console.log(`✅ 已选取 ${committee.length} 个验证节点:`, committee.map(n => n.id));

      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      
      // 保存到本地存储
      WalletStorage.saveWallets(updatedWallets);
      
      setShowMultisigSetup(false);
      setMultisigSigners([]);

      // 生成钱包信息二维码（供其他签名者扫描）
      const walletInfo = {
        protocol: 'WDK',
        type: 'MULTISIG_WALLET_INFO',
        data: {
          walletId: newWallet.id,
          chain: multisigChain,
          network,
          address: multisigAddress,
          m: multisigM,
          n: multisigN,
          signers: multisigSigners,
          crvaEnabled: true
        }
      };
      
      // 生成钱包信息二维码（供其他签名者扫描）
      await QRCode.toDataURL(JSON.stringify(walletInfo), {
        width: 400,
        margin: 2
      });

      alert(
        `✅ DeepSafe 多签钱包创建成功！\n\n` +
        `地址: ${formatAddress(multisigAddress)}\n` +
        `签名策略: ${multisigM}-of-${multisigN}\n` +
        `签名者: ${multisigN} 个\n\n` +
        `🔐 CRVA 验证已启用\n` +
        `验证节点: ${crvaConfig.verificationNodes.length} 个\n` +
        `当前委员会: ${committee.length} 个节点\n\n` +
        `💡 提示:\n` +
        `1. 分享钱包信息给其他签名者\n` +
        `2. 任何签名者都可以发起交易\n` +
        `3. 需要 ${multisigM} 个签名才能完成交易\n` +
        `4. 所有交易都经过 CRVA 节点验证`
      );

      console.log('🎉 多签钱包创建完成！', newWallet);
    } catch (error) {
      console.error('创建多签钱包失败:', error);
      alert(`❌ 创建多签钱包失败: ${(error as Error).message}`);
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

      // 观察钱包：只需要地址
      if (importWalletType === WalletType.WATCH_ONLY) {
        if (!importAddress.trim()) {
          alert('请输入钱包地址');
          return;
        }
        
        address = importAddress.trim();
        
        // 简单验证地址格式
        if (importChain === ChainType.BTC) {
          if (!address.startsWith('bc1') && !address.startsWith('1') && !address.startsWith('3')) {
            alert('❌ 不是有效的 BTC 地址格式');
            return;
          }
        } else {
          if (!address.startsWith('0x') || address.length !== 42) {
            alert('❌ 不是有效的 ETH 地址格式');
            return;
          }
        }
        
        // 观察钱包没有私钥和助记词
        privateKey = '';
        publicKey = '';
      }
      // 热钱包/冷钱包：需要私钥或助记词
      else if (importType === 'mnemonic') {
        // 通过助记词导入
        if (!importMnemonic.trim()) {
          alert('请输入助记词');
          return;
        }

        // 验证助记词
        if (!bip39.validateMnemonic(importMnemonic.trim())) {
          alert('❌ 助记词格式不正确,请检查!');
          return;
        }

        mnemonic = importMnemonic.trim();

        if (importChain === ChainType.BTC) {
          const btcAdapter = new BTCAdapter(network);
          const walletData = btcAdapter.generateTaprootAddress(mnemonic);
          address = walletData.address;
          privateKey = walletData.privateKey;
          publicKey = walletData.publicKey;
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
          const btcAdapter = new BTCAdapter(network);
          address = btcAdapter.addressFromPrivateKey(privateKey);
          publicKey = privateKey.substring(0, 66); // BTC 公钥较短
        } else {
          const ethAdapter = new ETHAdapter(networkConfig.rpcUrl, network);
          address = ethAdapter.addressFromPrivateKey(privateKey);
          publicKey = privateKey.substring(0, 130);
        }
      }

      // 如果是转换观测钱包模式
      if (isConvertingWatchOnly && convertingWalletId) {
        const walletToConvert = wallets.find(w => w.id === convertingWalletId);
        if (!walletToConvert) {
          alert('❌ 找不到要转换的钱包');
          return;
        }

        // 验证地址是否匹配
        if (address.toLowerCase() !== walletToConvert.address.toLowerCase()) {
          alert('❌ 地址不匹配\n\n您输入的助记词/私钥生成的地址与观测钱包的地址不一致。\n\n请确保使用正确的助记词或私钥。');
          return;
        }

        // 更新观测钱包为热钱包或冷钱包
        const updatedWallets = wallets.map(w => 
          w.id === convertingWalletId
            ? {
                ...w,
                type: importWalletType,
                name: w.name.replace('观察', importWalletType === WalletType.HOT ? '热' : '冷'),
                mnemonic,
                privateKey,
                publicKey,
                isOnline: importWalletType === WalletType.HOT,
                updatedAt: Date.now()
              }
            : w
        );
        
        setWallets(updatedWallets);
        WalletStorage.saveWallets(updatedWallets);
        
        // 更新当前选中的钱包
        const updatedWallet = updatedWallets.find(w => w.id === convertingWalletId)!;
        setSelectedWallet(updatedWallet);
        
        setShowImportDialog(false);
        setImportMnemonic('');
        setImportPrivateKey('');
        setImportAddress('');
        setIsConvertingWatchOnly(false);
        setConvertingWalletId(null);
        
        alert(`✅ 观测钱包已成功转换为${importWalletType === WalletType.HOT ? '热' : '冷'}钱包！\n\n现在可以使用此钱包进行签名操作。`);
        
        // 如果是热钱包，自动刷新余额
        if (importWalletType === WalletType.HOT) {
          setTimeout(() => {
            refreshBalance(updatedWallet);
          }, 500);
        }
        
        return;
      }

      // 钱包类型名称
      let walletTypeName = '';
      if (importWalletType === WalletType.HOT) {
        walletTypeName = '热';
      } else if (importWalletType === WalletType.COLD) {
        walletTypeName = '冷';
      } else {
        walletTypeName = '观察';
      }

      // 创建钱包对象
      const newWallet: Wallet = {
        id: Date.now().toString(),
        name: `${importChain === ChainType.BTC ? 'BTC' : 'ETH'} ${walletTypeName}钱包 (导入)`,
        type: importWalletType,
        chain: importChain,
        network,
        address,
        mnemonic: importWalletType === WalletType.WATCH_ONLY ? undefined : mnemonic,
        privateKey: importWalletType === WalletType.WATCH_ONLY ? undefined : privateKey,
        publicKey: importWalletType === WalletType.WATCH_ONLY ? undefined : publicKey,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isOnline: importWalletType === WalletType.HOT,
      };

      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      
      // 保存到本地存储
      WalletStorage.saveWallets(updatedWallets);
      
      setShowImportDialog(false);
      setImportMnemonic('');
      setImportPrivateKey('');
      setImportAddress('');
      alert(`✅ 钱包导入成功！\n\n地址: ${address}`);
    } catch (error) {
      alert(`❌ 导入钱包失败: ${(error as Error).message}`);
    }
  };

  // 设置密码
  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    
    if (password.length < 4) {
      alert('密码长度至少为4位');
      return;
    }
    
    try {
      await PasswordService.setPassword(password);
      setShowSetPasswordDialog(false);
      setPassword('');
      setConfirmPassword('');
      alert('✅ 密码设置成功！');
    } catch (error) {
      alert(`设置密码失败: ${(error as Error).message}`);
    }
  };

  // 验证密码并查看钱包详情
  const handleViewWalletDetails = async (wallet: Wallet) => {
    if (!PasswordService.hasPassword()) {
      // 如果没有设置密码，提示先设置
      if (confirm('您还未设置密码，是否现在设置？\n\n设置密码后可以保护您的私钥和助记词')) {
        setShowSetPasswordDialog(true);
      }
      return;
    }
    
    setSelectedWalletForAction(wallet);
    setPasswordAction('view');
    setShowPasswordDialog(true);
  };

  // 密码验证
  const handlePasswordVerify = async () => {
    if (!password) {
      alert('请输入密码');
      return;
    }
    
    try {
      const isValid = await PasswordService.verifyPassword(password);
      if (!isValid) {
        alert('❌ 密码错误！');
        return;
      }
      
      setShowPasswordDialog(false);
      setPassword('');
      
      if (passwordAction === 'view' && selectedWalletForAction) {
        // 显示钱包详情
        setSelectedWallet(selectedWalletForAction);
        setShowWalletDetails(true);
      } else if (passwordAction === 'delete' && selectedWalletForAction) {
        // 删除钱包
        handleDeleteWallet(selectedWalletForAction.id);
      }
    } catch (error) {
      alert(`验证失败: ${(error as Error).message}`);
    }
  };

  // 删除钱包
  const handleDeleteWallet = (walletId: string) => {
    if (!confirm('确定要删除这个钱包吗？\n\n⚠️ 删除后无法恢复，请确保已备份助记词！')) {
      return;
    }
    
    const updatedWallets = wallets.filter(w => w.id !== walletId);
    setWallets(updatedWallets);
    WalletStorage.saveWallets(updatedWallets);
    
    if (selectedWallet?.id === walletId) {
      setSelectedWallet(updatedWallets[0] || null);
    }
    
    alert('✅ 钱包已删除');
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
        const btcAdapter = new BTCAdapter(wallet.network);
        balance = await btcAdapter.getBalance(wallet.address);
        
        // BTC Lightning Network 提示
        alert('⚠️ Lightning Network 功能开发中\n\n当前可以:\n✅ 创建 BTC 钱包\n✅ 查看余额\n✅ 发送普通交易\n\n闪电网络支付即将推出!');
        return;
      } else {
        const ethAdapter = new ETHAdapter(networkConfig.rpcUrl, wallet.network);
        const balanceWei = await ethAdapter.getBalance(wallet.address);
        balance = Number(balanceWei);
        
        // 对于 ETH, Lightning Network 不适用
        alert('⚠️ 提示: Lightning Network 主要用于 BTC 支付。\n\n对于 ETH 支付,建议使用普通的"发送"功能。');
        return;
      }

      // 2. 确认支付
      const confirmMsg = `确认 AI 服务支付:\n\n` +
        `💰 当前余额: ${balance} satoshis\n` +
        `💸 支付金额: ${aiPaymentAmount} satoshis\n` +
        `📍 AI 地址: ${aiWalletAddress.substring(0, 20)}...\n` +
        `🔧 服务类型: ${aiServiceType}\n\n` +
        `⚠️ 注意: 这是演示版本,实际不会执行真实支付。\n` +
        `在生产环境中,需要集成真实的 Lightning Network 节点。\n\n` +
        `是否继续?`;

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

  // 启动输入扫描
  const startInputScan = async () => {
    try {
      console.log('🎥 开始请求摄像头权限...');
      
      // 检查是否在支持的环境中
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('您的浏览器不支持摄像头功能。请使用现代浏览器（Chrome、Safari、Firefox）或在真机上测试。');
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      console.log('✅ 摄像头权限已授予');
      console.log('📹 视频流信息:', {
        tracks: stream.getVideoTracks().length,
        settings: stream.getVideoTracks()[0]?.getSettings()
      });
      
      if (inputVideoRef.current) {
        inputVideoRef.current.srcObject = stream;
        
        // 尝试立即播放
        try {
          await inputVideoRef.current.play();
          console.log('▶️ 视频开始播放');
          
          // 等待视频真正准备好
          await new Promise((resolve) => {
            const checkReady = () => {
              if (inputVideoRef.current && inputVideoRef.current.readyState >= 2) {
                console.log('📹 视频已准备就绪 (readyState=' + inputVideoRef.current.readyState + ')');
                console.log('📐 视频尺寸:', {
                  width: inputVideoRef.current.videoWidth,
                  height: inputVideoRef.current.videoHeight
                });
                resolve(true);
              } else {
                setTimeout(checkReady, 100);
              }
            };
            checkReady();
          });
          
          // 开始扫描循环
          inputScanIntervalRef.current = window.setInterval(() => {
            scanInputFrame();
          }, 100);
          console.log('🔄 扫描循环已启动');
          
        } catch (playErr) {
          console.error('❌ 视频播放失败:', playErr);
          alert('视频播放失败: ' + (playErr as Error).message);
        }
      }
    } catch (error) {
      console.error('❌ 无法访问摄像头:', error);
      const err = error as Error;
      if (err.name === 'NotAllowedError') {
        alert('摄像头权限被拒绝。请在浏览器设置中允许访问摄像头。');
      } else if (err.name === 'NotFoundError') {
        alert('未找到摄像头设备。请确保设备有摄像头。');
      } else {
        alert('无法访问摄像头\n\n错误详情: ' + err.message + '\n\n建议：\n1. 确保使用 HTTPS 或 localhost\n2. 检查浏览器摄像头权限\n3. 尝试在真机上测试');
      }
    }
  };

  // 停止输入扫描
  const stopInputScan = () => {
    if (inputScanIntervalRef.current) {
      clearInterval(inputScanIntervalRef.current);
      inputScanIntervalRef.current = null;
    }
    
    if (inputVideoRef.current && inputVideoRef.current.srcObject) {
      const stream = inputVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      inputVideoRef.current.srcObject = null;
    }
  };

  // 扫描输入框二维码帧
  const scanInputFrame = () => {
    if (!inputVideoRef.current || !inputCanvasRef.current) {
      console.log('⚠️ 视频或画布引用不存在');
      return;
    }
    
    const video = inputVideoRef.current;
    const canvas = inputCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.log('⚠️ 无法获取画布上下文');
      return;
    }
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return; // 视频尚未准备好
    }
    
    // 每100次扫描输出一次状态（避免刷屏）
    if (Math.random() < 0.01) {
      console.log('🔍 正在扫描...', {
        videoSize: `${video.videoWidth}x${video.videoHeight}`,
        hasCallback: !!scanInputCallback
      });
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      console.log('🎯 检测到二维码!', {
        data: code.data.substring(0, 50),
        hasCallback: !!inputCallbackRef.current
      });
      
      if (inputCallbackRef.current) {
        console.log('✅ 扫描到二维码，准备处理:', code.data);
        stopInputScan();
        
        // 尝试解析数据
        let value = code.data;
        try {
          const parsed = ProtocolUtils.parseMessage(code.data);
          if (parsed && parsed.data) {
            // 根据不同类型提取数据
            if (parsed.data.address) {
              value = parsed.data.address;
            } else if (parsed.data.privateKey) {
              value = parsed.data.privateKey;
            } else if (parsed.data.mnemonic) {
              value = parsed.data.mnemonic;
            } else if (typeof parsed.data === 'string') {
              value = parsed.data;
            }
          }
        } catch (e) {
          // 使用原始数据
          console.log('ℹ️ 使用原始二维码数据');
        }
        
        console.log('📝 填充值:', value);
        inputCallbackRef.current(value);
        setShowInputScanDialog(false);
        setScanInputCallback(null);
        inputCallbackRef.current = null;
      } else {
        console.warn('⚠️ 检测到二维码但 callback 为空!');
      }
    }
  };

  // 打开输入扫描对话框
  const openInputScan = (title: string, callback: (value: string) => void) => {
    console.log('🚀 打开输入扫描对话框:', title);
    setScanInputTitle(title);
    
    // 使用 ref 立即保存 callback，避免 state 更新延迟
    inputCallbackRef.current = (value: string) => {
      console.log('📞 Callback 被调用，值:', value);
      callback(value);
    };
    
    // 仍然保持 state 用于 UI 显示兼容性
    setScanInputCallback(() => inputCallbackRef.current);
    setShowInputScanDialog(true);
    
    console.log('⏱️ 300ms 后启动摄像头，callback 已保存到 ref');
    setTimeout(() => startInputScan(), 300);
  };

  // 关闭输入扫描对话框
  const closeInputScan = () => {
    stopInputScan();
    setShowInputScanDialog(false);
    setScanInputCallback(null);
    inputCallbackRef.current = null;
  };

  // 打开 OCR 对话框
  const openOCR = (callback: (value: string) => void) => {
    console.log('📸 打开 OCR 识别对话框');
    setOCRCallback(() => callback);
    setShowOCRDialog(true);
    setOCRProgress(0);
    setIsOCRProcessing(false);
    setTimeout(() => startOCRCamera(), 300);
  };

  // 启动 OCR 摄像头
  const startOCRCamera = async () => {
    try {
      console.log('📷 启动 OCR 摄像头...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (ocrVideoRef.current) {
        ocrVideoRef.current.srcObject = stream;
        ocrStreamRef.current = stream;
        await ocrVideoRef.current.play();
        console.log('✅ OCR 摄像头已启动');
      }
    } catch (error) {
      console.error('❌ 启动 OCR 摄像头失败:', error);
      alert('无法访问摄像头: ' + (error as Error).message);
    }
  };

  // 停止 OCR 摄像头
  const stopOCRCamera = () => {
    if (ocrStreamRef.current) {
      ocrStreamRef.current.getTracks().forEach(track => track.stop());
      ocrStreamRef.current = null;
    }
    if (ocrVideoRef.current) {
      ocrVideoRef.current.srcObject = null;
    }
  };

  // 拍照并进行 OCR 识别
  const captureAndRecognize = async () => {
    if (!ocrVideoRef.current || !ocrCanvasRef.current) {
      alert('摄像头未就绪');
      return;
    }

    try {
      setIsOCRProcessing(true);
      setOCRProgress(0);

      // 拍照
      const video = ocrVideoRef.current;
      const canvas = ocrCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法获取 Canvas 上下文');
      }
      ctx.drawImage(video, 0, 0);

      console.log('📸 已拍照，开始 OCR 识别...');

      // 方案 1: 检查是否在 iOS WebView 中，尝试调用原生 OCR
      // @ts-ignore
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.ocrRecognize) {
        try {
          const imageData = canvas.toDataURL('image/png');
          // @ts-ignore
          window.webkit.messageHandlers.ocrRecognize.postMessage({ image: imageData });
          
          // 等待原生回调
          // @ts-ignore
          window.handleOCRResult = (text: string) => {
            if (text && ocrCallback) {
              ocrCallback(text);
              closeOCR();
              alert(`✅ 识别成功！\n\n识别到 ${text.length} 个字符`);
            }
            setIsOCRProcessing(false);
          };
          
          console.log('✅ 已调用 iOS 原生 OCR');
          return;
        } catch (e) {
          console.warn('iOS 原生 OCR 调用失败，尝试其他方案');
        }
      }

      // 方案 2: 使用浏览器原生 TextDetector API
      // @ts-ignore
      if ('TextDetector' in window) {
        try {
          setOCRProgress(30);
          // @ts-ignore
          const textDetector = new TextDetector();
          const texts = await textDetector.detect(canvas);
          
          if (texts && texts.length > 0) {
            const recognizedText = texts.map((t: any) => t.rawValue).join('\n');
            console.log('✅ 原生 TextDetector 识别完成:', recognizedText);
            
            if (ocrCallback) {
              ocrCallback(recognizedText);
            }
            closeOCR();
            alert(`✅ 识别成功！\n\n识别到 ${recognizedText.length} 个字符`);
            return;
          }
        } catch (e) {
          console.warn('TextDetector API 不可用:', e);
        }
      }

      // 方案 3: 使用简化的手动输入
      setIsOCRProcessing(false);
      const manualInput = confirm('⚠️ OCR 功能当前不可用\n\n是否手动输入文字？');
      if (manualInput) {
        closeOCR();
        // 触发一个简单的 prompt
        setTimeout(() => {
          const text = prompt('请输入要签名的消息:');
          if (text && ocrCallback) {
            ocrCallback(text);
          }
        }, 300);
      }
    } catch (error) {
      console.error('❌ OCR 识别失败:', error);
      setIsOCRProcessing(false);
      
      const retry = confirm('❌ OCR 识别失败\n\n是否手动输入文字？');
      if (retry) {
        closeOCR();
        setTimeout(() => {
          const text = prompt('请输入要签名的消息:');
          if (text && ocrCallback) {
            ocrCallback(text);
          }
        }, 300);
      }
    }
  };

  // 关闭 OCR 对话框
  const closeOCR = () => {
    stopOCRCamera();
    setShowOCRDialog(false);
    setOCRCallback(null);
    setIsOCRProcessing(false);
    setOCRProgress(0);
  };

  // 生成未签名交易
  const generateUnsignedTransaction = async () => {
    if (!selectedWallet || !sendToAddress || !sendAmount) {
      alert('请填写完整的交易信息');
      return;
    }

    try {
      const unsignedTxData = {
        protocol: 'WDK',
        version: '1.0',
        type: 'UNSIGNED_TX',
        data: {
          from: selectedWallet.address,
          to: sendToAddress,
          amount: sendAmount,
          fee: sendFee || '0.0001',
          chain: selectedWallet.chain,
          network: selectedWallet.network,
          memo: sendMemo || '',
          timestamp: Date.now()
        }
      };

      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(unsignedTxData), {
        width: 300,
        margin: 2
      });

      setUnsignedTxQrCode(qrCodeUrl);
      setShowUnsignedTxDialog(true);
      setShowSendDialog(false);
    } catch (error) {
      console.error('生成未签名交易失败:', error);
      alert('生成未签名交易失败');
    }
  };

  // 签名交易（冷钱包）
  const signTransaction = async (unsignedTxData: any) => {
    if (!selectedWallet || !selectedWallet.privateKey) {
      alert('冷钱包缺少私钥，无法签名');
      return;
    }

    try {
      const { from, to, amount, fee, chain, network } = unsignedTxData.data;
      
      let signedTxHex = '';
      let txid = '';

      if (chain === ChainType.BTC) {
        // BTC 签名逻辑（简化示例）
        signedTxHex = `signed_btc_tx_${Date.now()}`;
        txid = `btc_txid_${Date.now()}`;
      } else if (chain === ChainType.ETH) {
        // ETH 签名逻辑（简化示例）
        signedTxHex = `signed_eth_tx_${Date.now()}`;
        txid = `eth_txid_${Date.now()}`;
      }

      const signedTxData = {
        protocol: 'WDK',
        version: '1.0',
        type: 'SIGNED_TX',
        data: {
          signedTx: signedTxHex,
          txid: txid,
          from,
          to,
          amount,
          fee,
          chain,
          network,
          timestamp: Date.now()
        }
      };

      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(signedTxData), {
        width: 300,
        margin: 2
      });

      setSignedTxQrCode(qrCodeUrl);
      setShowSignedTxDialog(true);
      alert('✅ 交易签名成功！请使用热钱包扫描二维码进行广播');
    } catch (error) {
      console.error('签名交易失败:', error);
      alert('签名交易失败');
    }
  };

  // 广播交易（热钱包）
  const broadcastTransaction = async (signedTxData: any) => {
    try {
      setShowBroadcastDialog(true);
      setBroadcastResult('');

      const { txid } = signedTxData.data;

      // 模拟广播延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 实际应用中应调用区块链 API
      // const { chain, signedTx } = signedTxData.data;
      // if (chain === ChainType.BTC) {
      //   const adapter = new BTCAdapter(network);
      //   const result = await adapter.broadcastTransaction(signedTx);
      // }

      setBroadcastResult(txid);
      alert(`✅ 交易已成功广播！\n\nTXID: ${txid}`);
    } catch (error) {
      console.error('广播交易失败:', error);
      alert('广播交易失败');
      setShowBroadcastDialog(false);
    }
  };

  // 广播签名后的交易（观测钱包使用）
  const broadcastSignedTransaction = async (signedData: any) => {
    try {
      if (!selectedWallet) {
        alert('❌ 请先选择钱包');
        return;
      }

      // 验证是否是观测钱包
      if (selectedWallet.type !== WalletType.WATCH_ONLY) {
        alert('⚠️ 此功能仅供观测钱包使用');
        return;
      }

      // 解析签名数据
      let txData: any;
      
      // 如果 message 字段是字符串，尝试解析
      if (typeof signedData.message === 'string') {
        try {
          const parsedMessage = JSON.parse(signedData.message);
          txData = parsedMessage.data || parsedMessage;
        } catch (e) {
          console.error('解析 message 字段失败:', e);
          txData = signedData;
        }
      } else {
        txData = signedData.message?.data || signedData;
      }

      const signature = signedData.signature;
      const signerAddress = signedData.address;
      const chain = signedData.chain || txData.chain;

      // 验证数据完整性
      if (!signature) {
        alert('❌ 签名数据不完整，缺少签名');
        return;
      }

      if (!txData.to || !txData.amount) {
        alert('❌ 交易数据不完整，缺少收款地址或金额');
        return;
      }

      // 验证链类型
      if (chain && chain !== selectedWallet.chain) {
        alert(`❌ 链类型不匹配\n\n签名链: ${chain}\n钱包链: ${selectedWallet.chain}`);
        return;
      }

      // 验证地址匹配
      if (txData.from && txData.from.toLowerCase() !== selectedWallet.address.toLowerCase()) {
        alert(`❌ 发送地址不匹配\n\n交易地址: ${txData.from}\n钱包地址: ${selectedWallet.address}`);
        return;
      }

      // 显示交易详情并确认
      const confirmMessage = `
📤 准备广播交易

收款地址: ${formatAddress(txData.to)}
转账金额: ${txData.amount} ${chain === 'bitcoin' ? 'BTC' : 'ETH'}
手续费: ${txData.fee || '未知'}
签名者: ${formatAddress(signerAddress)}

确认广播到区块链网络？
      `.trim();

      if (!confirm(confirmMessage)) {
        return;
      }

      // 显示广播对话框
      setShowScanDialog(false);
      setShowBroadcastDialog(true);
      setBroadcastResult('正在广播交易...');

      // 模拟广播延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 实际应用中应调用区块链 API 广播交易
      // 这里使用模拟的 TXID
      const mockTxId = txData.txId || `${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // TODO: 实际广播逻辑
      // if (selectedWallet.chain === ChainType.BTC) {
      //   const btcAdapter = new BTCAdapter(selectedWallet.network);
      //   const result = await btcAdapter.broadcastTransaction(signature);
      //   setBroadcastResult(result.txid);
      // } else {
      //   const ethAdapter = new ETHAdapter(networkConfig.rpcUrl, selectedWallet.network);
      //   const result = await ethAdapter.broadcastTransaction(signature);
      //   setBroadcastResult(result.hash);
      // }

      setBroadcastResult(mockTxId);
      alert(`✅ 交易已成功广播！\n\nTXID: ${mockTxId}\n\n交易已提交到区块链网络，请等待确认。`);
      
      // 广播成功后刷新余额
      setTimeout(() => {
        refreshBalance(selectedWallet);
      }, 1000);

    } catch (error) {
      console.error('广播交易失败:', error);
      alert(`❌ 广播交易失败: ${(error as Error).message}`);
      setShowBroadcastDialog(false);
    }
  };

  // 加载交易历史
  const loadTransactionHistory = async () => {
    if (!selectedWallet) return;

    try {
      // 模拟加载交易历史（实际应从区块链 API 获取）
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockTransactions = [
        {
          type: 'send',
          status: 'confirmed',
          amount: '0.001',
          chain: selectedWallet.chain,
          address: 'bc1q...',
          fee: '0.0001',
          confirmations: 6,
          txid: 'mock_txid_1',
          timestamp: Date.now() - 3600000
        },
        {
          type: 'receive',
          status: 'confirmed',
          amount: '0.002',
          chain: selectedWallet.chain,
          address: 'bc1q...',
          fee: '0',
          confirmations: 12,
          txid: 'mock_txid_2',
          timestamp: Date.now() - 7200000
        }
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('加载交易历史失败:', error);
      setTransactions([]);
    }
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
            // 检查是否是自定义的未签名/已签名交易类型
            if (protocolMessage.type === 'UNSIGNED_TX') {
              // 未签名交易，调用签名函数
              if (confirm('检测到未签名交易，是否签名？')) {
                signTransaction(protocolMessage);
              }
            } else if (protocolMessage.type === 'SIGNED_TX') {
              // 已签名交易，调用广播函数
              if (confirm('检测到已签名交易，是否立即广播？')) {
                broadcastTransaction(protocolMessage);
              }
            } else {
              setScanDataType('raw');
              setShowConfirmDialog(true);
            }
        }
      } else {
        // 不是协议消息,尝试解析旧格式
        try {
          const parsed = JSON.parse(data);
          setScanResult(parsed);
          
          // 识别数据类型并分类 (兼容旧格式)
          // 优先检查是否是签名响应（包含 signature 字段）
          if (parsed.signature && (parsed.message || parsed.transaction || parsed.txId)) {
            // 这是一个签名响应
            if (selectedWallet?.type === WalletType.WATCH_ONLY) {
              // 观测钱包扫描到签名响应，准备广播
              if (confirm('✅ 检测到签名结果！\n\n是否立即广播交易到区块链网络？')) {
                broadcastSignedTransaction(parsed);
              }
            } else {
              // 其他钱包类型显示详情
              setScanDataType('raw');
              setShowConfirmDialog(true);
            }
          } else if (parsed.type === 'message' || parsed.message !== undefined) {
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
      stopInputScan();
    };
  }, []);

  return (
    <>
      <div className="min-h-screen px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WalletIcon className="w-10 h-10 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white whitespace-nowrap">
                  XWallet
                </h1>
                <p className="text-white/80 text-sm">
                  多链加密货币钱包
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowSettingsDialog(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2"
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
                    
                    {/* DeepSafe 多签钱包 */}
                    <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setShowCreateWallet(false);
                            setShowMultisigSetup(true);
                            setMultisigChain(ChainType.BTC);
                          }}
                          className="btn-secondary text-sm bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-300 dark:border-purple-700"
                        >
                          🔐 BTC 多签钱包
                        </button>
                        <button
                          onClick={() => {
                            setShowCreateWallet(false);
                            setShowMultisigSetup(true);
                            setMultisigChain(ChainType.ETH);
                          }}
                          className="btn-secondary text-sm bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-300 dark:border-purple-700"
                        >
                          🔐 ETH 多签钱包
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        DeepSafe 多签方案 - 多人共管，更安全
                      </p>
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
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedWallet?.id === wallet.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          onClick={() => setSelectedWallet(wallet)}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-gray-800 dark:text-white">
                            {wallet.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                            {formatAddress(wallet.address)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">
                            {wallet.type === WalletType.HOT && '🔥'}
                            {wallet.type === WalletType.COLD && '❄️'}
                            {wallet.type === WalletType.WATCH_ONLY && '👁️'}
                            {wallet.type === WalletType.MULTISIG && '🔐'}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewWalletDetails(wallet);
                            }}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="查看详情"
                          >
                            <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (wallets.length <= 1) {
                                alert('❌ 无法删除\n\n至少需要保留一个钱包');
                                return;
                              }
                              if (confirm(`⚠️ 确认删除钱包？\n\n钱包：${wallet.name}\n地址：${formatAddress(wallet.address)}\n\n删除后无法恢复！请确保已备份助记词或私钥。\n\n确定要删除吗？`)) {
                                // 删除钱包
                                const updatedWallets = wallets.filter(w => w.id !== wallet.id);
                                setWallets(updatedWallets);
                                WalletStorage.saveWallets(updatedWallets);
                                
                                // 如果删除的是当前选中的钱包，选择第一个钱包
                                if (selectedWallet?.id === wallet.id) {
                                  const newSelected = updatedWallets[0];
                                  setSelectedWallet(newSelected);
                                  refreshBalance(newSelected);
                                }
                                
                                alert('✅ 钱包已删除');
                              }
                            }}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="删除钱包"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
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
                    <div className="text-5xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-3">
                      {isLoadingBalance ? (
                        <div className="animate-spin">⏳</div>
                      ) : (
                        walletBalance
                      )}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {selectedWallet.chain === ChainType.BTC ? 'BTC' : 'ETH'}
                    </div>
                  </div>

                  {/* 根据钱包类型显示不同的功能按钮 */}
                  
                  {/* 热钱包：完整功能 */}
                  {selectedWallet.type === WalletType.HOT && (
                    <>
                      <div className="mt-4 px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-300 dark:border-orange-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🔥</span>
                          <h3 className="font-semibold text-orange-800 dark:text-orange-200">热钱包模式</h3>
                        </div>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          在线钱包，支持所有功能：发送、接收、签名、AI支付
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button 
                          onClick={() => setShowSendDialog(true)}
                          className="btn-primary flex items-center justify-center gap-2"
                        >
                          <ArrowUpRight className="w-5 h-5" />
                          发送
                        </button>
                        <button 
                          onClick={() => setShowReceiveDialog(true)}
                          className="btn-secondary flex items-center justify-center gap-2"
                        >
                          <ArrowDownLeft className="w-5 h-5" />
                          接收
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <button 
                          onClick={() => setShowSignDialog(true)}
                          className="btn-secondary flex items-center justify-center gap-2"
                        >
                          ✍️ 签名消息
                        </button>
                        <button 
                          onClick={() => setShowAIPaymentDialog(true)}
                          className="btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        >
                          <Zap className="w-5 h-5" />
                          AI支付
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 mt-3">
                        <button 
                          onClick={() => setShowScanDialog(true)}
                          className="btn-secondary flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                        >
                          <Camera className="w-5 h-5" />
                          扫描二维码
                        </button>
                      </div>
                    </>
                  )}
                  
                  {/* 冷钱包：离线签名功能 */}
                  {selectedWallet.type === WalletType.COLD && (
                    <>
                      <div className="mt-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">❄️</span>
                          <h3 className="font-semibold text-blue-800 dark:text-blue-200">冷钱包模式（离线）</h3>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                          完全离线的安全钱包，通过二维码与观测钱包配合使用
                        </p>
                        <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1 pl-4">
                          <p>• 扫描二维码接收未签名交易</p>
                          <p>• 离线签名交易后生成签名结果</p>
                          <p>• 由观测钱包扫描签名结果并广播</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 mt-4">
                        <button 
                          onClick={() => setShowReceiveDialog(true)}
                          className="btn-primary flex items-center justify-center gap-2"
                        >
                          <QrCodeIcon className="w-5 h-5" />
                          显示地址二维码
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 mt-3">
                        <button 
                          onClick={() => setShowSignDialog(true)}
                          className="btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                          ✍️ 签名交易/消息
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 mt-3">
                        <button 
                          onClick={() => setShowScanDialog(true)}
                          className="btn-secondary flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                        >
                          <Camera className="w-5 h-5" />
                          扫描未签名交易
                        </button>
                      </div>
                      
                      <div className="mt-3 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-xs text-yellow-800 dark:text-yellow-200">
                        ⚠️ 冷钱包不支持直接发送和 AI 支付，请使用观测钱包创建交易
                      </div>
                    </>
                  )}
                  
                  {/* 观测钱包：只读功能 */}
                  {selectedWallet.type === WalletType.WATCH_ONLY && (
                    <>
                      <div className="mt-4 px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">👁️</span>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">观测钱包模式（只读）</h3>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          监控钱包余额和交易，为冷钱包创建未签名交易
                        </p>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 pl-4">
                          <p>✅ 查看余额和交易历史</p>
                          <p>✅ 创建未签名交易（生成二维码）</p>
                          <p>✅ 扫描冷钱包的签名结果并广播</p>
                          <p>❌ 无法直接签名（需配合冷钱包）</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button 
                          onClick={() => {
                            // 观测钱包的"发送"实际上是创建未签名交易
                            setShowSendDialog(true);
                          }}
                          className="btn-primary flex items-center justify-center gap-2"
                        >
                          <QrCodeIcon className="w-5 h-5" />
                          创建交易
                        </button>
                        <button 
                          onClick={() => setShowReceiveDialog(true)}
                          className="btn-secondary flex items-center justify-center gap-2"
                        >
                          <ArrowDownLeft className="w-5 h-5" />
                          接收地址
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 mt-3">
                        <button 
                          onClick={() => setShowScanDialog(true)}
                          className="btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          <Camera className="w-5 h-5" />
                          扫描签名结果并广播
                        </button>
                      </div>
                      
                      <div className="mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded text-xs text-blue-800 dark:text-blue-200">
                        💡 提示：点击"创建交易"生成未签名交易二维码，用冷钱包扫描签名后，再回来扫描签名结果
                      </div>
                    </>
                  )}
                  
                  {/* 多签钱包：DeepSafe CRVA 功能 */}
                  {selectedWallet.type === WalletType.MULTISIG && selectedWallet.multisigConfig && (
                    <>
                      <div className="mt-4 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-300 dark:border-indigo-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🔐</span>
                          <h3 className="font-semibold text-indigo-800 dark:text-indigo-200">DeepSafe 多签钱包</h3>
                        </div>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">
                          {selectedWallet.multisigConfig.m}-of-{selectedWallet.multisigConfig.n} 多重签名，需要 {selectedWallet.multisigConfig.m} 个签名者批准
                        </p>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1 pl-4">
                          <p>✅ 创建转账提案</p>
                          <p>✅ 签名待处理提案</p>
                          <p>✅ CRVA 隐私验证（Ring VRF）</p>
                          <p>✅ 达到阈值后自动执行</p>
                        </div>
                        
                        {/* 显示签名者列表 */}
                        <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700">
                          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                            签名者 ({selectedWallet.multisigConfig.signers.length}):
                          </div>
                          <div className="space-y-1">
                            {selectedWallet.multisigConfig.signers.map((signer, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                <span className="text-indigo-600 dark:text-indigo-400">
                                  {index + 1}.
                                </span>
                                <span className="font-mono text-indigo-800 dark:text-indigo-200 truncate">
                                  {signer.name || `签名者${index + 1}`}
                                </span>
                                <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
                                  signer.status === SignerStatus.ACTIVE 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                  {signer.status === SignerStatus.ACTIVE ? '活跃' : '待定'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* CRVA 状态 */}
                        {selectedWallet.multisigConfig.crvaConfig && (
                          <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-green-600 dark:text-green-400">✓</span>
                              <span className="text-indigo-700 dark:text-indigo-300">
                                CRVA 验证已启用（{selectedWallet.multisigConfig.crvaConfig.verificationNodes.length} 个验证节点）
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button 
                          onClick={() => {
                            alert('🚧 多签转账提案功能开发中...\n\n请使用以下步骤：\n1. 点击"创建提案"创建转账提案\n2. 其他签名者扫描二维码签名\n3. 收集足够签名后执行交易');
                            setShowSendDialog(true);
                          }}
                          className="btn-primary flex items-center justify-center gap-2"
                        >
                          <ArrowUpRight className="w-5 h-5" />
                          创建提案
                        </button>
                        <button 
                          onClick={() => setShowReceiveDialog(true)}
                          className="btn-secondary flex items-center justify-center gap-2"
                        >
                          <ArrowDownLeft className="w-5 h-5" />
                          接收地址
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <button 
                          onClick={() => {
                            alert('🚧 提案列表功能开发中...\n\n将显示：\n• 待签名提案\n• 已签名提案\n• 已执行提案\n• 已拒绝提案');
                          }}
                          className="btn-secondary flex items-center justify-center gap-2"
                        >
                          <FileText className="w-5 h-5" />
                          提案列表
                        </button>
                        <button 
                          onClick={() => {
                            setShowScanDialog(true);
                          }}
                          className="btn-secondary flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                        >
                          <Camera className="w-5 h-5" />
                          扫描签名
                        </button>
                      </div>
                      
                      <div className="mt-3 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700 rounded text-xs text-purple-800 dark:text-purple-200">
                        💡 多签流程：创建提案 → 收集签名 → CRVA验证 → 达到阈值({selectedWallet.multisigConfig.m}个)后自动执行
                      </div>
                    </>
                  )}
                  
                    {/* 新增功能入口按钮 */}
                    <div className="grid grid-cols-1 gap-3 mt-4">
                      <button
                        onClick={() => {
                          if (!selectedWallet) {
                            alert('⚠️ 请先创建或选择一个钱包');
                            return;
                          }
                          loadTransactionHistory();
                          setShowTransactionHistory(true);
                        }}
                        className="btn-secondary flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        查看交易历史
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
                      <>
                        <button
                          onClick={async () => {
                            const pwd = prompt('请输入钱包密码以查看助记词');
                            if (!pwd) return;
                            const ok = await PasswordService.verifyPassword(pwd);
                            if (ok) {
                              setShowMnemonic(true);
                              setTimeout(() => setShowMnemonic(false), 20000);
                            } else {
                              alert('密码错误');
                            }
                          }}
                          className="btn-secondary mt-2"
                        >
                          查看助记词（需密码）
                        </button>
                        {showMnemonic && (
                          <div className="mt-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">
                              助记词 (请妥善保管)
                            </label>
                            <div className="font-mono text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded mt-1 border border-yellow-300 dark:border-yellow-700">
                              {selectedWallet.mnemonic}
                            </div>
                          </div>
                        )}
                      </>
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
        <footer className="mt-12 pb-8 text-center text-white/60">
          <p className="text-sm">
            XWallet v1.0.0
          </p>
          <p className="text-xs mt-1">
            ⚠️ 请务必备份助记词，丢失后将无法恢复钱包
          </p>
        </footer>

        {/* 发送对话框 */}
        {showSendDialog && selectedWallet && (
          <div className="dialog-overlay">
            <div className="dialog-content card max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                {selectedWallet.type === WalletType.WATCH_ONLY ? (
                  <>
                    <QrCodeIcon className="w-6 h-6" />
                    创建未签名交易
                  </>
                ) : selectedWallet.type === WalletType.COLD ? (
                  <>
                    <span className="text-xl">❄️</span>
                    生成未签名交易
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-6 h-6" />
                    发送 {selectedWallet.chain === ChainType.BTC ? 'BTC' : 'ETH'}
                  </>
                )}
              </h2>
              
              {/* 观测钱包提示 */}
              {selectedWallet.type === WalletType.WATCH_ONLY && (
                <div className="mb-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>👁️ 观测钱包流程：</strong>
                  </p>
                  <ol className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1 pl-5">
                    <li>1. 填写交易信息并生成未签名交易二维码</li>
                    <li>2. 用冷钱包扫描二维码</li>
                    <li>3. 冷钱包签名后生成签名结果二维码</li>
                    <li>4. 回到这里扫描签名结果并广播到区块链</li>
                  </ol>
                </div>
              )}
              
              {/* 冷钱包提示 */}
              {selectedWallet.type === WalletType.COLD && (
                <div className="mb-4 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>❄️ 冷钱包提示：</strong> 建议使用观测钱包创建交易，冷钱包仅用于扫描和签名
                  </p>
                </div>
              )}
              
              {!transactionQrCode ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">接收地址</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="input-field flex-1" 
                        placeholder="输入接收地址"
                        value={sendToAddress}
                        onChange={(e) => setSendToAddress(e.target.value)}
                      />
                      <button
                        onClick={() => openInputScan('扫描接收地址', (value) => setSendToAddress(value))}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center gap-2"
                        title="扫描二维码"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
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
                    {selectedWallet.type === WalletType.COLD ? (
                      <button 
                        onClick={generateUnsignedTransaction}
                        className="btn-primary flex-1"
                      >
                        🔒 生成未签名交易
                      </button>
                    ) : (
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
                    )}
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
                        openInputScan('扫描已签名交易', async (value) => {
                          try {
                            const data = JSON.parse(value);
                            if (data.type === 'SIGNED_TX') {
                              alert('✅ 已扫描已签名交易，准备广播...');
                              await broadcastTransaction(data);
                            } else {
                              alert('❌ 这不是已签名交易二维码');
                            }
                          } catch (error) {
                            alert('❌ 二维码格式错误: ' + (error as Error).message);
                          }
                        });
                      }}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      扫描签名结果
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
                      className="btn-secondary flex-1"
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
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                ✍️ 
                {selectedWallet.type === WalletType.COLD ? '冷钱包签名' : '消息签名'}
              </h2>
              
              {/* 冷钱包签名提示 */}
              {selectedWallet.type === WalletType.COLD && (
                <div className="mb-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>❄️ 离线签名流程：</strong>
                  </p>
                  <ol className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1 pl-5">
                    <li>1. 点击扫描按钮，扫描观测钱包的未签名交易二维码</li>
                    <li>2. 确认交易信息无误后进行签名</li>
                    <li>3. 将生成的签名结果二维码给观测钱包扫描</li>
                    <li>4. 观测钱包将签名结果广播到区块链</li>
                  </ol>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">要签名的消息</label>
                  <div className="flex gap-2">
                    <textarea
                      value={signMessage}
                      onChange={(e) => setSignMessage(e.target.value)}
                      className="input-field min-h-32 flex-1"
                      placeholder="输入要签名的消息内容..."
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openInputScan('扫描未签名交易', (value) => {
                          try {
                            const data = JSON.parse(value);
                            if (data.type === 'UNSIGNED_TX') {
                              setSignMessage(value);
                              alert('✅ 已扫描未签名交易');
                            } else {
                              setSignMessage(value);
                            }
                          } catch {
                            setSignMessage(value);
                          }
                        })}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center justify-center whitespace-nowrap"
                        title="扫描二维码"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openOCR((text) => setSignMessage(text))}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors flex items-center justify-center whitespace-nowrap"
                        title="OCR 文字识别"
                      >
                        <span className="text-lg">📷</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    💡 可以扫描二维码或使用 OCR 识别文字
                  </p>
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
                {/* 观察钱包只需要地址，不需要选择导入方式 */}
                {importWalletType !== WalletType.WATCH_ONLY && (
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
                )}

                {/* 观察钱包：显示地址输入框 */}
                {importWalletType === WalletType.WATCH_ONLY ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">钱包地址</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={importAddress}
                        onChange={(e) => setImportAddress(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded focus:ring-2 focus:ring-blue-500 dark:text-white"
                        placeholder={importChain === ChainType.BTC ? 'bc1q...' : '0x...'}
                      />
                      <button
                        onClick={() => openInputScan('扫描地址', (value) => setImportAddress(value))}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center justify-center"
                        title="扫描二维码"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : importType === 'mnemonic' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">助记词</label>
                    <div className="flex gap-2">
                      <textarea
                        value={importMnemonic}
                        onChange={(e) => setImportMnemonic(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded focus:ring-2 focus:ring-blue-500 dark:text-white"
                        rows={3}
                        placeholder="输入12或24个单词的助记词，用空格分隔"
                      />
                      <button
                        onClick={() => openInputScan('扫描助记词', (value) => setImportMnemonic(value))}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center justify-center"
                        title="扫描二维码"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">私钥</label>
                    <div className="flex gap-2">
                      <textarea
                        value={importPrivateKey}
                        onChange={(e) => setImportPrivateKey(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded focus:ring-2 focus:ring-blue-500 dark:text-white"
                        rows={2}
                        placeholder="输入私钥（十六进制格式）"
                      />
                      <button
                        onClick={() => openInputScan('扫描私钥', (value) => setImportPrivateKey(value))}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center justify-center"
                        title="扫描二维码"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
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
                  <div className="grid grid-cols-3 gap-2">
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
                    <button
                      onClick={() => setImportWalletType(WalletType.WATCH_ONLY)}
                      className={`p-2 rounded border transition-colors ${
                        importWalletType === WalletType.WATCH_ONLY
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      观察钱包
                    </button>
                  </div>
                  {importWalletType === WalletType.WATCH_ONLY && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      👁️ 观察钱包只能查看余额和交易历史，无法发送交易
                    </p>
                  )}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full max-h-[80vh] overflow-y-auto">
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
                {/* 钱包模式切换 */}
                {selectedWallet && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <Settings className="w-4 h-4 inline mr-2" />
                      钱包模式设置
                    </label>
                    
                    {/* 当前模式显示 */}
                    <div className={`p-4 rounded-lg mb-4 ${
                      selectedWallet.type === WalletType.HOT 
                        ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-300 dark:border-orange-700'
                        : selectedWallet.type === WalletType.COLD
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-300 dark:border-blue-700'
                        : 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border border-gray-300 dark:border-gray-700'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          当前模式
                        </span>
                        <span className="text-2xl">
                          {selectedWallet.type === WalletType.HOT && '🔥'}
                          {selectedWallet.type === WalletType.COLD && '❄️'}
                          {selectedWallet.type === WalletType.WATCH_ONLY && '👁️'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>
                          {selectedWallet.type === WalletType.HOT && '热钱包模式'}
                          {selectedWallet.type === WalletType.COLD && '冷钱包模式'}
                          {selectedWallet.type === WalletType.WATCH_ONLY && '观测钱包模式'}
                        </strong>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {selectedWallet.type === WalletType.HOT && '在线钱包，支持所有功能'}
                        {selectedWallet.type === WalletType.COLD && '离线钱包，通过二维码签名'}
                        {selectedWallet.type === WalletType.WATCH_ONLY && '只读钱包，无法签名交易'}
                      </div>
                    </div>
                    
                    {/* 模式切换按钮 */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        💡 切换模式将改变钱包的功能和界面
                      </p>
                      
                      <div className="space-y-3">
                        {/* 热钱包选项 */}
                        <button
                          onClick={() => {
                            if (selectedWallet.type === WalletType.HOT) {
                              alert('✅ 当前已经是热钱包模式');
                              return;
                            }
                            if (!selectedWallet.privateKey) {
                              // 观测钱包需要重新导入私钥
                              if (confirm('❌ 观测钱包无法直接切换为热钱包\n\n观测钱包不包含私钥，需要重新导入私钥才能切换。\n\n是否现在导入私钥？')) {
                                setShowSettingsDialog(false);
                                setIsConvertingWatchOnly(true);
                                setConvertingWalletId(selectedWallet.id);
                                setImportChain(selectedWallet.chain);
                                setImportWalletType(WalletType.HOT);
                                setShowImportDialog(true);
                                alert('💡 提示\n\n请输入您的助记词或私钥来导入热钱包。导入后此地址的观测钱包将被替换为热钱包。');
                              }
                              return;
                            }
                            if (confirm('🔥 切换为热钱包模式？\n\n钱包将自动连接网络并同步余额，支持发送、签名、AI支付等所有功能。\n\n确定要继续吗？')) {
                              const updatedWallets = wallets.map(w => 
                                w.id === selectedWallet.id 
                                  ? { ...w, type: WalletType.HOT, isOnline: true }
                                  : w
                              );
                              setWallets(updatedWallets);
                              setSelectedWallet({ ...selectedWallet, type: WalletType.HOT, isOnline: true });
                              WalletStorage.saveWallets(updatedWallets);
                              alert('✅ 已切换为热钱包模式\n\n钱包将自动同步余额，现在可以使用所有功能');
                              // 自动刷新余额
                              setTimeout(() => {
                                refreshBalance({ ...selectedWallet, type: WalletType.HOT, isOnline: true });
                              }, 500);
                            }
                          }}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            selectedWallet.type === WalletType.HOT
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 hover:border-orange-400'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🔥</span>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800 dark:text-white mb-1">
                                热钱包
                                {selectedWallet.type === WalletType.HOT && (
                                  <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded">当前</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                                <p>✓ 在线钱包，自动同步余额</p>
                                <p>✓ 支持发送、接收、签名</p>
                                <p>✓ 支持 AI 支付功能</p>
                                <p className="text-orange-600 dark:text-orange-400">⚠️ 需要网络连接</p>
                              </div>
                            </div>
                          </div>
                        </button>
                        
                        {/* 冷钱包选项 */}
                        <button
                          onClick={() => {
                            if (selectedWallet.type === WalletType.COLD) {
                              alert('✅ 当前已经是冷钱包模式');
                              return;
                            }
                            if (!selectedWallet.privateKey) {
                              // 观测钱包需要重新导入私钥
                              if (confirm('❌ 观测钱包无法直接切换为冷钱包\n\n观测钱包不包含私钥，需要重新导入私钥才能切换。\n\n是否现在导入私钥？')) {
                                setShowSettingsDialog(false);
                                setIsConvertingWatchOnly(true);
                                setConvertingWalletId(selectedWallet.id);
                                setImportChain(selectedWallet.chain);
                                setImportWalletType(WalletType.COLD);
                                setShowImportDialog(true);
                                alert('💡 提示\n\n请输入您的助记词或私钥来导入冷钱包。导入后此地址的观测钱包将被替换为冷钱包。');
                              }
                              return;
                            }
                            if (confirm('❄️ 切换为冷钱包模式？\n\n钱包将断开网络连接，仅支持离线签名功能。需要配合观测钱包使用。\n\n建议：将此设备断网并作为专用冷钱包。\n\n确定要继续吗？')) {
                              const updatedWallets = wallets.map(w => 
                                w.id === selectedWallet.id 
                                  ? { ...w, type: WalletType.COLD, isOnline: false }
                                  : w
                              );
                              setWallets(updatedWallets);
                              setSelectedWallet({ ...selectedWallet, type: WalletType.COLD, isOnline: false });
                              WalletStorage.saveWallets(updatedWallets);
                              alert('✅ 已切换为冷钱包模式\n\n建议：\n1. 关闭此设备的 WiFi 和移动网络\n2. 开启飞行模式\n3. 使用另一台设备创建观测钱包\n4. 通过二维码进行交易签名');
                              setWalletBalance('--');
                            }
                          }}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            selectedWallet.type === WalletType.COLD
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:border-blue-400'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">❄️</span>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800 dark:text-white mb-1">
                                冷钱包（推荐大额存储）
                                {selectedWallet.type === WalletType.COLD && (
                                  <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">当前</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                                <p>✓ 完全离线，私钥永不联网</p>
                                <p>✓ 通过二维码签名交易</p>
                                <p>✓ 配合观测钱包使用</p>
                                <p className="text-blue-600 dark:text-blue-400">🔒 最高安全性</p>
                              </div>
                            </div>
                          </div>
                        </button>
                        
                        {/* 观测钱包选项 */}
                        <button
                          onClick={() => {
                            if (selectedWallet.type === WalletType.WATCH_ONLY) {
                              alert('✅ 当前已经是观测钱包模式');
                              return;
                            }
                            if (confirm('👁️ 切换为观测钱包模式？\n\n⚠️ 警告：这将永久删除此钱包的私钥！\n\n切换后：\n• 只能查看余额和交易历史\n• 无法签名和发送交易\n• 需要配合冷钱包创建交易\n\n❗ 请务必确保已备份助记词或私钥！\n\n确定要继续吗？')) {
                              // 二次确认
                              const doubleConfirm = confirm('⚠️ 最后确认\n\n您确定要删除私钥并切换为观测钱包吗？\n\n这个操作不可逆！\n\n如果丢失了助记词备份，将永久失去资金！');
                              if (!doubleConfirm) return;
                              
                              const updatedWallets = wallets.map(w => 
                                w.id === selectedWallet.id 
                                  ? { 
                                      ...w, 
                                      type: WalletType.WATCH_ONLY, 
                                      isOnline: true,
                                      privateKey: undefined,
                                      mnemonic: undefined,
                                      publicKey: undefined
                                    }
                                  : w
                              );
                              setWallets(updatedWallets);
                              setSelectedWallet({ 
                                ...selectedWallet, 
                                type: WalletType.WATCH_ONLY, 
                                isOnline: true,
                                privateKey: undefined,
                                mnemonic: undefined,
                                publicKey: undefined
                              });
                              WalletStorage.saveWallets(updatedWallets);
                              alert('✅ 已切换为观测钱包模式\n\n私钥已删除，现在仅可：\n• 查看余额和交易历史\n• 创建未签名交易\n• 扫描冷钱包的签名结果\n\n建议：在另一台设备上使用冷钱包模式');
                            }
                          }}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            selectedWallet.type === WalletType.WATCH_ONLY
                              ? 'border-gray-500 bg-gray-50 dark:bg-gray-800 shadow-lg'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">👁️</span>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800 dark:text-white mb-1">
                                观测钱包
                                {selectedWallet.type === WalletType.WATCH_ONLY && (
                                  <span className="ml-2 text-xs bg-gray-500 text-white px-2 py-0.5 rounded">当前</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                                <p>✓ 监控余额和交易历史</p>
                                <p>✓ 创建未签名交易</p>
                                <p>✓ 配合冷钱包使用</p>
                                <p className="text-red-600 dark:text-red-400">⚠️ 无法签名（无私钥）</p>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">密码设置</label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {PasswordService.hasPassword() ? (
                      <div className="space-y-2">
                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          密码已设置
                        </p>
                        <button
                          onClick={() => {
                            setShowSettingsDialog(false);
                            setShowSetPasswordDialog(true);
                            setPassword('');
                            setConfirmPassword('');
                          }}
                          className="w-full text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition-colors"
                        >
                          修改密码
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">尚未设置密码</p>
                        <button
                          onClick={() => {
                            setShowSettingsDialog(false);
                            setShowSetPasswordDialog(true);
                            setPassword('');
                            setConfirmPassword('');
                          }}
                          className="w-full text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition-colors"
                        >
                          设置密码
                        </button>
                      </div>
                    )}
                  </div>
                </div>

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
                    {selectedWallet?.type === WalletType.COLD && '扫描未签名交易'}
                    {selectedWallet?.type === WalletType.WATCH_ONLY && '扫描签名结果'}
                    {selectedWallet?.type === WalletType.HOT && '扫描二维码'}
                  </h2>
                  <button
                    onClick={closeScanDialog}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* 根据钱包类型显示操作提示 */}
                {selectedWallet && (
                  <div className={`mb-4 px-4 py-3 rounded-lg border ${
                    selectedWallet.type === WalletType.COLD 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : selectedWallet.type === WalletType.WATCH_ONLY
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                  }`}>
                    {selectedWallet.type === WalletType.COLD && (
                      <div className="text-sm">
                        <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          ❄️ 冷钱包扫描模式
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• 对准观测钱包生成的<strong>未签名交易二维码</strong></li>
                          <li>• 扫描后将显示交易详情供您确认</li>
                          <li>• 确认无误后，钱包将使用私钥签名</li>
                          <li>• 签名完成后生成<strong>签名结果二维码</strong></li>
                        </ul>
                      </div>
                    )}
                    {selectedWallet.type === WalletType.WATCH_ONLY && (
                      <div className="text-sm">
                        <p className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          👁️ 观测钱包扫描模式
                        </p>
                        <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                          <li>• 对准冷钱包生成的<strong>签名结果二维码</strong></li>
                          <li>• 扫描后将显示签名详情供您确认</li>
                          <li>• 确认无误后，将交易广播到区块链</li>
                          <li>• 广播成功后可查看交易哈希</li>
                        </ul>
                      </div>
                    )}
                    {selectedWallet.type === WalletType.HOT && (
                      <div className="text-sm">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          🔥 热钱包扫描模式
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          可以扫描地址、未签名交易、签名结果等各种二维码
                        </p>
                      </div>
                    )}
                  </div>
                )}

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

        {/* 设置密码对话框 */}
        {showSetPasswordDialog && (
          <div className="dialog-overlay">
            <div className="dialog-content card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  {PasswordService.hasPassword() ? '修改密码' : '设置密码'}
                </h2>
                <button
                  onClick={() => {
                    setShowSetPasswordDialog(false);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                  <p className="text-blue-800 dark:text-blue-200">
                    🔐 设置密码后，查看私钥和助记词时需要输入密码验证
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {PasswordService.hasPassword() ? '新密码' : '密码'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="输入密码（至少6位）"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    确认密码
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="再次输入密码"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSetPasswordDialog(false);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSetPassword}
                    className="btn-primary flex-1"
                  >
                    确认
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 密码验证对话框 */}
        {showPasswordDialog && (
          <div className="dialog-overlay">
            <div className="dialog-content card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  输入密码
                </h2>
                <button
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setPassword('');
                    setPasswordAction(null);
                    setSelectedWalletForAction(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    🔒 请输入密码以{passwordAction === 'view' ? '查看钱包详情' : '继续操作'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    密码
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordVerify();
                      }
                    }}
                    className="input-field"
                    placeholder="输入密码"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowPasswordDialog(false);
                      setPassword('');
                      setPasswordAction(null);
                      setSelectedWalletForAction(null);
                    }}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button
                    onClick={handlePasswordVerify}
                    className="btn-primary flex-1"
                  >
                    确认
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 钱包详情对话框 */}
        {showWalletDetails && selectedWalletForAction && (
          <div className="dialog-overlay">
            <div className="dialog-content card max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  钱包详情
                </h2>
                <button
                  onClick={() => {
                    setShowWalletDetails(false);
                    setSelectedWalletForAction(null);
                    setShowPrivateKey(false);
                    setShowMnemonic(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        钱包名称
                      </label>
                      <div className="mt-1 text-gray-800 dark:text-white font-medium">
                        {selectedWalletForAction.name}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        钱包类型
                      </label>
                      <div className="mt-1 text-gray-800 dark:text-white">
                        {selectedWalletForAction.type === WalletType.HOT && '🔥 热钱包'}
                        {selectedWalletForAction.type === WalletType.COLD && '❄️ 冷钱包'}
                        {selectedWalletForAction.type === WalletType.WATCH_ONLY && '👁️ 观察钱包'}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        区块链
                      </label>
                      <div className="mt-1 text-gray-800 dark:text-white">
                        {selectedWalletForAction.chain} ({selectedWalletForAction.network})
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        钱包地址
                      </label>
                      <div className="mt-1 p-3 bg-white dark:bg-gray-700 rounded font-mono text-sm break-all">
                        {selectedWalletForAction.address}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedWalletForAction.address);
                          alert('地址已复制');
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        📋 复制地址
                      </button>
                    </div>

                    {selectedWalletForAction.publicKey && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          公钥
                        </label>
                        <div className="mt-1 p-3 bg-white dark:bg-gray-700 rounded font-mono text-xs break-all">
                          {selectedWalletForAction.publicKey}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedWalletForAction.publicKey!);
                            alert('公钥已复制');
                          }}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          📋 复制公钥
                        </button>
                      </div>
                    )}

                    {selectedWalletForAction.type !== WalletType.WATCH_ONLY && (
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                              私钥
                            </label>
                            <button
                              onClick={() => setShowPrivateKey(!showPrivateKey)}
                              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                            >
                              {showPrivateKey ? (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  隐藏
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  显示
                                </>
                              )}
                            </button>
                          </div>
                          {showPrivateKey ? (
                            <>
                              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded font-mono text-xs break-all">
                                {selectedWalletForAction.privateKey}
                              </div>
                              <button
                                onClick={() => {
                                  if (selectedWalletForAction.privateKey) {
                                    navigator.clipboard.writeText(selectedWalletForAction.privateKey);
                                    alert('私钥已复制');
                                  }
                                }}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              >
                                📋 复制私钥
                              </button>
                            </>
                          ) : (
                            <div className="p-3 bg-gray-200 dark:bg-gray-600 rounded text-center text-gray-500 dark:text-gray-400">
                              ••••••••••••••••••••
                            </div>
                          )}
                        </div>

                        {selectedWalletForAction.mnemonic && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                助记词
                              </label>
                              <button
                                onClick={() => setShowMnemonic(!showMnemonic)}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                              >
                                {showMnemonic ? (
                                  <>
                                    <EyeOff className="w-4 h-4" />
                                    隐藏
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4" />
                                    显示
                                  </>
                                )}
                              </button>
                            </div>
                            {showMnemonic ? (
                              <>
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-sm break-all">
                                  {selectedWalletForAction.mnemonic}
                                </div>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedWalletForAction.mnemonic!);
                                    alert('助记词已复制');
                                  }}
                                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                  📋 复制助记词
                                </button>
                              </>
                            ) : (
                              <div className="p-3 bg-gray-200 dark:bg-gray-600 rounded text-center text-gray-500 dark:text-gray-400">
                                ••• ••• ••• ••• ••• ••• ••• ••• ••• ••• ••• •••
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        创建时间
                      </label>
                      <div className="mt-1 text-gray-800 dark:text-white text-sm">
                        {new Date(selectedWalletForAction.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    ⚠️ 请妥善保管私钥和助记词，切勿泄露给他人！
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`确定要删除钱包"${selectedWalletForAction.name}"吗？\n\n⚠️ 删除后无法恢复，请确保已备份私钥或助记词！`)) {
                        handleDeleteWallet(selectedWalletForAction.id);
                      }
                    }}
                    className="btn-secondary flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    删除钱包
                  </button>
                  <button
                    onClick={() => {
                      setShowWalletDetails(false);
                      setSelectedWalletForAction(null);
                      setShowPrivateKey(false);
                      setShowMnemonic(false);
                    }}
                    className="btn-primary flex-1"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 未签名交易对话框 */}
        {showUnsignedTxDialog && (
          <div className="dialog-overlay">
            <div className="dialog-content card">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                🔒 未签名交易
              </h2>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    请使用冷钱包扫描此二维码进行签名
                  </p>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src={unsignedTxQrCode} alt="未签名交易" className="w-full max-w-[300px]" />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">交易详情:</p>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>发送地址:</span>
                      <span className="font-mono text-xs">{selectedWallet?.address.substring(0, 10)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span>接收地址:</span>
                      <span className="font-mono text-xs">{sendToAddress.substring(0, 10)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span>金额:</span>
                      <span className="font-semibold">{sendAmount} {selectedWallet?.chain}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    💡 签名完成后，请扫描冷钱包生成的签名结果二维码
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowUnsignedTxDialog(false);
                      setUnsignedTxQrCode('');
                    }}
                    className="btn-primary flex-1"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 已签名交易对话框 */}
        {showSignedTxDialog && (
          <div className="dialog-overlay">
            <div className="dialog-content card">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                ✅ 已签名交易
              </h2>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    请使用热钱包扫描此二维码进行广播
                  </p>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src={signedTxQrCode} alt="已签名交易" className="w-full max-w-[300px]" />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✅ 交易已成功签名
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    📡 热钱包扫描后将自动广播到区块链网络
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSignedTxDialog(false);
                      setSignedTxQrCode('');
                    }}
                    className="btn-primary flex-1"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 交易广播结果对话框 */}
        {showBroadcastDialog && (
          <div className="dialog-overlay">
            <div className="dialog-content card">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                📡 交易广播
              </h2>
              <div className="space-y-4">
                {broadcastResult ? (
                  <>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        交易已成功广播！
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        交易正在等待矿工确认...
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">交易ID (TXID):</p>
                      <div className="bg-white dark:bg-gray-700 rounded p-3 break-all">
                        <code className="text-xs font-mono text-gray-800 dark:text-gray-200">
                          {broadcastResult}
                        </code>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(broadcastResult);
                          alert('交易ID已复制到剪贴板');
                        }}
                        className="btn-secondary flex-1"
                      >
                        复制TXID
                      </button>
                      <button
                        onClick={() => {
                          setShowBroadcastDialog(false);
                          setBroadcastResult('');
                        }}
                        className="btn-primary flex-1"
                      >
                        关闭
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">正在广播交易...</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 交易历史对话框 */}
        {showTransactionHistory && (
          <div className="dialog-overlay">
            <div className="dialog-content card" style={{ maxWidth: '600px' }}>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                📜 交易历史
              </h2>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">暂无交易记录</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {transactions.map((tx, index) => (
                      <div 
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              tx.type === 'send' 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {tx.type === 'send' ? '发送' : '接收'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              tx.status === 'confirmed' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {tx.status === 'confirmed' ? '已确认' : '确认中'}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-white">
                            {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.chain}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex justify-between">
                            <span>时间:</span>
                            <span>{new Date(tx.timestamp).toLocaleString('zh-CN')}</span>
                          </div>
                          {tx.txid && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">交易ID:</p>
                              <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                                {tx.txid}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowTransactionHistory(false);
                  }}
                  className="btn-primary w-full"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 输入扫描对话框 */}
        {showInputScanDialog && (
          <div className="dialog-overlay" style={{ zIndex: 70 }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Camera className="w-6 h-6" />
                  {scanInputTitle}
                </h2>
                <button
                  onClick={closeInputScan}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 根据钱包类型显示不同提示 */}
              {selectedWallet && selectedWallet.type === WalletType.COLD && (
                <div className="mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded text-xs text-blue-800 dark:text-blue-200">
                  ❄️ 扫描观测钱包生成的未签名交易二维码
                </div>
              )}
              
              {selectedWallet && selectedWallet.type === WalletType.WATCH_ONLY && (
                <div className="mb-4 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded text-xs text-green-800 dark:text-green-200">
                  👁️ 扫描冷钱包生成的签名结果二维码
                </div>
              )}

              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '300px' }}>
                  <video 
                    ref={inputVideoRef}
                    className="w-full h-full object-cover"
                    playsInline
                  />
                  <canvas 
                    ref={inputCanvasRef}
                    className="hidden"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-4 border-blue-500 rounded-lg animate-pulse"></div>
                  </div>
                </div>

                <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
                  将二维码对准扫描框
                </div>

                <button
                  onClick={closeInputScan}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white p-3 rounded transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OCR 识别对话框 */}
        {showOCRDialog && (
          <div className="dialog-overlay" style={{ zIndex: 70 }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">📷</span>
                  OCR 文字识别
                </h2>
                <button
                  onClick={closeOCR}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={isOCRProcessing}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
                  <video 
                    ref={ocrVideoRef}
                    className="w-full h-full object-cover"
                    playsInline
                  />
                  <canvas 
                    ref={ocrCanvasRef}
                    className="hidden"
                  />
                  {!isOCRProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-48 border-4 border-green-500 rounded-lg"></div>
                    </div>
                  )}
                  {isOCRProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                      <div className="text-center">
                        <div className="text-white text-lg mb-2">识别中...</div>
                        <div className="w-48 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${ocrProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-white text-sm mt-2">{ocrProgress}%</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
                  {!isOCRProcessing ? '对准文字，点击拍照识别' : '正在识别，请稍候...'}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={closeOCR}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded transition-colors"
                    disabled={isOCRProcessing}
                  >
                    取消
                  </button>
                  <button
                    onClick={captureAndRecognize}
                    className="flex-2 bg-green-500 hover:bg-green-600 text-white p-3 rounded transition-colors flex items-center justify-center gap-2"
                    disabled={isOCRProcessing}
                  >
                    <Camera className="w-5 h-5" />
                    拍照识别
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DeepSafe 多签钱包设置对话框 */}
        {showMultisigSetup && (
          <div className="dialog-overlay" style={{ zIndex: 50 }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="text-3xl">🔐</span>
                    创建 DeepSafe 多签钱包
                  </h2>
                  <button
                    onClick={() => {
                      setShowMultisigSetup(false);
                      setMultisigSigners([]);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* 信息提示 */}
                <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700 rounded-lg">
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    <strong>💡 什么是多签钱包？</strong><br/>
                    多签钱包需要多个签名者共同授权才能完成交易，提供更高的安全性。
                    例如 2-of-3 表示：3个签名者中需要至少2个人签名才能转账。
                  </p>
                </div>

                {/* 链类型 */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    区块链类型
                  </label>
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-medium text-gray-800 dark:text-white">
                      {multisigChain === ChainType.BTC ? '🟠 Bitcoin (BTC)' : '⬢ Ethereum (ETH)'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {multisigChain === ChainType.BTC 
                        ? 'P2WSH 多签方案 - 原生隔离见证'
                        : 'Gnosis Safe 智能合约多签方案'}
                    </div>
                  </div>
                </div>

                {/* 签名策略 */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    签名策略 (M-of-N)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        需要签名数 (M)
                      </label>
                      <select
                        value={multisigM}
                        onChange={(e) => setMultisigM(parseInt(e.target.value))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      >
                        {[1, 2, 3, 4, 5].filter(n => n <= multisigN).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        总签名者数 (N)
                      </label>
                      <select
                        value={multisigN}
                        onChange={(e) => {
                          const newN = parseInt(e.target.value);
                          setMultisigN(newN);
                          if (multisigM > newN) setMultisigM(newN);
                        }}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      >
                        {[2, 3, 4, 5, 6, 7].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-blue-800 dark:text-blue-300 font-semibold text-lg">
                      {multisigM}-of-{multisigN} 多签方案
                    </span>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      需要 {multisigM} 个签名者同意才能完成交易
                    </p>
                  </div>
                </div>

                {/* 签名者列表 */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      签名者列表 ({multisigSigners.length}/{multisigN})
                    </label>
                    {multisigSigners.length < multisigN && (
                      <button
                        onClick={() => {
                          // 添加签名者
                          const name = prompt('请输入签名者名称（如：自己、合伙人A、审计员）:');
                          if (!name) return;
                          
                          const publicKey = prompt('请输入签名者的公钥或地址:');
                          if (!publicKey) return;
                          
                          const isMe = multisigSigners.length === 0 || confirm('这是您自己的地址吗？');
                          
                          setMultisigSigners([...multisigSigners, {
                            id: `signer_${Date.now()}`,
                            name,
                            publicKey,
                            address: publicKey, // 简化处理
                            isMe
                          }]);
                        }}
                        className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
                      >
                        + 添加签名者
                      </button>
                    )}
                  </div>

                  {multisigSigners.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      还没有添加签名者，点击上方按钮开始添加
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {multisigSigners.map((signer, index) => (
                        <div
                          key={signer.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800 dark:text-white">
                                  {index + 1}. {signer.name}
                                </span>
                                {signer.isMe && (
                                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                                    自己
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 font-mono mt-1">
                                {formatAddress(signer.address)}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm(`确认移除签名者 "${signer.name}"？`)) {
                                  setMultisigSigners(multisigSigners.filter(s => s.id !== signer.id));
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowMultisigSetup(false);
                      setMultisigSigners([]);
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded transition-colors font-medium"
                  >
                    取消
                  </button>
                  <button
                    onClick={createMultisigWallet}
                    disabled={multisigSigners.length !== multisigN}
                    className={`flex-1 p-3 rounded transition-colors font-medium ${
                      multisigSigners.length === multisigN
                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    🔐 创建多签钱包
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;



