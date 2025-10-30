// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CRVARegistry.sol";

/**
 * @title CRVACommittee
 * @dev CRVA 委员会选取合约
 * 使用 VRF 从临时公钥列表中随机选取验证节点
 */
contract CRVACommittee {
    
    CRVARegistry public registry;
    
    // 委员会轮换间隔（1小时）
    uint256 public constant ROTATION_INTERVAL = 1 hours;
    
    // 最少委员会成员数
    uint256 public constant MIN_COMMITTEE_SIZE = 3;
    
    // 最大委员会成员数
    uint256 public constant MAX_COMMITTEE_SIZE = 7;
    
    // 临时公钥提交
    struct EphemeralSubmission {
        bytes encryptedPubKey;      // 加密的临时公钥
        bytes zkProof;              // ZK 证明
        uint256 submittedAt;        // 提交时间
        bool verified;              // 是否已验证
    }
    
    // 委员会轮次
    struct CommitteeRound {
        uint256 roundId;            // 轮次ID
        uint256 startTime;          // 开始时间
        uint256 endTime;            // 结束时间
        bytes32[] ephemeralPubKeys; // 临时公钥列表（明文）
        bytes32[] selectedMembers;  // 选中的成员（临时公钥）
        bytes32 vrfSeed;            // VRF 种子
        bool isActive;              // 是否活跃
        bool isFinalized;           // 是否已finalized
    }
    
    // 当前轮次ID
    uint256 public currentRoundId;
    
    // 轮次ID => 轮次信息
    mapping(uint256 => CommitteeRound) public rounds;
    
    // 轮次ID => 节点地址 => 提交信息
    mapping(uint256 => mapping(address => EphemeralSubmission)) public submissions;
    
    // 轮次ID => 已提交节点列表
    mapping(uint256 => address[]) public submittedNodes;
    
    // Relayer 地址（有权解密和提交临时公钥）
    address public relayer;
    
    // 事件
    event RoundStarted(uint256 indexed roundId, uint256 startTime);
    event EphemeralKeySubmitted(uint256 indexed roundId, address indexed node);
    event EphemeralKeysRevealed(uint256 indexed roundId, uint256 count);
    event CommitteeSelected(uint256 indexed roundId, bytes32[] members);
    event RoundFinalized(uint256 indexed roundId);
    
    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer");
        _;
    }
    
    constructor(address _registryAddress, address _relayer) {
        registry = CRVARegistry(_registryAddress);
        relayer = _relayer;
        _startNewRound();
    }
    
    /**
     * @dev 节点提交加密的临时公钥 + ZK证明
     * @param _encryptedPubKey 加密的临时公钥（只有 Relayer 能解密）
     * @param _zkProof ZK 证明（证明临时公钥与永久公钥有关联）
     */
    function submitEphemeralKey(
        bytes calldata _encryptedPubKey,
        bytes calldata _zkProof
    ) external {
        require(registry.isValidValidator(msg.sender), "Not a valid validator");
        
        CommitteeRound storage round = rounds[currentRoundId];
        require(round.isActive, "Round not active");
        require(block.timestamp < round.endTime, "Submission period ended");
        require(submissions[currentRoundId][msg.sender].submittedAt == 0, "Already submitted");
        
        submissions[currentRoundId][msg.sender] = EphemeralSubmission({
            encryptedPubKey: _encryptedPubKey,
            zkProof: _zkProof,
            submittedAt: block.timestamp,
            verified: false
        });
        
        submittedNodes[currentRoundId].push(msg.sender);
        
        emit EphemeralKeySubmitted(currentRoundId, msg.sender);
    }
    
    /**
     * @dev Relayer 提交解密后的临时公钥列表（在 TEE 内完成）
     * @param _roundId 轮次ID
     * @param _ephemeralPubKeys 解密后的临时公钥列表
     */
    function revealEphemeralKeys(
        uint256 _roundId,
        bytes32[] calldata _ephemeralPubKeys
    ) external onlyRelayer {
        CommitteeRound storage round = rounds[_roundId];
        require(round.isActive, "Round not active");
        require(!round.isFinalized, "Already finalized");
        require(_ephemeralPubKeys.length >= MIN_COMMITTEE_SIZE, "Not enough submissions");
        
        // TODO: 在实际实现中，这里应该验证 Relayer 的 TEE 证明
        // 确保解密过程确实在可信环境中完成
        
        round.ephemeralPubKeys = _ephemeralPubKeys;
        
        emit EphemeralKeysRevealed(_roundId, _ephemeralPubKeys.length);
    }
    
    /**
     * @dev 使用 VRF 选取委员会成员
     * @param _roundId 轮次ID
     * @param _vrfSeed VRF 种子（应该从链上随机性来源获取）
     * @param _committeeSize 委员会大小
     */
    function selectCommittee(
        uint256 _roundId,
        bytes32 _vrfSeed,
        uint256 _committeeSize
    ) external onlyRelayer {
        require(_committeeSize >= MIN_COMMITTEE_SIZE && _committeeSize <= MAX_COMMITTEE_SIZE, "Invalid size");
        
        CommitteeRound storage round = rounds[_roundId];
        require(round.isActive, "Round not active");
        require(round.ephemeralPubKeys.length > 0, "Keys not revealed");
        require(round.selectedMembers.length == 0, "Already selected");
        
        round.vrfSeed = _vrfSeed;
        
        // 使用 VRF 种子进行随机选取
        bytes32[] memory selected = new bytes32[](_committeeSize);
        uint256[] memory indices = _selectRandomIndices(
            round.ephemeralPubKeys.length,
            _committeeSize,
            _vrfSeed
        );
        
        for (uint256 i = 0; i < _committeeSize; i++) {
            selected[i] = round.ephemeralPubKeys[indices[i]];
        }
        
        round.selectedMembers = selected;
        
        emit CommitteeSelected(_roundId, selected);
    }
    
    /**
     * @dev 结束当前轮次并开始新轮次
     */
    function finalizeRound() external onlyRelayer {
        CommitteeRound storage round = rounds[currentRoundId];
        require(round.isActive, "Round not active");
        require(block.timestamp >= round.endTime, "Round not ended");
        require(round.selectedMembers.length > 0, "Committee not selected");
        
        round.isActive = false;
        round.isFinalized = true;
        
        emit RoundFinalized(currentRoundId);
        
        // 开始新轮次
        _startNewRound();
    }
    
    /**
     * @dev 获取当前委员会成员
     */
    function getCurrentCommittee() external view returns (bytes32[] memory) {
        return rounds[currentRoundId].selectedMembers;
    }
    
    /**
     * @dev 检查临时公钥是否在当前委员会中
     * @param _ephemeralPubKey 临时公钥
     */
    function isInCommittee(bytes32 _ephemeralPubKey) external view returns (bool) {
        bytes32[] memory committee = rounds[currentRoundId].selectedMembers;
        for (uint256 i = 0; i < committee.length; i++) {
            if (committee[i] == _ephemeralPubKey) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev 获取轮次信息
     */
    function getRoundInfo(uint256 _roundId) external view returns (
        uint256 startTime,
        uint256 endTime,
        uint256 ephemeralKeyCount,
        uint256 committeeSize,
        bool isActive,
        bool isFinalized
    ) {
        CommitteeRound memory round = rounds[_roundId];
        return (
            round.startTime,
            round.endTime,
            round.ephemeralPubKeys.length,
            round.selectedMembers.length,
            round.isActive,
            round.isFinalized
        );
    }
    
    /**
     * @dev 更新 Relayer 地址
     */
    function updateRelayer(address _newRelayer) external {
        require(msg.sender == relayer, "Only current relayer");
        relayer = _newRelayer;
    }
    
    /**
     * @dev 开始新轮次（内部函数）
     */
    function _startNewRound() private {
        currentRoundId++;
        
        rounds[currentRoundId] = CommitteeRound({
            roundId: currentRoundId,
            startTime: block.timestamp,
            endTime: block.timestamp + ROTATION_INTERVAL,
            ephemeralPubKeys: new bytes32[](0),
            selectedMembers: new bytes32[](0),
            vrfSeed: bytes32(0),
            isActive: true,
            isFinalized: false
        });
        
        emit RoundStarted(currentRoundId, block.timestamp);
    }
    
    /**
     * @dev 使用 VRF 种子选取随机索引（Fisher-Yates 洗牌算法）
     */
    function _selectRandomIndices(
        uint256 _totalCount,
        uint256 _selectCount,
        bytes32 _seed
    ) private pure returns (uint256[] memory) {
        require(_selectCount <= _totalCount, "Select count too large");
        
        uint256[] memory indices = new uint256[](_selectCount);
        uint256[] memory available = new uint256[](_totalCount);
        
        // 初始化可用索引
        for (uint256 i = 0; i < _totalCount; i++) {
            available[i] = i;
        }
        
        // Fisher-Yates 洗牌
        for (uint256 i = 0; i < _selectCount; i++) {
            // 使用 VRF 种子生成随机数
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(_seed, i))) % (_totalCount - i);
            
            indices[i] = available[randomIndex];
            
            // 将选中的索引与最后一个交换
            available[randomIndex] = available[_totalCount - i - 1];
        }
        
        return indices;
    }
}
