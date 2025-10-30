// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CRVARegistry
 * @dev CRVA 验证节点注册表合约
 * 节点需要质押资产并注册永久公钥才能加入验证网络
 */
contract CRVARegistry is Ownable, ReentrancyGuard {
    
    // 最小质押金额（10 ETH）
    uint256 public constant MIN_STAKE = 10 ether;
    
    // 质押锁定期（7天）
    uint256 public constant LOCK_PERIOD = 7 days;
    
    // 验证节点信息
    struct ValidatorNode {
        address nodeAddress;        // 节点地址
        bytes32 permanentPubKey;    // 永久公钥（哈希）
        uint256 stakedAmount;       // 质押金额
        uint256 reputation;         // 信誉分数 (0-10000)
        uint256 registeredAt;       // 注册时间
        uint256 lastActiveAt;       // 最后活跃时间
        bool isActive;              // 是否活跃
        bool isSlashed;             // 是否被罚没
    }
    
    // 节点地址 => 节点信息
    mapping(address => ValidatorNode) public validators;
    
    // 活跃节点列表
    address[] public activeValidators;
    
    // 节点总数
    uint256 public totalValidators;
    
    // 事件
    event ValidatorRegistered(address indexed nodeAddress, bytes32 permanentPubKey, uint256 stakedAmount);
    event ValidatorDeregistered(address indexed nodeAddress, uint256 returnedAmount);
    event ValidatorSlashed(address indexed nodeAddress, uint256 slashedAmount, string reason);
    event ReputationUpdated(address indexed nodeAddress, uint256 oldReputation, uint256 newReputation);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev 注册验证节点
     * @param _permanentPubKey 永久公钥（应为椭圆曲线公钥的哈希）
     */
    function registerValidator(bytes32 _permanentPubKey) external payable nonReentrant {
        require(msg.value >= MIN_STAKE, "Insufficient stake amount");
        require(!validators[msg.sender].isActive, "Already registered");
        require(_permanentPubKey != bytes32(0), "Invalid public key");
        
        validators[msg.sender] = ValidatorNode({
            nodeAddress: msg.sender,
            permanentPubKey: _permanentPubKey,
            stakedAmount: msg.value,
            reputation: 5000, // 初始信誉 50%
            registeredAt: block.timestamp,
            lastActiveAt: block.timestamp,
            isActive: true,
            isSlashed: false
        });
        
        activeValidators.push(msg.sender);
        totalValidators++;
        
        emit ValidatorRegistered(msg.sender, _permanentPubKey, msg.value);
    }
    
    /**
     * @dev 注销验证节点
     */
    function deregisterValidator() external nonReentrant {
        ValidatorNode storage validator = validators[msg.sender];
        require(validator.isActive, "Not registered");
        require(!validator.isSlashed, "Cannot withdraw: slashed");
        require(
            block.timestamp >= validator.registeredAt + LOCK_PERIOD,
            "Still in lock period"
        );
        
        validator.isActive = false;
        uint256 returnAmount = validator.stakedAmount;
        validator.stakedAmount = 0;
        
        // 从活跃列表中移除
        _removeFromActiveList(msg.sender);
        totalValidators--;
        
        // 退还质押
        (bool success, ) = msg.sender.call{value: returnAmount}("");
        require(success, "Transfer failed");
        
        emit ValidatorDeregistered(msg.sender, returnAmount);
    }
    
    /**
     * @dev 增加质押
     */
    function addStake() external payable {
        ValidatorNode storage validator = validators[msg.sender];
        require(validator.isActive, "Not registered");
        require(msg.value > 0, "Invalid amount");
        
        validator.stakedAmount += msg.value;
    }
    
    /**
     * @dev 罚没节点（仅限管理员或治理合约）
     * @param _nodeAddress 节点地址
     * @param _reason 罚没原因
     */
    function slashValidator(address _nodeAddress, string calldata _reason) external onlyOwner {
        ValidatorNode storage validator = validators[_nodeAddress];
        require(validator.isActive, "Not active");
        require(!validator.isSlashed, "Already slashed");
        
        validator.isSlashed = true;
        validator.isActive = false;
        uint256 slashedAmount = validator.stakedAmount;
        validator.stakedAmount = 0;
        
        _removeFromActiveList(_nodeAddress);
        totalValidators--;
        
        emit ValidatorSlashed(_nodeAddress, slashedAmount, _reason);
    }
    
    /**
     * @dev 更新节点信誉
     * @param _nodeAddress 节点地址
     * @param _newReputation 新信誉值 (0-10000)
     */
    function updateReputation(address _nodeAddress, uint256 _newReputation) external onlyOwner {
        require(_newReputation <= 10000, "Invalid reputation");
        ValidatorNode storage validator = validators[_nodeAddress];
        require(validator.isActive, "Not active");
        
        uint256 oldReputation = validator.reputation;
        validator.reputation = _newReputation;
        
        emit ReputationUpdated(_nodeAddress, oldReputation, _newReputation);
    }
    
    /**
     * @dev 更新最后活跃时间
     */
    function updateLastActive(address _nodeAddress) external onlyOwner {
        validators[_nodeAddress].lastActiveAt = block.timestamp;
    }
    
    /**
     * @dev 获取所有活跃验证节点
     */
    function getActiveValidators() external view returns (address[] memory) {
        return activeValidators;
    }
    
    /**
     * @dev 获取节点的永久公钥
     */
    function getPermanentPubKey(address _nodeAddress) external view returns (bytes32) {
        return validators[_nodeAddress].permanentPubKey;
    }
    
    /**
     * @dev 验证节点是否已注册且活跃
     */
    function isValidValidator(address _nodeAddress) external view returns (bool) {
        return validators[_nodeAddress].isActive && !validators[_nodeAddress].isSlashed;
    }
    
    /**
     * @dev 从活跃列表中移除节点
     */
    function _removeFromActiveList(address _nodeAddress) private {
        for (uint256 i = 0; i < activeValidators.length; i++) {
            if (activeValidators[i] == _nodeAddress) {
                activeValidators[i] = activeValidators[activeValidators.length - 1];
                activeValidators.pop();
                break;
            }
        }
    }
    
    /**
     * @dev 获取节点详细信息
     */
    function getValidatorInfo(address _nodeAddress) external view returns (
        bytes32 permanentPubKey,
        uint256 stakedAmount,
        uint256 reputation,
        uint256 registeredAt,
        uint256 lastActiveAt,
        bool isActive,
        bool isSlashed
    ) {
        ValidatorNode memory validator = validators[_nodeAddress];
        return (
            validator.permanentPubKey,
            validator.stakedAmount,
            validator.reputation,
            validator.registeredAt,
            validator.lastActiveAt,
            validator.isActive,
            validator.isSlashed
        );
    }
}
