# Complete Express Rate Limiting Tutorial

## What is Rate Limiting?

Rate limiting is a technique used to control the number of requests a client can make to your server within a specific time window. It's a crucial security and performance measure that prevents abuse and ensures fair resource usage.

## Why Use Rate Limiting?

### Security Benefits:
1. **Prevents Brute Force Attacks** - Limits login attempts
2. **Stops DDoS Attacks** - Mitigates distributed attacks
3. **Prevents API Abuse** - Controls automated scraping
4. **Resource Protection** - Prevents server overload

### Performance Benefits:
1. **Server Stability** - Maintains consistent performance
2. **Fair Usage** - Ensures equal access for all users
3. **Cost Control** - Reduces infrastructure costs
4. **Better User Experience** - Prevents server crashes

## When to Use Rate Limiting?

### Essential Use Cases:
- **Authentication Endpoints** - Login/register routes
- **Password Reset** - Prevents spam abuse
- **API Endpoints** - All public APIs
- **Contact Forms** - Prevents spam submissions
- **Search Functionality** - Prevents resource exhaustion
- **File Uploads** - Controls bandwidth usage

### Business Scenarios:
- **E-commerce**: Prevent cart abandonment attacks
- **Social Media**: Limit posting frequency
- **Financial Apps**: Secure transaction endpoints
- **SaaS Platforms**: Tier-based usage limits

## Installation

```bash
npm install express-rate-limit
```

## Basic Usage

### Simple Rate Limiting
```javascript
import express from 'express';
import rateLimit from 'express-rate-limit';

const app = express();

// Create rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply to all requests
app.use(limiter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000);
```

## Configuration Options

### Complete Configuration Object
```javascript
const limiter = rateLimit({
  // Time window in milliseconds
  windowMs: 15 * 60 * 1000, // 15 minutes
  
  // Maximum number of requests per window
  max: 100,
  
  // Custom message when limit exceeded
  message: {
    error: 'Too many requests',
    retryAfter: 15 * 60 // seconds
  },
  
  // Custom status code (default: 429)
  statusCode: 429,
  
  // Custom headers
  headers: true,
  
  // Skip successful requests
  skipSuccessfulRequests: false,
  
  // Skip failed requests
  skipFailedRequests: false,
  
  // Custom key generator (default: IP address)
  keyGenerator: (req) => req.ip,
  
  // Custom skip function
  skip: (req) => req.ip === '127.0.0.1',
  
  // Custom handler when limit exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  },
  
  // Custom store (default: memory store)
  store: new rateLimit.MemoryStore(),
  
  // Validation for max
  validate: true,
  
  // Standard headers
  standardHeaders: true,
  
  // Legacy headers (X-RateLimit-*)
  legacyHeaders: false,
});
```

## Different Rate Limiting Strategies

### 1. Global Rate Limiting
```javascript
// Apply to all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Global limit
});

app.use(globalLimiter);
```

### 2. Route-Specific Rate Limiting
```javascript
// Strict limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
});

// Apply only to auth routes
app.use('/api/auth', authLimiter);

// Moderate limit for API routes
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
});

app.use('/api', apiLimiter);
```

### 3. User-Based Rate Limiting
```javascript
// Rate limit based on user ID instead of IP
const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  keyGenerator: (req) => {
    // Use user ID if authenticated, fallback to IP
    return req.user?.id || req.ip;
  },
});
```

### 4. Dynamic Rate Limiting
```javascript
// Different limits based on user type
const dynamicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    if (req.user?.isPremium) {
      return 1000; // Premium users get higher limit
    }
    if (req.user?.isAuthenticated) {
      return 200; // Authenticated users
    }
    return 50; // Anonymous users
  },
});
```

## Advanced Configurations

### 1. Multiple Rate Limiters
```javascript
// Create different limiters for different purposes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts',
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'API rate limit exceeded',
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Upload limit exceeded',
});

// Apply to specific routes
app.use('/api/auth/login', authLimiter);
app.use('/api', apiLimiter);
app.use('/api/upload', uploadLimiter);
```

