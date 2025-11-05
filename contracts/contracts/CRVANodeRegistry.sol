// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CRVANodeRegistry
 * @dev CRVA 节点注册合约 - 去中心化节点发现
 */
contract CRVANodeRegistry {
    
    struct Node {
        address owner;           // 节点所有者
        string endpoint;         // 节点端点 wss://node.example.com
        bytes32 publicKey;       // 节点公钥
        uint256 stake;           // 质押金额
        uint256 reputation;      // 节点声誉 (0-100)
        uint256 registeredAt;    // 注册时间
        uint256 lastHeartbeat;   // 最后心跳时间
        bool active;             // 是否活跃
    }
    
    // 最小质押金额 (0.1 ETH)
    uint256 public constant MIN_STAKE = 0.1 ether;
    
    // 心跳超时时间 (24小时)
    uint256 public constant HEARTBEAT_TIMEOUT = 24 hours;
    
    // 所有节点映射
    mapping(address => Node) public nodes;
    
    // 节点地址列表
    address[] public nodeAddresses;
    
    // 节点索引映射
    mapping(address => uint256) private nodeIndex;
    
    // 合约所有者
    address public owner;
    
    // 事件
    event NodeRegistered(address indexed owner, string endpoint, uint256 stake);
    event NodeUpdated(address indexed owner, string endpoint);
    event NodeDeactivated(address indexed owner);
    event NodeReactivated(address indexed owner);
    event StakeIncreased(address indexed owner, uint256 amount);
    event StakeWithdrawn(address indexed owner, uint256 amount);
    event HeartbeatSent(address indexed owner, uint256 timestamp);
    event ReputationUpdated(address indexed owner, uint256 oldReputation, uint256 newReputation);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier onlyNodeOwner() {
        require(nodes[msg.sender].owner == msg.sender, "Not node owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev 注册新节点
     * @param endpoint 节点端点 URL
     * @param publicKey 节点公钥
     */
    function registerNode(string memory endpoint, bytes32 publicKey) external payable {
        require(msg.value >= MIN_STAKE, "Insufficient stake");
        require(nodes[msg.sender].owner == address(0), "Node already registered");
        require(bytes(endpoint).length > 0, "Empty endpoint");
        
        nodes[msg.sender] = Node({
            owner: msg.sender,
            endpoint: endpoint,
            publicKey: publicKey,
            stake: msg.value,
            reputation: 100,
            registeredAt: block.timestamp,
            lastHeartbeat: block.timestamp,
            active: true
        });
        
        nodeIndex[msg.sender] = nodeAddresses.length;
        nodeAddresses.push(msg.sender);
        
        emit NodeRegistered(msg.sender, endpoint, msg.value);
    }
    
    /**
     * @dev 更新节点端点
     * @param endpoint 新的节点端点
     */
    function updateEndpoint(string memory endpoint) external onlyNodeOwner {
        require(bytes(endpoint).length > 0, "Empty endpoint");
        nodes[msg.sender].endpoint = endpoint;
        emit NodeUpdated(msg.sender, endpoint);
    }
    
    /**
     * @dev 增加质押
     */
    function increaseStake() external payable onlyNodeOwner {
        require(msg.value > 0, "Zero stake");
        nodes[msg.sender].stake += msg.value;
        emit StakeIncreased(msg.sender, msg.value);
    }
    
    /**
     * @dev 提取质押（需要先停用节点）
     */
    function withdrawStake() external onlyNodeOwner {
        require(!nodes[msg.sender].active, "Node still active");
        require(block.timestamp >= nodes[msg.sender].lastHeartbeat + 7 days, "Cooldown period");
        
        uint256 amount = nodes[msg.sender].stake;
        nodes[msg.sender].stake = 0;
        
        payable(msg.sender).transfer(amount);
        emit StakeWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev 停用节点
     */
    function deactivateNode() external onlyNodeOwner {
        nodes[msg.sender].active = false;
        emit NodeDeactivated(msg.sender);
    }
    
    /**
     * @dev 重新激活节点
     */
    function reactivateNode() external onlyNodeOwner {
        require(!nodes[msg.sender].active, "Node already active");
        nodes[msg.sender].active = true;
        nodes[msg.sender].lastHeartbeat = block.timestamp;
        emit NodeReactivated(msg.sender);
    }
    
    /**
     * @dev 发送心跳
     */
    function heartbeat() external onlyNodeOwner {
        require(nodes[msg.sender].active, "Node not active");
        nodes[msg.sender].lastHeartbeat = block.timestamp;
        emit HeartbeatSent(msg.sender, block.timestamp);
    }
    
    /**
     * @dev 更新节点声誉（仅合约所有者）
     * @param nodeOwner 节点地址
     * @param newReputation 新声誉值 (0-100)
     */
    function updateReputation(address nodeOwner, uint256 newReputation) external onlyOwner {
        require(nodes[nodeOwner].owner != address(0), "Node not found");
        require(newReputation <= 100, "Invalid reputation");
        
        uint256 oldReputation = nodes[nodeOwner].reputation;
        nodes[nodeOwner].reputation = newReputation;
        
        emit ReputationUpdated(nodeOwner, oldReputation, newReputation);
    }
    
    /**
     * @dev 获取所有活跃节点
     */
    function getActiveNodes() external view returns (Node[] memory) {
        uint256 activeCount = 0;
        
        // 统计活跃节点数量
        for (uint256 i = 0; i < nodeAddresses.length; i++) {
            address nodeAddr = nodeAddresses[i];
            if (nodes[nodeAddr].active && 
                block.timestamp <= nodes[nodeAddr].lastHeartbeat + HEARTBEAT_TIMEOUT) {
                activeCount++;
            }
        }
        
        // 构建活跃节点数组
        Node[] memory activeNodes = new Node[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < nodeAddresses.length; i++) {
            address nodeAddr = nodeAddresses[i];
            if (nodes[nodeAddr].active && 
                block.timestamp <= nodes[nodeAddr].lastHeartbeat + HEARTBEAT_TIMEOUT) {
                activeNodes[index] = nodes[nodeAddr];
                index++;
            }
        }
        
        return activeNodes;
    }
    
    /**
     * @dev 获取所有节点（包括非活跃）
     */
    function getAllNodes() external view returns (Node[] memory) {
        Node[] memory allNodes = new Node[](nodeAddresses.length);
        
        for (uint256 i = 0; i < nodeAddresses.length; i++) {
            allNodes[i] = nodes[nodeAddresses[i]];
        }
        
        return allNodes;
    }
    
    /**
     * @dev 获取节点数量
     */
    function getNodeCount() external view returns (uint256) {
        return nodeAddresses.length;
    }
    
    /**
     * @dev 获取活跃节点数量
     */
    function getActiveNodeCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < nodeAddresses.length; i++) {
            address nodeAddr = nodeAddresses[i];
            if (nodes[nodeAddr].active && 
                block.timestamp <= nodes[nodeAddr].lastHeartbeat + HEARTBEAT_TIMEOUT) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev 检查节点是否活跃
     */
    function isNodeActive(address nodeAddr) external view returns (bool) {
        return nodes[nodeAddr].active && 
               block.timestamp <= nodes[nodeAddr].lastHeartbeat + HEARTBEAT_TIMEOUT;
    }
}
