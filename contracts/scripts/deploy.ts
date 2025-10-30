import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * CRVA 智能合约部署脚本
 * 
 * 部署顺序：
 * 1. CRVARegistry - 节点注册表
 * 2. CRVACommittee - 委员会管理
 * 3. ThresholdSignature - 门限签名
 * 
 * 使用方法：
 * npx hardhat run scripts/deploy.ts --network sepolia
 */

interface DeployedContracts {
  network: string;
  timestamp: string;
  deployer: string;
  contracts: {
    CRVARegistry: {
      address: string;
      txHash: string;
    };
    CRVACommittee: {
      address: string;
      txHash: string;
    };
    ThresholdSignature: {
      address: string;
      txHash: string;
    };
  };
  config: {
    minStake: string;
    lockPeriod: number;
    rotationInterval: number;
  };
}

async function main() {
  console.log("\n🚀 ========================================");
  console.log("   CRVA 智能合约部署");
  console.log("========================================\n");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 部署信息:");
  console.log("   网络:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("   部署者:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("   余额:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.1")) {
    console.error("\n❌ 错误: 账户余额不足！至少需要 0.1 ETH 来部署合约。");
    process.exit(1);
  }
  
  console.log("\n⏳ 开始部署...\n");

  // ============ 1. 部署 CRVARegistry ============
  console.log("📝 [1/3] 部署 CRVARegistry...");
  
  const CRVARegistry = await ethers.getContractFactory("CRVARegistry");
  const registry = await CRVARegistry.deploy();
  await registry.waitForDeployment();
  
  const registryAddress = await registry.getAddress();
  const registryTx = registry.deploymentTransaction();
  
  console.log("   ✅ CRVARegistry 已部署");
  console.log("   📍 地址:", registryAddress);
  console.log("   🔗 交易:", registryTx?.hash);
  
  // 等待几个区块确认
  console.log("   ⏳ 等待区块确认...");
  await registryTx?.wait(3);
  console.log("   ✅ 已确认\n");

  // ============ 2. 部署 CRVACommittee ============
  console.log("📝 [2/3] 部署 CRVACommittee...");
  
  const CRVACommittee = await ethers.getContractFactory("CRVACommittee");
  // 注意: CRVACommittee 需要 2 个参数: registryAddress 和 relayer
  // 在生产环境中，relayer 应该是专门的 relayer 服务地址
  // 这里我们暂时使用 deployer 地址，稍后可以通过合约方法更改
  const committee = await CRVACommittee.deploy(registryAddress, deployer.address);
  await committee.waitForDeployment();
  
  const committeeAddress = await committee.getAddress();
  const committeeTx = committee.deploymentTransaction();
  
  console.log("   ✅ CRVACommittee 已部署");
  console.log("   📍 地址:", committeeAddress);
  console.log("   🔗 交易:", committeeTx?.hash);
  console.log("   ⚠️  注意: Relayer 地址设为:", deployer.address);
  
  console.log("   ⏳ 等待区块确认...");
  await committeeTx?.wait(3);
  console.log("   ✅ 已确认\n");

  // ============ 3. 部署 ThresholdSignature ============
  console.log("📝 [3/3] 部署 ThresholdSignature...");
  
  const ThresholdSignature = await ethers.getContractFactory("ThresholdSignature");
  const threshold = await ThresholdSignature.deploy(committeeAddress);
  await threshold.waitForDeployment();
  
  const thresholdAddress = await threshold.getAddress();
  const thresholdTx = threshold.deploymentTransaction();
  
  console.log("   ✅ ThresholdSignature 已部署");
  console.log("   📍 地址:", thresholdAddress);
  console.log("   🔗 交易:", thresholdTx?.hash);
  
  console.log("   ⏳ 等待区块确认...");
  await thresholdTx?.wait(3);
  console.log("   ✅ 已确认\n");

  // ============ 4. 配置合约关联 ============
  console.log("⚙️  配置合约关联...\n");
  
  // 设置 CRVACommittee 的 Registry 地址
  console.log("   设置 Committee -> Registry 关联...");
  // const setRegistryTx = await committee.setRegistryContract(registryAddress);
  // await setRegistryTx.wait(2);
  console.log("   ✅ 已关联\n");

  // ============ 5. 保存部署信息 ============
  const deploymentInfo: DeployedContracts = {
    network: network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      CRVARegistry: {
        address: registryAddress,
        txHash: registryTx?.hash || "",
      },
      CRVACommittee: {
        address: committeeAddress,
        txHash: committeeTx?.hash || "",
      },
      ThresholdSignature: {
        address: thresholdAddress,
        txHash: thresholdTx?.hash || "",
      },
    },
    config: {
      minStake: "10 ETH",
      lockPeriod: 7 * 24 * 3600, // 7 days
      rotationInterval: 3600, // 1 hour
    },
  };

  // 保存到 JSON 文件
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${network.name}_${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  // 同时保存一份 latest.json
  const latestPath = path.join(deploymentsDir, `${network.name}_latest.json`);
  fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n✅ ========================================");
  console.log("   部署完成！");
  console.log("========================================\n");

  console.log("📋 部署摘要:");
  console.log("   网络:", network.name);
  console.log("   部署者:", deployer.address);
  console.log("");
  console.log("📍 合约地址:");
  console.log("   CRVARegistry:", registryAddress);
  console.log("   CRVACommittee:", committeeAddress);
  console.log("   ThresholdSignature:", thresholdAddress);
  console.log("");
  console.log("💾 部署信息已保存到:");
  console.log("   ", filepath);
  console.log("");

  // 生成环境变量配置
  console.log("📝 环境变量配置（复制到 server/.env）:\n");
  console.log(`CRVA_REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`CRVA_COMMITTEE_ADDRESS=${committeeAddress}`);
  console.log(`CRVA_THRESHOLD_ADDRESS=${thresholdAddress}`);
  console.log(`ETH_RPC_URL=${network.name === "sepolia" ? "https://rpc.sepolia.org" : ""}`);
  console.log(`CHAIN_ID=${network.chainId}`);
  console.log("");

  // 合约验证说明
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("🔍 验证合约（可选）:\n");
    console.log(`npx hardhat verify --network ${network.name} ${registryAddress}`);
    console.log(`npx hardhat verify --network ${network.name} ${committeeAddress} ${registryAddress}`);
    console.log(`npx hardhat verify --network ${network.name} ${thresholdAddress} ${committeeAddress}`);
    console.log("");
  }

  console.log("🎉 部署流程全部完成！\n");
}

// 执行部署
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:", error);
    process.exit(1);
  });
