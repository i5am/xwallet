import { ethers } from "hardhat";

/**
 * 检查部署账户余额
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("\n💰 账户信息检查\n");
  console.log("═══════════════════════════════════════");
  console.log("网络:", network.name);
  console.log("Chain ID:", network.chainId);
  console.log("地址:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  
  console.log("余额:", balanceInEth, "ETH");
  console.log("═══════════════════════════════════════\n");
  
  // 评估余额
  const minRequired = ethers.parseEther("0.1");
  
  if (balance < minRequired) {
    console.log("⚠️  警告: 余额不足！");
    console.log("   需要至少 0.1 ETH 来部署合约");
    console.log("   当前余额:", balanceInEth, "ETH");
    console.log("");
    console.log("📌 获取测试币:");
    console.log("   🔗 https://sepoliafaucet.com/");
    console.log("   🔗 https://www.alchemy.com/faucets/ethereum-sepolia");
    console.log("");
  } else {
    console.log("✅ 余额充足，可以开始部署！");
    console.log("");
    console.log("部署预估消耗:");
    console.log("   CRVARegistry: ~0.01 ETH");
    console.log("   CRVACommittee: ~0.015 ETH");
    console.log("   ThresholdSignature: ~0.02 ETH");
    console.log("   总计: ~0.045 ETH");
    console.log("");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
