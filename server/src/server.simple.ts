/**
 * 简化版启动脚本（无需 MongoDB/Redis）
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from './websocket/WebSocketServer';
import { logger } from './utils/logger';
import { apiRouter } from './api/routes';

dotenv.config();

class CRVABackendSimple {
  private app: express.Application;
  private wsServer: WebSocketServer | null = null;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mode: process.env.MODE || 'api',
        uptime: process.uptime()
      });
    });
    
    // API 路由
    this.app.use('/api', apiRouter);
    
    // 404
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
    
    // 错误处理
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('API Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  async start(): Promise<void> {
    try {
      console.log('\n🚀 ========================================');
      console.log('   CRVA Backend Server Starting...');
      console.log('========================================\n');
      
      // 启动 HTTP 服务器
      const port = process.env.PORT || 3000;
      this.app.listen(port, () => {
        logger.info(`✅ HTTP Server listening on port ${port}`);
        console.log(`\n✅ API Server: http://localhost:${port}`);
        console.log(`   Health Check: http://localhost:${port}/health`);
        console.log(`   API Info: http://localhost:${port}/api\n`);
      });
      
      // 启动 WebSocket 服务器
      const wsPort = process.env.WS_PORT || 3001;
      this.wsServer = new WebSocketServer(Number(wsPort));
      await this.wsServer.start();
      logger.info(`✅ WebSocket Server listening on port ${wsPort}`);
      console.log(`✅ WebSocket: ws://localhost:${wsPort}\n`);
      
      console.log('========================================');
      console.log('   CRVA Backend Server Started!');
      console.log('   Mode: ' + (process.env.MODE || 'api'));
      console.log('========================================\n');
      
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    logger.info('Stopping CRVA Backend...');
    
    if (this.wsServer) {
      await this.wsServer.stop();
    }
    
    logger.info('✅ CRVA Backend stopped');
  }
}

// 主程序入口
const server = new CRVABackendSimple();

server.start().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Received SIGINT, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Received SIGTERM, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

export default server;