### 2. Custom Error Handling
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res, next, options) => {
    const resetTime = new Date(Date.now() + options.windowMs);
    
    res.status(options.statusCode).json({
      error: {
        message: 'Rate limit exceeded',
        type: 'RATE_LIMIT_ERROR',
        details: {
          limit: options.max,
          window: options.windowMs,
          resetTime: resetTime.toISOString(),
        }
      }
    });
  },
});
```

### 3. Custom Key Generation
```javascript
// Rate limit by user session
const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    // Use session ID for authenticated users
    if (req.session?.id) {
      return `session:${req.session.id}`;
    }
    // Use API key if present
    if (req.headers['x-api-key']) {
      return `api:${req.headers['x-api-key']}`;
    }
    // Fallback to IP
    return req.ip;
  },
});
```

## Store Options

### 1. Memory Store (Default)
```javascript
import { MemoryStore } from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new MemoryStore(), // Default, no configuration needed
});
```

### 2. Redis Store
```javascript
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  host: 'localhost',
  port: 6379,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
});
```

### 3. MongoDB Store
```javascript
import MongoStore from 'rate-limit-mongo';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new MongoStore({
    uri: 'mongodb://localhost:27017/myapp',
    collectionName: 'rate_limits',
    expireTimeMs: 15 * 60 * 1000,
  }),
});
```

## Real-World Implementation Examples

### 1. Complete Blog API Rate Limiting
```javascript
import express from 'express';
import rateLimit from 'express-rate-limit';

const app = express();

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes globally
  message: 'Too many requests, please slow down',
});

// Auth rate limiter (very strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    error: 'Too many authentication attempts',
    retryAfter: 15 * 60,
  },
});

// API rate limiter (moderate)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'API rate limit exceeded',
});

// Upload rate limiter (very strict)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Upload limit exceeded, try again later',
});

// Apply limiters
app.use(globalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
app.use('/api/upload', uploadLimiter);

// Routes
app.post('/api/auth/login', (req, res) => {
  // Login logic
  res.json({ message: 'Login successful' });
});

app.get('/api/posts', (req, res) => {
  // Get posts logic
  res.json({ posts: [] });
});

app.post('/api/upload', (req, res) => {
  // Upload logic
  res.json({ message: 'Upload successful' });
});
```

### 2. E-commerce API Rate Limiting
```javascript
// Different limits for different user tiers
const createTieredLimiter = () => {
  return rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: (req) => {
      const userTier = req.user?.tier || 'free';
      const limits = {
        free: 10,      // 10 requests per minute
        basic: 30,     // 30 requests per minute
        premium: 100,  // 100 requests per minute
        enterprise: 500 // 500 requests per minute
      };
      return limits[userTier];
    },
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
    handler: (req, res) => {
      const userTier = req.user?.tier || 'free';
      res.status(429).json({
        error: 'Rate limit exceeded',
        currentTier: userTier,
        upgradeMessage: userTier === 'free' ? 
          'Upgrade to Basic for higher limits' : null
      });
    },
  });
};

app.use('/api/products', createTieredLimiter());
```

### 3. Social Media API Rate Limiting
```javascript
// Different limits for different actions
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 posts per hour
  keyGenerator: (req) => req.user.id,
  message: 'Posting limit exceeded. Please wait before posting again.',
});

const followLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 follows per hour
  keyGenerator: (req) => req.user.id,
  message: 'Follow limit exceeded. Please wait before following more users.',
});

const likeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 likes per 15 minutes
  keyGenerator: (req) => req.user.id,
});

app.post('/api/posts', postLimiter, (req, res) => {
  // Create post logic
});

app.post('/api/follow', followLimiter, (req, res) => {
  // Follow user logic
});

app.post('/api/like', likeLimiter, (req, res) => {
  // Like post logic
});
```

## Testing Rate Limiting

### 1. Manual Testing with curl
```bash
# Test rate limiting
for i in {1..10}; do
  curl -i http://localhost:3000/api/test
  sleep 1
done
```

### 2. Load Testing with Artillery
```yaml
# artillery-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "Test rate limiting"
    requests:
      - get:
          url: "/api/test"
