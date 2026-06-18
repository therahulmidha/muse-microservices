import { config } from 'dotenv';
config();
import express, { Request, Response } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth.middleware';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { validateRequestBody } from './middleware/validator';
import { loginSchema } from './validators/auth.validators';
import { logger } from './utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { httpRequestCounter, register } from './utils/prometheus';
import  http from 'http';
import  cors from 'cors';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 10 secs // 15 * 60 * 1000, // 1 mins
  max: 30, // max 100 requests per IP
  message: 'Too many requests, please try later',
  skip: (req, res) => req.ip === '127.0.0.1' 
  // OR (req, res) => process.env.NODE_ENV === 'test'
});

const app = express();
app.use(cors());
const server = http.createServer(app);

const wsProxy = createProxyMiddleware({
  target: process.env.CUSTOMER_SERVICE_URL ||'ws://localhost:3005',
  changeOrigin: true,
  ws: true,
});

app.use('/socket', wsProxy);
server.on('upgrade', wsProxy.upgrade);

// for revealing which instance handled the request; useful for debugging
app.use((_, res, next) => {
  res.setHeader(
    'X-Gateway-Instance',
    process.env.PORT || '3000'
  );

  next();
})

// check nginx headers
app.get('/headers', (req, res) => {
  res.json(req.headers);
});

app.use(limiter);
app.use(helmet());

app.use((req: any, res, next) => {
  req.correlationId = uuidv4();
  next();
});

// Basic Request Logging
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url
  }, 'API Gateway Incoming request');
  next();
});
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello API Gateway'});
});
app.use(express.json());


// Middleware
app.use((req: any, res, next) => {
  res.on('finish', () => {
    const requestId = uuidv4();
    const start = Date.now();

    req.requestId = requestId;

    logger.info({
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: Date.now() - start,
      service: "gateway"
    });
    httpRequestCounter.inc({
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
    });
  });
  next();
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});


// Auth Service
// stricter rate limit for login
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50
});

app.use('/auth/login', /* authLimiter ,*/ validateRequestBody(loginSchema));

/**
 * Auth Service Proxy
 */
app.use(createProxyMiddleware({
  pathFilter: '/auth', 
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  // pathRewrite: { '^/auth': '' }, // Strips /auth from the request
  on: {
    proxyReq: (proxyReq, req, res) => {
      const request = req as any;
      proxyReq.setHeader('x-correlation-id', request.correlationId);
      fixRequestBody(proxyReq, req);   // FIX: Re-streams req.body to target
    },
  }
}));

app.use(createProxyMiddleware({
  pathFilter: '/ai/health', 
  target: process.env.AI_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      const request = req as any;
      if (request.user) {
        proxyReq.setHeader('x-user-id', request.user.userId);
      }

      proxyReq.setHeader('x-correlation-id', request.correlationId);
      fixRequestBody(proxyReq, req);
    }
  }
}));

app.use(authMiddleware);

/**
 * Journal Service Proxy
 */
app.use(createProxyMiddleware({
  pathFilter: '/journal', 
  target: process.env.JOURNAL_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  // pathRewrite: { '^/journal': '' }, // Strips /journal
  on: {
    proxyReq: (proxyReq, req, res) => {
      const request = req as any;
      if (request.user) {
        proxyReq.setHeader('x-user-id', request.user.userId);
      }

      proxyReq.setHeader('x-correlation-id', request.correlationId);
      fixRequestBody(proxyReq, req);   // FIX: Re-streams req.body to target
    }
  }
}));

// app.post('/ai/chat', async (req, res) => {
//   const response = await axios.post('http://ai-service:8000/ai/chat', req.body);
//   res.json(response.data);
// });

// FOR AI Service
// Admin auth
// File size limit
// PDF validation
// rate limit

app.use(createProxyMiddleware({
  pathFilter: '/ai/chat', 
  target: process.env.AI_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      const request = req as any;
      if (request.user) {
        proxyReq.setHeader('x-user-id', request.user.userId);
      }

      proxyReq.setHeader('x-correlation-id', request.correlationId);
      fixRequestBody(proxyReq, req);
    }
  }
}));

app.use(createProxyMiddleware({
  pathFilter: '/ai/upload', 
  target: process.env.AI_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      const request = req as any;
      if (request.user) {
        proxyReq.setHeader('x-user-id', request.user.userId);
      }

      proxyReq.setHeader('x-correlation-id', request.correlationId);
      fixRequestBody(proxyReq, req);
    }
  }
}));




server.listen(parseInt(process.env.PORT ?? '3000'), '127.0.0.1', () => {
  logger.info(`API Gateway running on port ${process.env.PORT ?? '3000'}`);
});