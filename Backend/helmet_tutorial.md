# Complete Helmet.js Tutorial

## What is Helmet?

Helmet is a security middleware for Express.js applications that helps secure your app by setting various HTTP headers. It's essentially a collection of 15 smaller middleware functions that set security-related HTTP response headers.

## Why Use Helmet?

### Security Benefits:
1. **Prevents XSS attacks** by setting Content Security Policy
2. **Prevents clickjacking** with X-Frame-Options
3. **Enforces HTTPS** with Strict Transport Security
4. **Prevents MIME type sniffing** attacks
5. **Hides server information** from attackers
6. **Prevents DNS prefetching** in certain scenarios

### Common Vulnerabilities Helmet Prevents:
- Cross-Site Scripting (XSS)
- Clickjacking
- MIME Type Sniffing
- Information Disclosure
- Insecure HTTP connections

## When to Use Helmet?

**Always use Helmet in production applications!**

### Specific Use Cases:
- **Web Applications**: Any Express app serving web content
- **APIs**: REST APIs handling sensitive data
- **E-commerce Sites**: Payment processing applications
- **User Authentication Systems**: Login/registration systems
- **Content Management Systems**: Blog platforms, admin panels

## Installation

```bash
npm install helmet
```

## Basic Usage

### Simple Implementation
```javascript
import express from 'express';
import helmet from 'helmet';

const app = express();

// Use helmet with default settings
app.use(helmet());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000);
```

## Helmet Middleware Components

Helmet includes these security middlewares by default:

### 1. Content Security Policy (CSP)
**Purpose**: Prevents XSS attacks by controlling resource loading

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 2. X-Frame-Options
**Purpose**: Prevents clickjacking attacks

```javascript
app.use(helmet({
  frameguard: { action: 'deny' } // or 'sameorigin'
}));
```

### 3. Strict Transport Security (HSTS)
**Purpose**: Enforces HTTPS connections

```javascript
app.use(helmet({
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));
```

### 4. X-Content-Type-Options
**Purpose**: Prevents MIME type sniffing

```javascript
app.use(helmet({
  noSniff: true
}));
```

### 5. Referrer Policy
**Purpose**: Controls referrer information

```javascript
app.use(helmet({
  referrerPolicy: { policy: "same-origin" }
}));
```

## Advanced Configuration

### Custom Configuration Example
```javascript
import helmet from 'helmet';

app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      blockAllMixedContent: [],
      fontSrc: ["'self'", "https:", "data:"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: true,
  
  // Cross Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },
  
  // Cross Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Frame Guard (Clickjacking protection)
  frameguard: { action: "deny" },
  
  // Hide Powered By header
  hidePoweredBy: true,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // Don't sniff MIME types
  noSniff: true,
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Permitted Cross Domain Policies
  permittedCrossDomainPolicies: false,
  
  // Referrer Policy
  referrerPolicy: { policy: "no-referrer" },
  
  // X-XSS-Protection (legacy)
  xssFilter: true,
}));
```

### Disabling Specific Middlewares
```javascript
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP
  frameguard: false, // Disable X-Frame-Options
}));
```

## Real-World Examples

### 1. Blog Application Setup
```javascript
import express from 'express';
import helmet from 'helmet';

const app = express();

// Blog-specific helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  }
}));
```

### 2. API-Only Application
```javascript
// For APIs, you might want simpler configuration
app.use(helmet({
  contentSecurityPolicy: false, // Not needed for APIs
  crossOriginEmbedderPolicy: false,
}));
```

### 3. Development vs Production
```javascript
const isDevelopment = process.env.NODE_ENV === 'development';

app.use(helmet({
  contentSecurityPolicy: !isDevelopment, // Disable CSP in development
  hsts: !isDevelopment, // No HTTPS enforcement in development
}));
```

## Testing Helmet Implementation

### 1. Check Headers in Browser
Open Developer Tools → Network tab → Refresh page → Check response headers

### 2. Using curl
```bash
curl -I http://localhost:3000
```

### 3. Online Security Scanners
- Mozilla Observatory
- Security Headers checker
- Qualys SSL Labs

## Common Issues and Solutions

### 1. Content Security Policy Blocking Resources
**Problem**: External resources not loading
**Solution**: Update CSP directives
```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "https://your-cdn.com"],
    scriptSrc: ["'self'", "https://trusted-scripts.com"],
  },
}
```

### 2. HSTS in Development
**Problem**: HTTPS enforcement in local development
**Solution**: Disable HSTS in development
```javascript
hsts: process.env.NODE_ENV === 'production'
```

### 3. Frame Options Breaking Embeds
**Problem**: Cannot embed your site in iframes
**Solution**: Configure frame options appropriately
```javascript
frameguard: { action: 'sameorigin' } // Instead of 'deny'
```

## Best Practices

### 1. Start with Default Settings
```javascript
app.use(helmet()); // Good starting point
```

### 2. Gradually Customize
- Test with default settings first
- Add custom configurations incrementally
- Test each change thoroughly

### 3. Environment-Specific Configuration
```javascript
const helmetConfig = {
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  hsts: process.env.NODE_ENV === 'production',
};

app.use(helmet(helmetConfig));
```

### 4. Regular Security Audits
- Use online security scanners monthly
- Keep helmet updated
- Review CSP reports regularly

### 5. Documentation
- Document any custom configurations
- Explain why specific settings were chosen
- Keep security requirements updated

## Headers Set by Helmet

When you use `app.use(helmet())`, these headers are automatically added:

```
Content-Security-Policy: default-src 'self'
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
X-DNS-Prefetch-Control: off
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
Origin-Agent-Cluster: ?1
X-Permitted-Cross-Domain-Policies: none
Referrer-Policy: no-referrer
X-XSS-Protection: 0
```

## Conclusion

Helmet is essential for any Express.js application handling user data or operating in production. It provides a simple way to implement multiple security best practices with minimal configuration. Start with default settings and customize based on your specific needs.

Remember: Security is not a one-time setup but an ongoing process. Regularly review and update your security configurations!