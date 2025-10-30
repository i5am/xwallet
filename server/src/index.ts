/**
 * CRVA 后端服务主入口
 * 
 * 功能：
 * 1. REST API 服务
 * 2. WebSocket 实时通信
 * 3. 节点管理
 * 4. 交易验证
 * 5. P2P 网络
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from './websocket/WebSocketServer';
import { CRVANode } from './node/CRVANode';
import { CRVARelayer } from './relayer/CRVARelayer';
import { apiRouter } from './api/routes';
import { logger } from './utils/logger';
import { DatabaseService } from './services/DatabaseService';

dotenv.config();

class CRVABackend {
  private app: express.Application;
  private wsServer: WebSocketServer | null = null;
  private node: CRVANode | null = null;
  private relayer: CRVARelayer | null = null;
  private db: DatabaseService;

  constructor() {
    this.app = express();
    this.db = new DatabaseService();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // 请求日志
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // API 路由
    this.app.use('/api', apiRouter);
    
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        node: this.node?.getStatus(),
        relayer: this.relayer?.getStatus()
      });
    });
    
    // 404 处理
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
    
    // 错误处理
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('API Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  /**
   * 启动服务
   */
  async start(): Promise<void> {
    try {
      console.log('\n🚀 ========================================');
      console.log('   CRVA Backend Server Starting...');
      console.log('========================================\n');
      
      // 1. 连接数据库
      logger.info('Connecting to database...');
      await this.db.connect();
      logger.info('✅ Database connected');
      
      // 2. 启动 HTTP 服务器
      const port = process.env.PORT || 3000;
      this.app.listen(port, () => {
        logger.info(`✅ HTTP Server listening on port ${port}`);
      });
      
      // 3. 启动 WebSocket 服务器
      const wsPort = process.env.WS_PORT || 3001;
      this.wsServer = new WebSocketServer(Number(wsPort));
      await this.wsServer.start();
      logger.info(`✅ WebSocket Server listening on port ${wsPort}`);
      
      // 4. 根据配置启动节点或 Relayer
      const mode = process.env.MODE || 'node';
      
      if (mode === 'node') {
        await this.startNode();
      } else if (mode === 'relayer') {
        await this.startRelayer();
      } else {
        logger.warn(`Unknown mode: ${mode}, running in API-only mode`);
      }
      
      console.log('\n✅ ========================================');
      console.log('   CRVA Backend Server Started!');
      console.log('========================================\n');
      
      logger.info(`API: http://localhost:${port}`);
      logger.info(`WebSocket: ws://localhost:${wsPort}`);
      logger.info(`Mode: ${mode}`);
      
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * 启动 CRVA 节点
   */
  private async startNode(): Promise<void> {
    logger.info('Starting CRVA Node...');
    
    this.node = new CRVANode({
      nodeId: process.env.NODE_ID || `node_${Date.now()}`,
      privateKey: process.env.NODE_PRIVATE_KEY || '',
      rpcUrl: process.env.ETH_RPC_URL || 'http://localhost:8545',
      registryAddress: process.env.CRVA_REGISTRY_ADDRESS || '',
      committeeAddress: process.env.CRVA_COMMITTEE_ADDRESS || '',
      stakeAmount: process.env.STAKE_AMOUNT || '10000000000000000000'
    });
    
    // 转发节点事件到 WebSocket
    this.node.on('registered', (data) => {
      this.wsServer?.broadcast('nodeRegistered', data);
    });
    
    this.node.on('ephemeralKeySubmitted', (data) => {
      this.wsServer?.broadcast('ephemeralKeySubmitted', data);
    });
    
    this.node.on('selectedIntoCommittee', (data) => {
      this.wsServer?.broadcast('committeeSelected', data);
    });
    
    await this.node.start();
    logger.info('✅ CRVA Node started');
  }

  /**
   * 启动 CRVA Relayer
   */
  private async startRelayer(): Promise<void> {
    logger.info('Starting CRVA Relayer...');
    
    this.relayer = new CRVARelayer({
      relayerId: process.env.RELAYER_ID || `relayer_${Date.now()}`,
      privateKey: process.env.NODE_PRIVATE_KEY || '',
      rpcUrl: process.env.ETH_RPC_URL || 'http://localhost:8545',
      committeeAddress: process.env.CRVA_COMMITTEE_ADDRESS || '',
      rotationInterval: 3600 // 1 hour
    });
    
    // 转发 Relayer 事件到 WebSocket
    this.relayer.on('submissionReceived', (data) => {
      this.wsServer?.broadcast('submissionReceived', data);
    });
    
    this.relayer.on('keysRevealed', (data) => {
      this.wsServer?.broadcast('keysRevealed', data);
    });
    
    await this.relayer.start();
    logger.info('✅ CRVA Relayer started');
  }

  /**
   * 停止服务
   */
  async stop(): Promise<void> {
    logger.info('Stopping CRVA Backend...');
    
    if (this.node) {
      await this.node.stop();
    }
    
    if (this.relayer) {
      await this.relayer.stop();
    }
    
    if (this.wsServer) {
      await this.wsServer.stop();
    }
    
    await this.db.disconnect();
    
    logger.info('✅ CRVA Backend stopped');
  }
}

// 主程序入口
const server = new CRVABackend();

// 启动服务器
server.start().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

// 优雅关闭
process.on('SIGINT', async () => {
  logger.info('\nReceived SIGINT, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('\nReceived SIGTERM, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;
