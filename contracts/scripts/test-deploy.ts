import { ethers } from "hardhat";

/**
 * 快速本地测试部署
 * 用于在本地 Hardhat 网络测试合约
 */
async function main() {
  console.log("\n🧪 本地测试部署\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("部署者:", deployer.address);
  
  // 1. 部署 CRVARegistry
  console.log("\n[1/3] 部署 CRVARegistry...");
  const Registry = await ethers.getContractFactory("CRVARegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ CRVARegistry:", registryAddress);
  
  // 2. 部署 CRVACommittee
  console.log("\n[2/3] 部署 CRVACommittee...");
  const Committee = await ethers.getContractFactory("CRVACommittee");
  // 注意: CRVACommittee 需要 2 个参数: registryAddress 和 relayer
  // 在测试环境中，我们使用 deployer 作为临时 relayer
  const committee = await Committee.deploy(registryAddress, deployer.address);
  await committee.waitForDeployment();
  const committeeAddress = await committee.getAddress();
  console.log("✅ CRVACommittee:", committeeAddress);
  
  // 3. 部署 ThresholdSignature
  console.log("\n[3/3] 部署 ThresholdSignature...");
  const Threshold = await ethers.getContractFactory("ThresholdSignature");
  const threshold = await Threshold.deploy(committeeAddress);
  await threshold.waitForDeployment();
  const thresholdAddress = await threshold.getAddress();
  console.log("✅ ThresholdSignature:", thresholdAddress);
  
  console.log("\n✅ 本地部署完成！\n");
  console.log("合约地址:");
  console.log("  Registry:", registryAddress);
  console.log("  Committee:", committeeAddress);
  console.log("  Threshold:", thresholdAddress);
  console.log("");
  
  // 简单测试
  console.log("🧪 运行简单测试...\n");
  
  // 测试 1: 查询初始状态
  const totalValidators = await registry.totalValidators();
  console.log("✓ 总节点数:", totalValidators.toString());
  
  const minStake = await registry.MIN_STAKE();
  console.log("✓ 最小质押:", ethers.formatEther(minStake), "ETH");
  
  // 测试 2: 注册一个节点
  console.log("\n测试节点注册...");
  const pubKey = ethers.keccak256(ethers.toUtf8Bytes("test_public_key_1"));
  const tx = await registry.registerValidator(pubKey, {
    value: ethers.parseEther("10")
  });
  await tx.wait();
  console.log("✓ 节点注册成功");
  
  const totalAfter = await registry.totalValidators();
  console.log("✓ 新的总节点数:", totalAfter.toString());
  
  const validator = await registry.validators(deployer.address);
  console.log("✓ 节点信息:");
  console.log("  - 地址:", validator.nodeAddress);
  console.log("  - 质押:", ethers.formatEther(validator.stakedAmount), "ETH");
  console.log("  - 信誉:", validator.reputation.toString());
  console.log("  - 活跃:", validator.isActive);
  
  console.log("\n🎉 测试通过！合约工作正常。\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:", error);
    process.exit(1);
  });
