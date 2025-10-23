import { ChainType, NetworkType, NetworkConfig } from '@/types';

/**
 * BTC 网络配置
 */
export const BTC_MAINNET: NetworkConfig = {
  chain: ChainType.BTC,
  network: NetworkType.MAINNET,
  rpcUrl: 'https://blockstream.info/api',
  explorerUrl: 'https://blockstream.info',
  nativeSymbol: 'BTC',
  nativeName: 'Bitcoin'
};

export const BTC_TESTNET: NetworkConfig = {
  chain: ChainType.BTC,
  network: NetworkType.TESTNET,
  rpcUrl: 'https://blockstream.info/testnet/api',
  explorerUrl: 'https://blockstream.info/testnet',
  nativeSymbol: 'tBTC',
  nativeName: 'Bitcoin Testnet'
};

/**
 * ETH 网络配置
 */
export const ETH_MAINNET: NetworkConfig = {
  chain: ChainType.ETH,
  network: NetworkType.MAINNET,
  rpcUrl: 'https://cloudflare-eth.com',
  explorerUrl: 'https://etherscan.io',
  nativeSymbol: 'ETH',
  nativeName: 'Ethereum'
};

export const ETH_TESTNET: NetworkConfig = {
  chain: ChainType.ETH,
  network: NetworkType.TESTNET,
  rpcUrl: 'https://rpc.sepolia.org',
  explorerUrl: 'https://sepolia.etherscan.io',
  nativeSymbol: 'SepoliaETH',
  nativeName: 'Ethereum Sepolia'
};

/**
 * 获取网络配置
 */
export function getNetworkConfig(chain: ChainType, network: NetworkType): NetworkConfig {
  if (chain === ChainType.BTC) {
    return network === NetworkType.MAINNET ? BTC_MAINNET : BTC_TESTNET;
  } else {
    return network === NetworkType.MAINNET ? ETH_MAINNET : ETH_TESTNET;
  }
}

/**
 * 常用 ERC20 代币配置
 */
export const COMMON_ERC20_TOKENS = [
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logoUrl: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
  }
];
