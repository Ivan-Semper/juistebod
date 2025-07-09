# JuisteBod.nl – Professional Web Application

Een **enterprise-level** webapplicatie voor **JuisteBod.nl**: een dienst die woningzoekers helpt een beter bod te doen met professioneel advies binnen 24 uur.

---

## 🚀 Project Overview

### ✅ **Voltooid**
- [x] **Next.js 15.3.5** setup met TypeScript & Tailwind CSS v4
- [x] **Complete Landing Page** met responsive design
- [x] **Professional Backend Architecture**
- [x] **Multi-Domain Web Scraping** (Funda + Jaap)
- [x] **Enterprise-level Error Handling**
- [x] **Rate Limiting & Security**
- [x] **Structured Logging System**
- [x] **Performance Monitoring**
- [x] **Request Validation & Sanitization**

---

## 🏗️ **Professional Backend Architecture**

### **📁 Backend Structure**
```
📁 lib/
├── 📁 config/
│   └── app.config.ts          # Centralized configuration
├── 📁 services/
│   └── ScrapingService.ts     # Enhanced scraping with retry logic
├── 📁 middleware/
│   └── validation.middleware.ts # Request validation & rate limiting
├── 📁 utils/
│   ├── logger.ts              # Professional logging system
│   └── linkValidator.ts       # URL validation utilities
├── 📁 types/
│   └── PropertyTypes.ts       # TypeScript interfaces
└── 📁 hooks/
    └── useFundaScraper.ts     # React hook for frontend
```

### **🔧 Backend Features**

#### **1. Configuration Management**
- Centralized app configuration
- Environment-based settings
- Rate limiting configuration
- Security policies

#### **2. Professional Logging**
- Structured logging with log levels
- Colored console output
- Performance metrics
- Request tracing with UUID
- Error stack traces

#### **3. Request Validation & Security**
- Input validation & sanitization
- Rate limiting (100 req/15min per IP)
- Error handling with detailed responses
- Security headers (CORS, etc.)

#### **4. Enhanced Scraping Service**
- Multi-domain support (Funda + Jaap)
- Retry logic with exponential backoff
- Timeout handling
- Performance monitoring
- Detailed error codes

#### **5. Performance Monitoring**
- Request duration tracking
- Active request counting
- Success/failure metrics
- Retry attempt logging

---

## 🎯 **API Documentation**

### **POST /api/scrape-funda**
Professional property scraping endpoint.

**Request:**
```json
{
  "url": "https://www.funda.nl/koop/amsterdam/huis-12345678-address/"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://www.funda.nl/...",
    "title": "Mooie woning in Amsterdam",
    "address": "Keizersgracht 123, Amsterdam",
    "price": "€ 750.000",
    "propertyType": "Appartement",
    "surface": "95 m²",
    "rooms": "4 kamers",
    "yearBuilt": "1995",
    "images": ["https://..."],
    "description": "Prachtige woning...",
    "features": ["Balkon", "Lift", "..."],
    "scrapedAt": "2024-01-01T12:00:00.000Z"
  },
  "metadata": {
    "requestId": "uuid-123",
    "duration": 1250,
    "attempts": 1,
    "scrapedAt": "2024-01-01T12:00:00.000Z",
    "processingTime": 1500
  }
}
```

**Error Response (400/404/429/500):**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Request validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": [
    {
      "field": "url",
      "message": "Invalid URL format",
      "code": "INVALID_URL_FORMAT"
    }
  ],
  "metadata": {
    "requestId": "uuid-123",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "processingTime": 50
  }
}
```

### **GET /api/scrape-funda**
API status and configuration info.

---

## 🔧 **Technical Specifications**

### **Supported Domains**
- `funda.nl` / `www.funda.nl`
- `jaap.nl` / `www.jaap.nl`

### **Rate Limiting**
- 100 requests per 15 minutes per IP
- Automatic retry with exponential backoff
- 3 attempts max per request
- 30-second timeout per attempt

### **Security Features**
- Input validation & sanitization
- CORS configuration
- Rate limiting
- Error message sanitization
- Request ID tracking

### **Performance**
- Response caching (5 minutes)
- Concurrent request limiting
- Performance profiling
- Request duration tracking

---

## 🚀 **Development**

### **Start Development Server**
```bash
npm run dev
```

### **Test API Endpoint**
```bash
curl -X POST http://localhost:3000/api/scrape-funda \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.funda.nl/koop/amsterdam/huis-12345678-address/"}'
```

### **Environment Variables**
```env
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 📊 **Logging Examples**

### **Successful Request**
```
[2024-01-01T12:00:00.000Z] INFO  Starting property scraping | url: https://funda.nl/... | req:uuid-123
[2024-01-01T12:00:01.250Z] INFO  Property scraping successful | 1250ms | req:uuid-123
[2024-01-01T12:00:01.500Z] INFO  POST /api/scrape-funda 200 | 1500ms | req:uuid-123
```

### **Failed Request with Retry**
```
[2024-01-01T12:00:00.000Z] INFO  Starting property scraping | url: https://funda.nl/... | req:uuid-456
[2024-01-01T12:00:05.000Z] WARN  Scrape retry 1/3 | url: https://funda.nl/... | req:uuid-456
[2024-01-01T12:00:10.000Z] WARN  Scrape retry 2/3 | url: https://funda.nl/... | req:uuid-456
[2024-01-01T12:00:15.000Z] ERROR Scrape failed | 15000ms | req:uuid-456
```

---

## 📦 **Tech Stack**

### **Backend**
- **Framework:** Next.js 15.3.5 + TypeScript
- **Scraping:** Cheerio + Enhanced Fetch
- **Logging:** Custom structured logging
- **Validation:** Custom middleware
- **Security:** Rate limiting, CORS, input validation

### **Frontend**
- **Framework:** Next.js 15.3.5 + React
- **Styling:** Tailwind CSS v4
- **State Management:** React Hooks
- **Forms:** Custom form handling

### **DevOps**
- **Deployment:** Vercel (recommended)
- **Monitoring:** Built-in performance monitoring
- **Logging:** Console + File logging (production)

---

## 🎨 **Design System**

### **Color Palette**
- **Primary:** `#1F3C88` (Dark Blue)
- **Accent:** `#7C8471` (Olive Green)
- **Background:** `#FAF9F6` (Off-white)

### **Typography**
- **Font:** Inter (Modern Sans-serif)
- **Style:** Clean, professional, Muji/Apple inspired

---

## 🔮 **Next Steps**

- [ ] **Database Integration** (PostgreSQL/Supabase)
- [ ] **User Authentication** (NextAuth.js)
- [ ] **Payment Integration** (Mollie/Stripe)
- [ ] **Email Service** (Resend/SendGrid)
- [ ] **Map Integration** (Leaflet/Google Maps)
- [ ] **Admin Dashboard**
- [ ] **Real-time Updates** (WebSockets)
- [ ] **Testing Suite** (Jest + Cypress)

---

*Built with ❤️ for professional property advice*
