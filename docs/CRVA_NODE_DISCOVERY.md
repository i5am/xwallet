# CRVA 节点去中心化发现机制

## 🎯 设计目标

XWallet 的 CRVA 验证节点采用**完全去中心化**的发现机制，避免单点故障和中心化控制。

## 🔍 节点发现方式

### 1. 智能合约（Blockchain）- **推荐，最去中心化**

通过以太坊智能合约注册和发现节点。

**优点**：
- ✅ 完全去中心化
- ✅ 防篡改，可追溯
- ✅ 全网同步
- ✅ 激励机制可集成

**实现步骤**：

#### 1.1 部署节点注册合约

```solidity
// CRVANodeRegistry.sol
contract CRVANodeRegistry {
    struct Node {
        address owner;
        string endpoint;  // wss://node.example.com
        bytes32 publicKey;
        uint256 stake;
        uint256 reputation;
        uint256 registeredAt;
        bool active;
    }
    
    mapping(address => Node) public nodes;
    address[] public nodeAddresses;
    
    event NodeRegistered(address indexed owner, string endpoint);
    event NodeDeactivated(address indexed owner);
    
    // 注册节点（需要质押）
    function registerNode(string memory endpoint, bytes32 publicKey) external payable {
        require(msg.value >= 1 ether, "Minimum stake required");
        
        nodes[msg.sender] = Node({
            owner: msg.sender,
            endpoint: endpoint,
            publicKey: publicKey,
            stake: msg.value,
            reputation: 100,
            registeredAt: block.timestamp,
            active: true
        });
        
        nodeAddresses.push(msg.sender);
        emit NodeRegistered(msg.sender, endpoint);
    }
    
    // 获取所有活跃节点
    function getActiveNodes() external view returns (Node[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < nodeAddresses.length; i++) {
            if (nodes[nodeAddresses[i]].active) {
                activeCount++;
            }
        }
        
        Node[] memory activeNodes = new Node[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < nodeAddresses.length; i++) {
            if (nodes[nodeAddresses[i]].active) {
                activeNodes[index] = nodes[nodeAddresses[i]];
                index++;
            }
        }
        
        return activeNodes;
    }
}
```

#### 1.2 前端读取合约

```typescript
import { ethers } from 'ethers';

// 从智能合约读取节点列表
async function discoverFromBlockchain(contractAddress: string) {
    const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY');
    const contract = new ethers.Contract(contractAddress, ABI, provider);
    
    const nodes = await contract.getActiveNodes();
    return nodes.map(node => ({
        id: node.owner,
        endpoint: node.endpoint,
        publicKey: node.publicKey,
        reputation: Number(node.reputation)
    }));
}
```

### 2. DNS 种子节点（DNS Seeds）

使用 DNS TXT 记录发布节点列表，类似比特币的做法。

**DNS 配置示例**：

```dns
; 在 nodes.crva.network 域名下添加 TXT 记录
_crva._tcp.nodes.crva.network. TXT "crva=v1;id=node1;endpoint=wss://node1.example.com;pubkey=0x1234"
_crva._tcp.nodes.crva.network. TXT "crva=v1;id=node2;endpoint=wss://node2.example.com;pubkey=0x5678"
_crva._tcp.nodes.crva.network. TXT "crva=v1;id=node3;endpoint=wss://node3.example.com;pubkey=0x9abc"
```

**前端查询**（使用 DNS over HTTPS）：

```typescript
async function discoverFromDNS() {
    const response = await fetch(
        'https://dns.google/resolve?name=_crva._tcp.nodes.crva.network&type=TXT'
    );
    const data = await response.json();
    
    return data.Answer.map(record => {
        const parts = record.data.split(';');
        // 解析 TXT 记录...
    });
}
```

### 3. Bootstrap 节点（Bootstrap Nodes）

预设一组由社区运营的公开节点。

**配置示例**：

```typescript
const BOOTSTRAP_NODES = [
    'wss://bootstrap1.crva.network',
    'wss://bootstrap2.crva.network',
    'wss://bootstrap3.crva.network'
];

// 连接 Bootstrap 节点并获取更多节点
async function discoverFromBootstrap() {
    for (const bootstrap of BOOTSTRAP_NODES) {
        const nodes = await fetch(`${bootstrap}/api/peers`);
        // 返回其他节点列表
    }
}
```

### 4. mDNS 本地网络发现（Local Network）

在局域网中自动发现 CRVA 节点。

**适用场景**：
- 企业内部网络
- 家庭网络
- 开发测试环境

