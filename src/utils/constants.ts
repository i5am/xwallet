/**
 * 常量定义
 */

// 派生路径
export const DERIVATION_PATHS = {
  BTC_TAPROOT: "m/86'/0'/0'/0/0",  // BIP86 Taproot
  BTC_SEGWIT: "m/84'/0'/0'/0/0",   // BIP84 SegWit
  ETH: "m/44'/60'/0'/0/0",          // BIP44 Ethereum
};

// 单位转换
export const SATOSHI_PER_BTC = 100000000;
export const WEI_PER_ETH = BigInt('1000000000000000000');

// 最小值
export const MIN_BTC_AMOUNT = 0.00001; // 1000 satoshi
export const MIN_ETH_AMOUNT = 0.001;   // 0.001 ETH

// Gas 限制
export const GAS_LIMITS = {
  ETH_TRANSFER: 21000,
  ERC20_TRANSFER: 65000,
  CONTRACT_INTERACTION: 200000,
};

// 正则表达式
export const REGEX = {
  BTC_ADDRESS: /^(bc1p[a-zA-HJ-NP-Z0-9]{58}|bc1q[a-zA-HJ-NP-Z0-9]{38,58})$/,
  ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  TX_HASH_BTC: /^[a-fA-F0-9]{64}$/,
  TX_HASH_ETH: /^0x[a-fA-F0-9]{64}$/,
  MNEMONIC_12: /^(\w+\s){11}\w+$/,
  MNEMONIC_24: /^(\w+\s){23}\w+$/,
};
