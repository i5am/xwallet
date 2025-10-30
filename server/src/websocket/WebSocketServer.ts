/**
 * WebSocket 服务器实现
 * 
 * 功能：
 * 1. 客户端连接管理
 * 2. 实时事件广播
 * 3. 节点状态同步
 * 4. 交易验证进度推送
 */

import WebSocket, { WebSocketServer as WSServer } from 'ws';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export interface WSMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface WSClient {
  id: string;
  ws: WebSocket;
  isAlive: boolean;
  subscriptions: Set<string>;
  metadata: any;
}

export class WebSocketServer extends EventEmitter {
  private wss: WSServer | null = null;
  private clients: Map<string, WSClient> = new Map();
  private port: number;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(port: number) {
    super();
    this.port = port;
  }

  /**
   * 启动 WebSocket 服务器
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WSServer({ port: this.port });
        
        this.wss.on('listening', () => {
          logger.info(`WebSocket server started on port ${this.port}`);
          this.startHeartbeat();
          resolve();
        });
        
        this.wss.on('connection', (ws: WebSocket, req) => {
          this.handleConnection(ws, req);
        });
        
        this.wss.on('error', (error) => {
          logger.error('WebSocket server error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 处理新连接
   */
  private handleConnection(ws: WebSocket, req: any): void {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const client: WSClient = {
      id: clientId,
      ws,
      isAlive: true,
      subscriptions: new Set(),
      metadata: {
        connectedAt: new Date(),
        remoteAddress: req.socket.remoteAddress
      }
    };
    
    this.clients.set(clientId, client);
    
    logger.info(`Client connected: ${clientId} (${this.clients.size} total)`);
    
    // 发送欢迎消息
    this.sendToClient(clientId, {
      type: 'connected',
      data: {
        clientId,
        serverTime: new Date().toISOString()
      },
      timestamp: Date.now()
    });
    
    // 设置消息处理器
    ws.on('message', (data) => {
      this.handleMessage(clientId, data);
    });
    
    // 处理 pong 响应
    ws.on('pong', () => {
      const client = this.clients.get(clientId);
      if (client) {
        client.isAlive = true;
      }
    });
    
    // 处理断开连接
    ws.on('close', () => {
      this.handleDisconnection(clientId);
    });
    
    // 处理错误
    ws.on('error', (error) => {
      logger.error(`Client ${clientId} error:`, error);
    });
    
    this.emit('clientConnected', clientId);
  }

  /**
   * 处理客户端消息
   */
  private handleMessage(clientId: string, data: WebSocket.Data): void {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      
      logger.debug(`Message from ${clientId}: ${message.type}`);
      
      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(clientId, message.data);
          break;
        
        case 'unsubscribe':
          this.handleUnsubscribe(clientId, message.data);
          break;
        
        case 'ping':
          this.sendToClient(clientId, {
            type: 'pong',
            data: { timestamp: Date.now() },
            timestamp: Date.now()
          });
          break;
        
        case 'getStatus':
          this.handleGetStatus(clientId);
          break;
        
        default:
          logger.warn(`Unknown message type: ${message.type}`);
      }
      
      this.emit('message', clientId, message);
    } catch (error) {
      logger.error(`Failed to handle message from ${clientId}:`, error);
    }
  }

  /**
   * 处理订阅请求
   */
  private handleSubscribe(clientId: string, topics: string[]): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    topics.forEach(topic => {
      client.subscriptions.add(topic);
    });
    
    logger.info(`Client ${clientId} subscribed to: ${topics.join(', ')}`);
    
    this.sendToClient(clientId, {
      type: 'subscribed',
      data: { topics },
      timestamp: Date.now()
    });
  }

  /**
   * 处理取消订阅请求
   */
  private handleUnsubscribe(clientId: string, topics: string[]): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    topics.forEach(topic => {
      client.subscriptions.delete(topic);
    });
    
    logger.info(`Client ${clientId} unsubscribed from: ${topics.join(', ')}`);
    
    this.sendToClient(clientId, {
      type: 'unsubscribed',
      data: { topics },
      timestamp: Date.now()
    });
  }

  /**
   * 处理状态查询
   */
  private handleGetStatus(clientId: string): void {
    this.sendToClient(clientId, {
      type: 'status',
      data: {
        connectedClients: this.clients.size,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      },
      timestamp: Date.now()
    });
  }

  /**
   * 处理断开连接
   */
  private handleDisconnection(clientId: string): void {
    this.clients.delete(clientId);
    logger.info(`Client disconnected: ${clientId} (${this.clients.size} remaining)`);
    this.emit('clientDisconnected', clientId);
  }

  /**
   * 发送消息到指定客户端
   */
  sendToClient(clientId: string, message: WSMessage): boolean {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error(`Failed to send to client ${clientId}:`, error);
      return false;
    }
  }

  /**
   * 广播消息到所有客户端
   */
  broadcast(type: string, data: any, topic?: string): void {
    const message: WSMessage = {
      type,
      data,
      timestamp: Date.now()
    };
    
    let sentCount = 0;
    
    this.clients.forEach((client, clientId) => {
      // 如果指定了 topic，只发送给订阅了该 topic 的客户端
      if (topic && !client.subscriptions.has(topic)) {
        return;
      }
      
      if (this.sendToClient(clientId, message)) {
        sentCount++;
      }
    });
    
    logger.debug(`Broadcast ${type} to ${sentCount} clients`);
  }

  /**
   * 启动心跳检测
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          logger.info(`Client ${clientId} timeout, terminating`);
          client.ws.terminate();
          this.clients.delete(clientId);
          return;
        }
        
        client.isAlive = false;
        client.ws.ping();
      });
    }, 30000); // 30秒
  }

  /**
   * 停止 WebSocket 服务器
   */
  async stop(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // 关闭所有客户端连接
    this.clients.forEach((client) => {
      client.ws.close(1000, 'Server shutting down');
    });
    this.clients.clear();
    
    // 关闭服务器
    if (this.wss) {
      return new Promise((resolve) => {
        this.wss!.close(() => {
          logger.info('WebSocket server stopped');
          resolve();
        });
      });
    }
  }

  /**
   * 获取连接的客户端数量
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * 获取所有客户端信息
   */
  getClients(): Array<{ id: string; subscriptions: string[]; metadata: any }> {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      subscriptions: Array.from(client.subscriptions),
      metadata: client.metadata
    }));
  }
}
