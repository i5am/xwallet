// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ThresholdSignature
 * @notice 门限签名聚合合约
 * 
 * 功能：
 * 1. 收集委员会成员的签名分片
 * 2. 验证签名分片的有效性
 * 3. 达到门限后聚合签名
 * 4. 执行多签交易
 * 
 * 门限签名算法（可选）：
 * - BLS 签名：简单聚合，签名可以直接相加
 * - Schnorr 签名：支持门限方案
 * - ECDSA 门限签名：兼容现有系统
 */
contract ThresholdSignature is Ownable, ReentrancyGuard {
    // ============ 结构体 ============
    
    /**
     * @notice 签名分片
     */
    struct SignatureShare {
        address signer;         // 签名者地址
        bytes32 ephemeralPubKey; // 临时公钥哈希
        bytes signature;        // 签名分片
        uint256 shareIndex;     // 分片索引
        uint256 timestamp;      // 提交时间
        bool verified;          // 是否已验证
    }
    
    /**
     * @notice 多签交易提案
     */
    struct Proposal {
        bytes32 proposalId;     // 提案 ID
        address proposer;       // 提案人
        address target;         // 目标合约
        uint256 value;          // 转账金额
        bytes data;             // 调用数据
        uint256 threshold;      // 门限值（需要多少个签名）
        uint256 deadline;       // 截止时间
        ProposalStatus status;  // 提案状态
        uint256 createdAt;      // 创建时间
        uint256 executedAt;     // 执行时间
    }
    
    /**
     * @notice 提案状态
     */
    enum ProposalStatus {
        Pending,      // 待签名
        Signed,       // 已收集足够签名
        Executed,     // 已执行
        Expired,      // 已过期
        Rejected      // 被拒绝
    }
    
    // ============ 状态变量 ============
    
    // 提案 ID => 提案
    mapping(bytes32 => Proposal) public proposals;
    
    // 提案 ID => 签名分片数组
    mapping(bytes32 => SignatureShare[]) public proposalSignatures;
    
    // 提案 ID => 签名者地址 => 是否已签名
    mapping(bytes32 => mapping(address => bool)) public hasSigned;
    
    // 所有提案 ID 列表
    bytes32[] public proposalIds;
    
    // 委员会合约地址
    address public committeeContract;
    
    // 最小门限值
    uint256 public constant MIN_THRESHOLD = 3;
    
    // 最大提案有效期（7天）
    uint256 public constant MAX_DEADLINE = 7 days;
    
    // ============ 事件 ============
    
    event ProposalCreated(
        bytes32 indexed proposalId,
        address indexed proposer,
        address target,
        uint256 value,
        uint256 threshold,
        uint256 deadline
    );
    
    event SignatureShareSubmitted(
        bytes32 indexed proposalId,
        address indexed signer,
        uint256 shareIndex,
        bytes32 ephemeralPubKey
    );
    
    event SignatureAggregated(
        bytes32 indexed proposalId,
        bytes aggregatedSignature,
        uint256 totalShares
    );
    
    event ProposalExecuted(
        bytes32 indexed proposalId,
        address target,
        uint256 value,
        bytes returnData
    );
    
    event ProposalRejected(
        bytes32 indexed proposalId,
        string reason
    );
    
    // ============ 修饰器 ============
    
    modifier onlyCommittee() {
        require(committeeContract != address(0), "Committee not set");
        // TODO: 验证调用者是否在当前委员会中
        _;
    }
    
    modifier proposalExists(bytes32 proposalId) {
        require(proposals[proposalId].proposalId != bytes32(0), "Proposal does not exist");
        _;
    }
    
    modifier proposalPending(bytes32 proposalId) {
        require(proposals[proposalId].status == ProposalStatus.Pending, "Proposal not pending");
        _;
    }
    
    // ============ 构造函数 ============
    
    constructor(address _committeeContract) Ownable(msg.sender) {
        committeeContract = _committeeContract;
    }
    
    // ============ 外部函数 ============
    
    /**
     * @notice 创建多签交易提案
     * @param target 目标合约地址
     * @param value 转账金额
     * @param data 调用数据
     * @param threshold 门限值
     * @param deadline 截止时间（秒）
     */
    function createProposal(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 threshold,
        uint256 deadline
    ) external returns (bytes32) {
        require(threshold >= MIN_THRESHOLD, "Threshold too low");
        require(deadline <= MAX_DEADLINE, "Deadline too far");
        
        // 生成提案 ID
        bytes32 proposalId = keccak256(
            abi.encodePacked(
                msg.sender,
                target,
                value,
                data,
                threshold,
                block.timestamp
            )
        );
        
        require(proposals[proposalId].proposalId == bytes32(0), "Proposal already exists");
        
        // 创建提案
        proposals[proposalId] = Proposal({
            proposalId: proposalId,
            proposer: msg.sender,
            target: target,
            value: value,
            data: data,
            threshold: threshold,
            deadline: block.timestamp + deadline,
            status: ProposalStatus.Pending,
            createdAt: block.timestamp,
            executedAt: 0
        });
        
        proposalIds.push(proposalId);
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            target,
            value,
            threshold,
            block.timestamp + deadline
        );
        
        return proposalId;
    }
    
    /**
     * @notice 提交签名分片（委员会成员）
     * @param proposalId 提案 ID
     * @param ephemeralPubKey 临时公钥哈希
     * @param signature 签名分片
     * @param shareIndex 分片索引
     */
    function submitSignatureShare(
        bytes32 proposalId,
        bytes32 ephemeralPubKey,
        bytes calldata signature,
        uint256 shareIndex
    ) 
        external
        proposalExists(proposalId)
        proposalPending(proposalId)
        onlyCommittee
    {
        Proposal storage proposal = proposals[proposalId];
        
        // 检查截止时间
        require(block.timestamp <= proposal.deadline, "Proposal expired");
        
        // 检查是否已签名
        require(!hasSigned[proposalId][msg.sender], "Already signed");
        
        // TODO: 验证临时公钥是否在当前委员会中
        // TODO: 验证签名分片的有效性
        
        // 记录签名分片
        SignatureShare memory share = SignatureShare({
            signer: msg.sender,
            ephemeralPubKey: ephemeralPubKey,
            signature: signature,
            shareIndex: shareIndex,
            timestamp: block.timestamp,
            verified: true
        });
        
        proposalSignatures[proposalId].push(share);
        hasSigned[proposalId][msg.sender] = true;
        
        emit SignatureShareSubmitted(
            proposalId,
            msg.sender,
            shareIndex,
            ephemeralPubKey
        );
        
        // 检查是否达到门限
        if (proposalSignatures[proposalId].length >= proposal.threshold) {
            _aggregateAndExecute(proposalId);
        }
    }
    
    /**
     * @notice 手动触发签名聚合和执行（如果已达到门限）
     * @param proposalId 提案 ID
     */
    function executeProposal(bytes32 proposalId)
        external
        proposalExists(proposalId)
        proposalPending(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(
            proposalSignatures[proposalId].length >= proposal.threshold,
            "Not enough signatures"
        );
        
        _aggregateAndExecute(proposalId);
    }
    
    /**
     * @notice 拒绝提案（仅所有者）
     * @param proposalId 提案 ID
     * @param reason 拒绝原因
     */
    function rejectProposal(bytes32 proposalId, string calldata reason)
        external
        onlyOwner
        proposalExists(proposalId)
        proposalPending(proposalId)
    {
        proposals[proposalId].status = ProposalStatus.Rejected;
        
        emit ProposalRejected(proposalId, reason);
    }
    
    // ============ 内部函数 ============
    
    /**
     * @notice 聚合签名并执行交易
     * @param proposalId 提案 ID
     */
    function _aggregateAndExecute(bytes32 proposalId) internal nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        SignatureShare[] storage shares = proposalSignatures[proposalId];
        
        require(shares.length >= proposal.threshold, "Not enough signatures");
        
        // 聚合签名
        bytes memory aggregatedSignature = _aggregateSignatures(shares);
        
        emit SignatureAggregated(proposalId, aggregatedSignature, shares.length);
        
        // 执行交易
        proposal.status = ProposalStatus.Signed;
        
        (bool success, bytes memory returnData) = proposal.target.call{value: proposal.value}(
            proposal.data
        );
        
        require(success, "Transaction execution failed");
        
        proposal.status = ProposalStatus.Executed;
        proposal.executedAt = block.timestamp;
        
        emit ProposalExecuted(proposalId, proposal.target, proposal.value, returnData);
    }
    
    /**
     * @notice 聚合签名分片
     * @param shares 签名分片数组
     * @return 聚合后的签名
     * 
     * 注意：这里是简化实现，实际应使用：
     * - BLS 签名聚合（最简单）
     * - Schnorr 门限签名
     * - ECDSA 门限签名（TSS）
     */
    function _aggregateSignatures(SignatureShare[] storage shares)
        internal
        view
        returns (bytes memory)
    {
        // 简化版：直接连接所有签名
        // 实际应该使用密码学聚合算法
        
        bytes memory aggregated = "";
        
        for (uint256 i = 0; i < shares.length; i++) {
            aggregated = abi.encodePacked(aggregated, shares[i].signature);
        }
        
        return aggregated;
    }
    
    // ============ 查询函数 ============
    
    /**
     * @notice 获取提案详情
     * @param proposalId 提案 ID
     */
    function getProposal(bytes32 proposalId)
        external
        view
        returns (Proposal memory)
    {
        return proposals[proposalId];
    }
    
    /**
     * @notice 获取提案的所有签名
     * @param proposalId 提案 ID
     */
    function getProposalSignatures(bytes32 proposalId)
        external
        view
        returns (SignatureShare[] memory)
    {
        return proposalSignatures[proposalId];
    }
    
    /**
     * @notice 获取提案签名进度
     * @param proposalId 提案 ID
     */
    function getSignatureProgress(bytes32 proposalId)
        external
        view
        returns (uint256 current, uint256 required, uint256 percentage)
    {
        Proposal memory proposal = proposals[proposalId];
        current = proposalSignatures[proposalId].length;
        required = proposal.threshold;
        percentage = (current * 100) / required;
    }
    
    /**
     * @notice 获取所有提案 ID
     */
    function getAllProposalIds() external view returns (bytes32[] memory) {
        return proposalIds;
    }
    
    /**
     * @notice 获取待处理的提案
     */
    function getPendingProposals() external view returns (bytes32[] memory) {
        uint256 count = 0;
        
        // 计算待处理提案数量
        for (uint256 i = 0; i < proposalIds.length; i++) {
            if (proposals[proposalIds[i]].status == ProposalStatus.Pending) {
                count++;
            }
        }
        
        // 收集待处理提案
        bytes32[] memory pending = new bytes32[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < proposalIds.length; i++) {
            if (proposals[proposalIds[i]].status == ProposalStatus.Pending) {
                pending[index] = proposalIds[i];
                index++;
            }
        }
        
        return pending;
    }
    
    /**
     * @notice 检查地址是否已对提案签名
     * @param proposalId 提案 ID
     * @param signer 签名者地址
     */
    function hasSignedProposal(bytes32 proposalId, address signer)
        external
        view
        returns (bool)
    {
        return hasSigned[proposalId][signer];
    }
    
    // ============ 管理函数 ============
    
    /**
     * @notice 更新委员会合约地址
     * @param _committeeContract 新的委员会合约地址
     */
    function setCommitteeContract(address _committeeContract) external onlyOwner {
        require(_committeeContract != address(0), "Invalid address");
        committeeContract = _committeeContract;
    }
}