```typescript
// 移动端使用原生 mDNS API
// iOS: NetService / Bonjour
// Android: NsdManager

const service = {
    type: '_crva._tcp',
    name: 'CRVA-Node-' + nodeId,
    port: 3001
};

// 广播服务
mdns.advertise(service);

// 发现服务
mdns.discover('_crva._tcp', (services) => {
    services.forEach(service => {
        console.log('发现节点:', service);
    });
});
```

### 5. DHT 分布式哈希表（高级）

使用 Kademlia DHT 协议实现完全 P2P 的节点发现。

**特点**：
- 无需中心化服务器
- 自组织网络
- 高可用性

**实现库**：
- libp2p (IPFS 使用的 P2P 库)
- hypercore
- webtorrent

## 📦 实际部署建议

### 阶段1：开发测试期
使用 **本地 API + mDNS**
- 开发者在局域网内运行节点
- 快速迭代和测试

### 阶段2：内测期
使用 **Bootstrap 节点 + DNS**
- 部署 3-5 个公开 Bootstrap 节点
- 配置 DNS 种子域名
- 允许用户手动添加节点

### 阶段3：公开上线
使用 **智能合约 + Bootstrap + DNS**
- 部署节点注册合约到以太坊主网
- 节点运营者需要质押 ETH
- 多种发现方式并行，提高可用性

## 🔧 配置节点发现

在钱包应用中配置：

```typescript
import { NodeDiscoveryService, DiscoveryMethod } from './services/crva/NodeDiscovery';

// 创建节点发现服务
const nodeDiscovery = new NodeDiscoveryService({
    // 启用的发现方法（按优先级）
    methods: [
        DiscoveryMethod.BLOCKCHAIN,   // 优先从区块链
        DiscoveryMethod.DNS,           // 其次 DNS
        DiscoveryMethod.BOOTSTRAP,     // 再次 Bootstrap
        DiscoveryMethod.MDNS          // 最后本地网络
    ],
    
    // Bootstrap 节点列表
    bootstrapNodes: [
        'wss://bootstrap1.crva.network',
        'wss://bootstrap2.crva.network',
        'wss://bootstrap3.crva.network'
    ],
    
    // DNS 种子域名
    dnsSeeds: [
        'nodes.crva.network',
        'seeds.crva.io'
    ],
    
    // 智能合约地址（在以太坊主网）
    contractAddress: '0x...',
    
    // 最多保存多少个节点
    maxNodes: 100,
    
    // 刷新间隔（毫秒）
    refreshInterval: 60000  // 1分钟
});

// 开始发现节点
await nodeDiscovery.start();

// 获取活跃节点
const nodes = nodeDiscovery.getActiveNodes();
```

## 🌐 运营自己的 CRVA 节点

### 1. 安装节点软件

```bash
git clone https://github.com/your-org/crva-node.git
cd crva-node
npm install
npm run build
```

### 2. 配置节点

```env
NODE_ENDPOINT=wss://your-node.example.com
NODE_PORT=3001
NODE_PUBLIC_KEY=0x...
STAKE_AMOUNT=1.0  # ETH
```

### 3. 注册到区块链

```bash
npm run register-node
```

### 4. 启动节点

```bash
npm start
```

### 5. 监控节点

```bash
# 检查节点状态
curl https://your-node.example.com/health

# 查看验证统计
curl https://your-node.example.com/stats
```

## 🎁 节点激励机制

### 收益来源
1. **验证费用**：每次验证收取小额费用
2. **质押奖励**：持有质押代币获得奖励
3. **声誉奖励**：高声誉节点获得更多选中机会

### 惩罚机制
1. **掉线惩罚**：长时间离线扣除声誉
2. **作恶惩罚**：提供错误验证结果没收质押
3. **延迟惩罚**：响应过慢降低声誉

## 🔐 安全考虑

1. **防女巫攻击**：需要质押 ETH 才能注册节点
2. **防 DDoS**：验证请求需要签名和费用
3. **隐私保护**：使用 Ring VRF 隐藏验证者身份
4. **去中心化**：多种发现方式，避免单点故障

## 📚 参考资料

- [Bitcoin DNS Seeds](https://github.com/bitcoin/bitcoin/blob/master/doc/dnsseed-policy.md)
- [Ethereum Node Discovery](https://github.com/ethereum/devp2p/blob/master/discv4.md)
- [libp2p Documentation](https://docs.libp2p.io/)
- [Kademlia DHT Paper](https://pdos.csail.mit.edu/~petar/papers/maymounkov-kademlia-lncs.pdf)
