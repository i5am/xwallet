const hre = require("hardhat");

async function main() {
  // 从部署文件读取合约地址
  const fs = require('fs');
  const path = require('path');
  const deploymentFile = path.join(__dirname, '../deployments', `${hre.network.name}-node-registry.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ 未找到部署文件，请先部署合约: npx hardhat run scripts/deploy-node-registry.js");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const registryAddress = deployment.contracts.CRVANodeRegistry;

  console.log("🔗 连接到节点注册合约:", registryAddress);
  console.log("网络:", hre.network.name);
  console.log("");

  // 获取账户
  const [account1, account2, account3] = await hre.ethers.getSigners();
  
  // 连接合约
  const CRVANodeRegistry = await hre.ethers.getContractFactory("CRVANodeRegistry");
  const registry = CRVANodeRegistry.attach(registryAddress);

  // 注册节点配置
  const nodesToRegister = [
    {
      account: account1,
      endpoint: "ws://localhost:3001",
      publicKey: hre.ethers.id("node1_public_key"),
      stake: hre.ethers.parseEther("0.1")
    },
    {
      account: account2,
      endpoint: "ws://localhost:3002",
      publicKey: hre.ethers.id("node2_public_key"),
      stake: hre.ethers.parseEther("0.15")
    },
    {
      account: account3,
      endpoint: "ws://localhost:3003",
      publicKey: hre.ethers.id("node3_public_key"),
      stake: hre.ethers.parseEther("0.2")
    }
  ];

  console.log("📝 准备注册", nodesToRegister.length, "个测试节点...\n");

  // 注册节点
  for (let i = 0; i < nodesToRegister.length; i++) {
    const node = nodesToRegister[i];
    
    try {
      console.log(`[${i + 1}/${nodesToRegister.length}] 注册节点...`);
      console.log("  账户:", node.account.address);
      console.log("  端点:", node.endpoint);
      console.log("  质押:", hre.ethers.formatEther(node.stake), "ETH");
      
      const tx = await registry.connect(node.account).registerNode(
        node.endpoint,
        node.publicKey,
        { value: node.stake }
      );
      
      console.log("  交易哈希:", tx.hash);
      await tx.wait();
      console.log("  ✅ 注册成功\n");
      
    } catch (error) {
      console.error("  ❌ 注册失败:", error.message, "\n");
    }
  }

  // 查询已注册节点
  console.log("=".repeat(60));
  console.log("📊 查询已注册节点信息");
  console.log("=".repeat(60) + "\n");

  const nodeCount = await registry.getNodeCount();
  const activeNodeCount = await registry.getActiveNodeCount();
  
  console.log("总节点数:", nodeCount.toString());
  console.log("活跃节点数:", activeNodeCount.toString());
  console.log("");

  // 获取所有活跃节点
  const activeNodes = await registry.getActiveNodes();
  
  console.log("活跃节点列表:");
  console.log("-".repeat(60));
  
  for (let i = 0; i < activeNodes.length; i++) {
    const node = activeNodes[i];
    console.log(`\n节点 #${i + 1}:`);
    console.log("  所有者:", node.owner);
    console.log("  端点:", node.endpoint);
    console.log("  质押:", hre.ethers.formatEther(node.stake), "ETH");
    console.log("  声誉:", node.reputation.toString());
    console.log("  注册时间:", new Date(Number(node.registeredAt) * 1000).toLocaleString());
    console.log("  最后心跳:", new Date(Number(node.lastHeartbeat) * 1000).toLocaleString());
    console.log("  状态:", node.active ? "✅ 活跃" : "❌ 停用");
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 节点注册完成！");
  console.log("=".repeat(60));
  console.log("\n现在可以:");
  console.log("1. 在钱包应用中查看已注册节点");
  console.log("2. 使用 CRVA 验证功能");
  console.log("3. 运行 heartbeat: npx hardhat run scripts/heartbeat.js --network localhost");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