```

### 3. Unit Testing with Jest
```javascript
// rate-limit.test.js
import request from 'supertest';
import app from '../app.js';

describe('Rate Limiting', () => {
  test('should allow requests within limit', async () => {
    const response = await request(app)
      .get('/api/test')
      .expect(200);
    
    expect(response.headers['x-ratelimit-remaining']).toBeDefined();
  });

  test('should block requests exceeding limit', async () => {
    // Make requests up to the limit
    for (let i = 0; i < 100; i++) {
      await request(app).get('/api/test');
    }
    
    // This should be blocked
    const response = await request(app)
      .get('/api/test')
      .expect(429);
    
    expect(response.body.error).toContain('Rate limit exceeded');
  });
});
```

## Monitoring and Analytics

### 1. Custom Logging
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res, next, options) => {
    // Log rate limit violations
    console.log(`Rate limit exceeded for ${req.ip} on ${req.path}`);
    
    // You could also send to analytics service
    analytics.track('rate_limit_exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });
    
    res.status(429).json({ error: 'Rate limit exceeded' });
  },
});
```

### 2. Metrics Collection
```javascript
// Track rate limit metrics
let rateLimitMetrics = {
  totalRequests: 0,
  limitExceeded: 0,
  uniqueIPs: new Set(),
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  onLimitReached: (req, res, options) => {
    rateLimitMetrics.limitExceeded++;
    rateLimitMetrics.uniqueIPs.add(req.ip);
  },
});

// Middleware to track all requests
app.use((req, res, next) => {
  rateLimitMetrics.totalRequests++;
  next();
});

// Endpoint to get metrics
app.get('/metrics', (req, res) => {
  res.json({
    ...rateLimitMetrics,
    uniqueIPCount: rateLimitMetrics.uniqueIPs.size,
  });
});
```

## Best Practices

### 1. Layer Your Defenses
```javascript
// Multiple layers of rate limiting
app.use(globalLimiter);           // Global protection
app.use('/api', apiLimiter);      // API-specific limits
app.use('/api/auth', authLimiter); // Authentication limits
```

### 2. Use Different Stores for Different Environments
```javascript
const store = process.env.NODE_ENV === 'production' 
  ? new RedisStore({ /* Redis config */ })
  : new MemoryStore();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store,
});
```

### 3. Graceful Error Messages
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    const resetTime = new Date(Date.now() + 15 * 60 * 1000);
    
    res.status(429).json({
      error: {
        message: 'Too many requests. Please slow down.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 900, // seconds
        resetTime: resetTime.toISOString(),
        documentation: 'https://api.yoursite.com/docs/rate-limits'
      }
    });
  },
});
```

### 4. Whitelist Important IPs
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => {
    const whitelist = ['127.0.0.1', '::1', '192.168.1.100'];
    return whitelist.includes(req.ip);
  },
});
```

### 5. Environment-Specific Configuration
```javascript
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 10000 : 100, // Higher limit in development
  skip: isDevelopment ? () => true : undefined, // Skip in development
  store: isProduction ? redisStore : memoryStore,
});
```

## Common Pitfalls and Solutions

### 1. Rate Limiting Behind Proxies
```javascript
// Trust proxy to get real IP addresses
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  // The IP will now be correctly identified
});
```

### 2. Memory Leaks with Memory Store
```javascript
// Use Redis for production to avoid memory issues
const store = process.env.NODE_ENV === 'production'
  ? new RedisStore(redisConfig)
  : new MemoryStore();
```

### 3. Rate Limiting WebSocket Connections
```javascript
// Rate limit WebSocket handshakes
const wsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 connections per minute per IP
  message: 'Too many WebSocket connection attempts',
});

// Apply to WebSocket upgrade requests
server.on('upgrade', wsLimiter, (request, socket, head) => {
  // WebSocket upgrade logic
});
```

## Performance Considerations

### 1. Store Performance Comparison
```javascript
// Memory Store: Fast but not scalable
// - Pros: Very fast, no network latency
// - Cons: Doesn't work with multiple servers, memory usage grows

// Redis Store: Balanced performance and scalability
// - Pros: Scales across servers, persistent
// - Cons: Network latency, requires Redis server

// MongoDB Store: Good for existing MongoDB setups
// - Pros: Uses existing database, queries possible
// - Cons: Slower than Redis, more complex queries
```

