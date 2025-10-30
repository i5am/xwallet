/**
 * REST API 路由
 */

import { Router } from 'express';
import { nodeRouter } from './node.routes';
import { transactionRouter } from './transaction.routes';
import { committeeRouter } from './committee.routes';

export const apiRouter = Router();

// 节点管理 API
apiRouter.use('/nodes', nodeRouter);

// 交易验证 API
apiRouter.use('/transactions', transactionRouter);

// 委员会管理 API
apiRouter.use('/committee', committeeRouter);

// API 信息
apiRouter.get('/', (req, res) => {
  res.json({
    name: 'CRVA Backend API',
    version: '1.0.0',
    endpoints: {
      nodes: '/api/nodes',
      transactions: '/api/transactions',
      committee: '/api/committee'
    }
  });
});
