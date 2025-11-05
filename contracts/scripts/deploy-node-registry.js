const hre = require("hardhat");

async function main() {
  console.log("🚀 开始部署 CRVA 节点注册合约...\n");

  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 部署合约
  console.log("正在部署 CRVANodeRegistry 合约...");
  const CRVANodeRegistry = await hre.ethers.getContractFactory("CRVANodeRegistry");
  const registry = await CRVANodeRegistry.deploy();
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("✅ CRVANodeRegistry 部署成功!");
  console.log("合约地址:", registryAddress);

  // 验证合约部署
  console.log("\n验证合约状态...");
  const minStake = await registry.MIN_STAKE();
  const owner = await registry.owner();
  const nodeCount = await registry.getNodeCount();
  
  console.log("最小质押:", hre.ethers.formatEther(minStake), "ETH");
  console.log("合约所有者:", owner);
  console.log("已注册节点数:", nodeCount.toString());

  // 保存合约地址到文件
  const fs = require('fs');
  const path = require('path');
  
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      CRVANodeRegistry: registryAddress
    },
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const deploymentPath = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  const filename = `${hre.network.name}-node-registry.json`;
  fs.writeFileSync(
    path.join(deploymentPath, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 部署信息已保存到:", filename);

  // 更新环境变量文件
  const envPath = path.join(__dirname, '../.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // 添加或更新节点注册合约地址
  if (envContent.includes('VITE_NODE_REGISTRY_ADDRESS=')) {
    envContent = envContent.replace(
      /VITE_NODE_REGISTRY_ADDRESS=.*/,
      `VITE_NODE_REGISTRY_ADDRESS=${registryAddress}`
    );
  } else {
    envContent += `\n# CRVA 节点注册合约\nVITE_NODE_REGISTRY_ADDRESS=${registryAddress}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("✅ 已更新 .env.local 文件");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 部署完成！");
  console.log("=".repeat(60));
  console.log("\n下一步:");
  console.log("1. 启动本地 Hardhat 节点: npx hardhat node");
  console.log("2. 启动 CRVA 后端服务: cd server && npm start");
  console.log("3. 注册第一个节点: npx hardhat run scripts/register-node.js --network localhost");
  console.log("\n合约地址:", registryAddress);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