### 2. Optimizing Rate Limiter Performance
```javascript
// Use efficient key generation
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    // Avoid expensive operations in key generation
    return req.ip; // Simple and fast
  },
  
  // Skip unnecessary checks
  skip: (req) => {
    // Quick checks first
    if (req.method === 'GET' && req.path === '/health') {
      return true;
    }
    return false;
  },
});
```

## Security Considerations

### 1. Preventing Rate Limit Bypass
```javascript
// Multiple layers of identification
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    // Combine multiple identifiers
    const identifiers = [
      req.ip,
      req.get('User-Agent'),
      req.get('X-Forwarded-For'),
    ].filter(Boolean);
    
    return crypto
      .createHash('sha256')
      .update(identifiers.join('|'))
      .digest('hex');
  },
});
```

### 2. Handling Distributed Attacks
```javascript
// Sliding window with burst protection
const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  
  // Additional burst protection
  standardHeaders: true,
  legacyHeaders: false,
  
  // Custom handler for attack detection
  handler: (req, res) => {
    // Log potential attack
    console.warn(`Potential attack from ${req.ip}: ${req.path}`);
    
    // Could trigger additional security measures
    // like temporary IP blocking
    
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Please slow down your requests',
    });
  },
});
```

## Integration with Other Middleware

### 1. Rate Limiting with Authentication
```javascript
import jwt from 'jsonwebtoken';

// Middleware to extract user info
const extractUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // Invalid token, continue without user
    }
  }
  next();
};

// Rate limiter that considers authentication
const smartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    if (req.user?.role === 'admin') return 1000;
    if (req.user?.isPremium) return 500;
    if (req.user) return 200;
    return 50; // Anonymous users
  },
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
});

// Apply middleware in order
app.use(extractUser);
app.use('/api', smartLimiter);
```

### 2. Rate Limiting with CORS
```javascript
import cors from 'cors';

// Apply CORS before rate limiting
app.use(cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true,
}));

// Rate limiting after CORS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  // CORS headers are already set
});

app.use(limiter);
```

### 3. Rate Limiting with Caching
```javascript
// Skip rate limiting for cached responses
const cacheMiddleware = (req, res, next) => {
  const cacheKey = `cache:${req.path}:${JSON.stringify(req.query)}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    // Mark as cached to skip rate limiting
    req.fromCache = true;
    return res.json(cached);
  }
  
  next();
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.fromCache, // Skip cached responses
});

app.use('/api/data', cacheMiddleware, limiter);
```

## Deployment Considerations

### 1. Load Balancer Configuration
```javascript
// When using load balancers, ensure sticky sessions
// or use distributed store like Redis

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new RedisStore({
    // Redis configuration for shared state
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  }),
});
```

### 2. Health Check Exclusions
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => {
    // Skip health checks and monitoring
    const healthPaths = ['/health', '/status', '/ping', '/metrics'];
    return healthPaths.includes(req.path);
  },
});
```

### 3. Graceful Degradation
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  
  // Graceful handling of store errors
  onLimitReached: (req, res, options) => {
    console.log('Rate limit reached for', req.ip);
  },
  
  // Skip rate limiting if store is down
  skip: (req, res) => {
    try {
      // Test store connectivity
      return !store.isConnected();
    } catch (error) {
      console.error('Rate limit store error:', error);
      return true; // Skip rate limiting if store fails
    }
  },
});
```

## Monitoring and Alerting

### 1. Rate Limit Monitoring Dashboard
```javascript
// Collect metrics for monitoring
const rateLimitMetrics = {
  requests: 0,
  blocked: 0,
  topIPs: new Map(),
  topPaths: new Map(),
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  
  // Track all requests
  onRequest: (req, res, options) => {
    rateLimitMetrics.requests++;
    
    // Track top IPs
    const ipCount = rateLimitMetrics.topIPs.get(req.ip) || 0;
    rateLimitMetrics.topIPs.set(req.ip, ipCount + 1);
    
    // Track top paths
    const pathCount = rateLimitMetrics.topPaths.get(req.path) || 0;
    rateLimitMetrics.topPaths.set(req.path, pathCount + 1);
  },
  
  // Track blocked requests
  handler: (req, res, options) => {
    rateLimitMetrics.blocked++;
    
    // Send alert if too many blocks
    if (rateLimitMetrics.blocked > 100) {
      sendAlert('High rate limit violations detected');
    }
    
    res.status(429).json({ error: 'Rate limit exceeded' });
  },
});

// Metrics endpoint
app.get('/admin/rate-limit-metrics', (req, res) => {
  res.json({
    ...rateLimitMetrics,
    topIPs: Array.from(rateLimitMetrics.topIPs.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    topPaths: Array.from(rateLimitMetrics.topPaths.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
  });
});
```

### 2. Automated Alerting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  
  handler: (req, res, options) => {
    // Check for potential attacks
    const suspiciousActivity = {
      rapidFireRequests: rateLimitMetrics.blocked > 50,
      singleIPAbuse: rateLimitMetrics.topIPs.get(req.ip) > 1000,
      unusualPaths: req.path.includes('..') || req.path.includes('admin'),
    };
    
    if (Object.values(suspiciousActivity).some(Boolean)) {
      // Send immediate alert
      sendSecurityAlert({
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        suspiciousActivity,
        timestamp: new Date().toISOString(),
      });
    }
    
    res.status(429).json({ error: 'Rate limit exceeded' });
  },
});

function sendSecurityAlert(details) {
  // Send to security monitoring system
  console.error('SECURITY ALERT:', details);
  
  // Could integrate with services like:
  // - Slack notifications
  // - Email alerts
  // - PagerDuty
  // - Security information systems
}
```

## Advanced Use Cases

### 1. Geographic Rate Limiting
```javascript
import geoip from 'geoip-lite';

const geoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    const geo = geoip.lookup(req.ip);
    
    // Different limits by country
    if (geo?.country === 'US') return 200;
    if (geo?.country === 'CA') return 150;
    if (['GB', 'DE', 'FR'].includes(geo?.country)) return 100;
    
    return 50; // Default for other countries
  },
  
  keyGenerator: (req) => {
    const geo = geoip.lookup(req.ip);
    return `${req.ip}:${geo?.country || 'unknown'}`;
  },
});
```

### 2. Time-based Rate Limiting
```javascript
const timeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    const hour = new Date().getHours();
    
    // Business hours (9 AM - 5 PM): higher limits
    if (hour >= 9 && hour <= 17) {
      return 200;
    }
    
    // Off hours: lower limits
    return 50;
  },
});
```

### 3. Feature Flag Integration
```javascript
import featureFlags from './featureFlags.js';

const adaptiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    // Check feature flags for dynamic limits
    if (featureFlags.isEnabled('strict-rate-limiting')) {
      return 50; // Strict mode
    }
    
    if (featureFlags.isEnabled('relaxed-rate-limiting')) {
      return 500; // Relaxed mode
    }
    
    return 100; // Default
  },
  
  skip: (req) => {
    // Skip rate limiting if disabled via feature flag
    return featureFlags.isEnabled('disable-rate-limiting');
  },
});
```

## Conclusion

Express Rate Limiting is a critical security and performance tool that should be implemented in every production application. Key takeaways:

### Essential Points:
1. **Always implement rate limiting** in production environments
2. **Use different limits** for different types of endpoints
3. **Choose the right store** based on your architecture
4. **Monitor and alert** on rate limit violations
5. **Test thoroughly** to ensure proper functionality

### Implementation Strategy:
1. Start with basic global rate limiting
2. Add route-specific limits for sensitive endpoints
3. Implement user-based limiting for authenticated routes
4. Set up monitoring and alerting
5. Optimize based on real-world usage patterns

### Security Best Practices:
- Layer multiple rate limiters
- Use distributed stores in production
- Monitor for suspicious patterns
- Implement graceful error handling
- Regular security audits and updates

Remember: Rate limiting is not just about preventing abuse—it's about ensuring your application remains available and performant for all legitimate users.