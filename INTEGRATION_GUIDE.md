# Angels Care CRM Integration Guide

**Complete Technical Documentation for Website Integration**

This comprehensive guide provides everything you need to integrate the Angels Care CRM with any website, landing page, or web application to capture, score, assign, and manage insurance leads automatically.

---

## 📋 Table of Contents

1. [🚀 CRM Deployment & Setup](#-crm-deployment--setup)
2. [Overview & Architecture](#overview--architecture)
3. [API Endpoints](#api-endpoints)
4. [Data Structure & Field Specifications](#data-structure--field-specifications)
5. [Basic Integration Examples](#basic-integration-examples)
6. [Advanced Integration Methods](#advanced-integration-methods)
7. [Lead Processing Pipeline](#lead-processing-pipeline)
8. [Response Handling & Error Management](#response-handling--error-management)
9. [Security & Best Practices](#security--best-practices)
10. [Testing & Debugging](#testing--debugging)
11. [Analytics & Tracking](#analytics--tracking)
12. [Platform-Specific Integrations](#platform-specific-integrations)
13. [Troubleshooting & Support](#troubleshooting--support)

---

## 🚀 CRM Deployment & Setup

**IMPORTANT: Complete this section first before attempting any website integrations**

This section covers how to deploy your CRM and get it ready for production use. After deployment, you'll get the API endpoints that websites can integrate with.

---

### 📋 Prerequisites

Before deploying your CRM, ensure you have:

- [ ] **Node.js 18+** installed locally
- [ ] **Git** repository access
- [ ] **PostgreSQL database** (can be created during deployment)
- [ ] **Email service** for notifications (optional initially)
- [ ] **Domain name** for production (optional initially)

### 🌐 Quick Start: Deploy to Netlify (Recommended)

**Netlify is the fastest way to get your CRM live and production-ready.**

#### Step 1: Prepare Your Repository
```bash
# Clone your repository (if not already local)
git clone https://github.com/antony0531/angels-care-crm.git
cd angels-care-crm

# Install dependencies
npm install

# Test local build
npm run build
```

#### Step 2: Deploy to Netlify
1. **Visit [netlify.com](https://netlify.com) and sign up/login**
2. **Click "Add new site" → "Import an existing project"**
3. **Connect your GitHub repository**
4. **Configure build settings:**
   ```
   Build command: npm run build
   Publish directory: .next
   ```
5. **Click "Deploy site"**

#### Step 3: Configure Environment Variables
In your Netlify dashboard, go to **Site settings → Environment variables** and add:

```env
# Database Configuration (Required)
DATABASE_URL=postgresql://username:password@host:port/database

# Supabase Authentication (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=GA-XXXXXXXXXX

# Optional: Notification Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Step 4: Set Up Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

#### Step 5: Get Your API Endpoints
After deployment, your CRM will be available at:
```
🌐 Dashboard: https://your-site-name.netlify.app
📡 Webhook API: https://your-site-name.netlify.app/api/webhooks/form-submission
🚀 Enhanced API: https://your-site-name.netlify.app/api/leads
```

### 🔧 Alternative: Deploy to Vercel

**Vercel offers excellent performance and is optimized for Next.js applications.**

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
# From your project directory
vercel login
vercel --prod

# Follow prompts to configure:
# - Project name
# - Environment variables
# - Domain settings
```

#### Step 3: Configure Environment Variables
```bash
# Add environment variables via CLI
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Or use Vercel dashboard at vercel.com
```

### 🏗️ Alternative: Self-Hosted Deployment

**For maximum control and customization.**

#### Step 1: Prepare Server
```bash
# Ubuntu/Debian example
sudo apt update
sudo apt install nodejs npm nginx postgresql

# Install PM2 for process management
npm install -g pm2
```

#### Step 2: Build and Deploy
```bash
# Clone and build
git clone https://github.com/antony0531/angels-care-crm.git
cd angels-care-crm
npm install
npm run build

# Start with PM2
pm2 start npm --name "angels-care-crm" -- start
pm2 save
pm2 startup
```

#### Step 3: Configure Nginx
```nginx
# /etc/nginx/sites-available/angels-care-crm
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 4: SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### 🗄️ Database Setup

#### Option A: Supabase (Recommended)
1. **Visit [supabase.com](https://supabase.com) and create account**
2. **Create new project**
3. **Get connection details from Settings → Database**
4. **Use the provided PostgreSQL connection string**

#### Option B: Railway
1. **Visit [railway.app](https://railway.app) and sign up**
2. **Create new project → Add PostgreSQL**
3. **Copy connection string from Variables tab**

#### Option C: Local PostgreSQL
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE angels_care_crm;
CREATE USER crm_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE angels_care_crm TO crm_user;
\q

# Connection string format:
# postgresql://crm_user:secure_password@localhost:5432/angels_care_crm
```

### 🔐 Security Configuration

#### Essential Security Settings
```env
# Strong session secrets
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# API rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=3600000

# CORS settings
ALLOWED_ORIGINS=https://trusted-website1.com,https://trusted-website2.com
```

#### Database Security
```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'readonly_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Create limited user for API endpoints
CREATE USER api_user WITH PASSWORD 'api_password';
GRANT SELECT, INSERT, UPDATE ON leads TO api_user;
GRANT SELECT ON lead_statuses, lead_sources TO api_user;
```

---

### 🧪 Testing Your Deployment

#### Step 1: Health Check
```bash
# Test basic connectivity
curl https://your-deployed-domain.com

# Should return HTML page or redirect to login
```

#### Step 2: API Endpoint Test
```bash
# Test webhook endpoint
curl -X POST https://your-deployed-domain.com/api/webhooks/form-submission \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "phone": "555-123-4567",
    "planType": "Medicare",
    "source": "Deployment Test"
  }'

# Expected response:
# {"success": true, "message": "Lead created successfully", "leadId": "..."}
```

#### Step 3: Dashboard Access Test
1. **Visit your deployed domain**
2. **Log in with your credentials**
3. **Navigate to Leads → All Leads**
4. **Verify test lead appears in the list**
5. **Check lead scoring and assignment worked**

#### Step 4: Database Verification
```bash
# Connect to your database
psql $DATABASE_URL

# Check tables exist
\dt

# Verify test data
SELECT * FROM leads WHERE email = 'test@example.com';
```

---

### ⚙️ Initial CRM Configuration

#### Step 1: Access Settings Dashboard
1. **Log into your CRM at your deployed URL**
2. **Navigate to Leads → Settings**
3. **Configure each section systematically**

#### Step 2: Configure Lead Statuses
```json
// Default lead statuses to configure:
[
  {"name": "NEW", "color": "blue", "order": 1, "isDefault": true},
  {"name": "CONTACTED", "color": "yellow", "order": 2},
  {"name": "QUALIFIED", "color": "purple", "order": 3},
  {"name": "QUOTED", "color": "orange", "order": 4},
  {"name": "CONVERTED", "color": "green", "order": 5},
  {"name": "LOST", "color": "red", "order": 6}
]
```

#### Step 3: Set Up Lead Sources
```json
// Default lead sources to configure:
[
  {"name": "Website", "color": "blue", "order": 1},
  {"name": "Google Ads", "color": "green", "order": 2},
  {"name": "Facebook Ads", "color": "purple", "order": 3},
  {"name": "Referral", "color": "yellow", "order": 4},
  {"name": "Direct Mail", "color": "orange", "order": 5},
  {"name": "Phone Call", "color": "gray", "order": 6}
]
```

#### Step 4: Configure Scoring Rules
```json
// Recommended scoring configuration:
[
  {"action": "form_submitted", "points": 10, "order": 1},
  {"action": "phone_provided", "points": 15, "order": 2},
  {"action": "high_value_insurance", "points": 20, "order": 3},
  {"action": "quick_form_completion", "points": 5, "order": 4},
  {"action": "multiple_pages_viewed", "points": 8, "order": 5},
  {"action": "long_session_duration", "points": 12, "order": 6},
  {"action": "premium_landing_page", "points": 10, "order": 7},
  {"action": "high_intent_source", "points": 8, "order": 8},
  {"action": "utm_campaign", "points": 5, "order": 9}
]
```

#### Step 5: Set Up Agent Assignment Rules
```json
// Example assignment rules:
[
  {
    "name": "High-Score Medicare Leads",
    "conditions": [
      {"field": "scorePercentage", "operator": "greater_equal", "value": 80},
      {"field": "insuranceType", "operator": "in", "value": ["MEDICARE_ADVANTAGE", "SUPPLEMENT"]}
    ],
    "assignTo": "senior-agent-id",
    "priority": 100
  },
  {
    "name": "Life Insurance Specialist",
    "conditions": [
      {"field": "insuranceType", "operator": "equals", "value": "LIFE_INSURANCE"}
    ],
    "assignTo": "life-specialist-id",
    "priority": 90
  }
]
```

#### Step 6: Configure Notifications
```json
// Notification settings:
{
  "emailNotifications": true,
  "smsNotifications": true,
  "webhookNotifications": false,
  "instantAlerts": true,
  "dailyDigest": true,
  "notificationEmail": "sales@yourcompany.com",
  "smsNumber": "+1234567890",
  "webhookUrl": "https://your-external-system.com/webhook"
}
```

---

### 📱 Go-Live Checklist

Before sharing your CRM with websites for integration:

#### Technical Checklist
- [ ] **CRM deployed and accessible** at production URL
- [ ] **Database connected** and schema deployed
- [ ] **Environment variables** configured correctly
- [ ] **API endpoints responding** to test requests
- [ ] **SSL certificate** installed and working
- [ ] **Error monitoring** set up (optional but recommended)

#### Configuration Checklist
- [ ] **Lead statuses** configured and tested
- [ ] **Lead sources** set up for tracking
- [ ] **Scoring rules** configured and yielding expected scores
- [ ] **Assignment rules** created and tested
- [ ] **Notification preferences** configured
- [ ] **User accounts** created for sales team
- [ ] **Dashboard permissions** set correctly

#### Integration Checklist
- [ ] **API endpoints documented** with your actual domain
- [ ] **Test integration** completed successfully
- [ ] **Sample forms** tested and working
- [ ] **Error handling** verified
- [ ] **Response times** acceptable (<500ms)
- [ ] **Rate limiting** configured appropriately

#### Business Checklist
- [ ] **Sales team trained** on CRM dashboard
- [ ] **Lead response procedures** documented
- [ ] **Escalation procedures** established
- [ ] **Performance metrics** defined
- [ ] **Backup procedures** in place
- [ ] **Support contact** information available

---

### 🚀 Your CRM is Now Production Ready!

Once you've completed this setup section:

✅ **Your CRM is deployed and accessible**  
✅ **API endpoints are live and functional**  
✅ **Database is configured and ready**  
✅ **Initial settings are configured**  
✅ **Integration testing is complete**  

**Next Step:** Share your API endpoints with websites that want to integrate. They can use the rest of this guide to implement forms that send leads to your CRM.

**Your Integration URLs:**
```
🔗 Webhook API: https://your-domain.com/api/webhooks/form-submission
🚀 Enhanced API: https://your-domain.com/api/leads
📊 CRM Dashboard: https://your-domain.com/login
```

---

## 📊 Overview & Architecture

### System Architecture
The Angels Care CRM provides a sophisticated lead capture and management system with the following components:

```
Website Form → API Gateway → Lead Processing Pipeline → CRM Dashboard
     ↓              ↓                ↓                    ↓
 User Input → Validation & → Scoring → Assignment → Notifications → Agent Dashboard
              Storage        Engine    Engine      System      Real-time Updates
```

### Key Features
- **Intelligent Lead Scoring**: 0-100% scoring based on 9+ configurable criteria
- **Automatic Agent Assignment**: Rule-based distribution with specialization matching
- **Multi-Channel Notifications**: Email, SMS, Webhook, and In-App alerts
- **Real-Time Dashboard Updates**: Instant lead visibility for sales teams
- **Complete Audit Trail**: Full tracking of lead lifecycle and interactions
- **UTM & Analytics Integration**: Marketing attribution and conversion tracking

### Technical Stack
- **API**: RESTful endpoints with JSON payloads
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth (optional for webhook endpoints)
- **Real-Time**: WebSocket connections for live updates
- **Validation**: Server-side validation with detailed error responses

---

## 🔗 API Endpoints

### Primary Webhook Endpoint
```
POST https://your-crm-domain.com/api/webhooks/form-submission
Content-Type: application/json
Accept: application/json
```

**Purpose**: Optimized for external form submissions with lightweight processing

**Features**:
- Fast response times (<200ms)
- Basic lead creation and storage
- Event logging for audit trails
- Insurance type mapping
- Duplicate email detection

### Enhanced Lead API Endpoint
```
POST https://your-crm-domain.com/api/leads
Content-Type: application/json
Accept: application/json
```

**Purpose**: Full-featured lead processing with advanced automation

**Features**:
- Complete lead scoring algorithm
- Intelligent agent assignment
- Multi-channel notifications
- Advanced validation
- Marketing attribution tracking
- Session analytics integration

### Endpoint Selection Guide

| Use Case | Recommended Endpoint | Reason |
|----------|---------------------|--------|
| High-volume landing pages | `/api/webhooks/form-submission` | Faster response, lighter processing |
| Premium lead forms | `/api/leads` | Full automation, scoring, assignment |
| A/B testing scenarios | `/api/webhooks/form-submission` | Consistent baseline performance |
| CRM integration | `/api/leads` | Complete feature set |

---

## 📊 Data Structure & Field Specifications

### Minimum Required Fields
```json
{
  "email": "customer@email.com",
  "firstName": "John"
}
```

### Complete Field Specification

```json
{
  // REQUIRED FIELDS
  "email": "john.doe@email.com",
  "firstName": "John",
  
  // CONTACT INFORMATION
  "lastName": "Doe",
  "phone": "555-123-4567",
  "dateOfBirth": "1975-06-15",
  "zipCode": "90210",
  
  // INSURANCE DETAILS
  "planType": "Medicare",
  "currentInsurance": "Blue Cross Blue Shield",
  "monthlyBudget": 300,
  "healthConditions": ["diabetes", "high blood pressure"],
  "dependents": 1,
  
  // LEAD TRACKING
  "source": "Google Ads - Medicare Campaign",
  "notes": "Interested in Medicare Advantage plans with dental coverage",
  "priority": "HIGH",
  "status": "NEW",
  
  // MARKETING ATTRIBUTION
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "medicare-advantage-2024",
  "utmTerm": "medicare plans california",
  "utmContent": "ad-variant-a",
  "referrer": "https://www.google.com/",
  
  // BEHAVIORAL DATA
  "landingPage": "/medicare-advantage-plans",
  "sessionDuration": 420,
  "pagesViewed": 5,
  "formCompletionTime": 180,
  "deviceType": "desktop",
  "browserInfo": "Chrome 120.0.0.0 - Windows",
  
  // GEOGRAPHIC DATA
  "city": "Los Angeles",
  "state": "CA",
  "country": "US",
  "timezone": "America/Los_Angeles",
  
  // METADATA
  "customFields": {
    "formVersion": "v2.1",
    "sessionId": "sess_1234567890",
    "experimentGroup": "variant-b"
  },
  "tags": ["high-intent", "medicare", "california"],
  "estimatedValue": 2500
}
```

### Field Validation Rules

#### Email Validation
```javascript
// Regex pattern for email validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Additional validation
function validateEmail(email) {
  if (!email) return { valid: false, error: 'Email is required' };
  if (email.length > 255) return { valid: false, error: 'Email too long' };
  if (!emailPattern.test(email)) return { valid: false, error: 'Invalid email format' };
  
  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = email.split('@')[1];
  const suggestions = {
    'gmail.co': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com'
  };
  
  if (suggestions[domain]) {
    return { 
      valid: true, 
      suggestion: email.replace(domain, suggestions[domain]),
      warning: `Did you mean ${suggestions[domain]}?`
    };
  }
  
  return { valid: true };
}
```

#### Phone Number Validation
```javascript
// Phone number validation and formatting
function validateAndFormatPhone(phone) {
  if (!phone) return { valid: true, formatted: null };
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Check length
  if (digits.length < 10) {
    return { valid: false, error: 'Phone number must be at least 10 digits' };
  }
  
  if (digits.length > 15) {
    return { valid: false, error: 'Phone number too long' };
  }
  
  // Format US numbers
  if (digits.length === 10) {
    const formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return { valid: true, formatted };
  }
  
  // International format
  if (digits.length === 11 && digits[0] === '1') {
    const formatted = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return { valid: true, formatted };
  }
  
  return { valid: true, formatted: '+' + digits };
}
```

#### Name Validation
```javascript
function validateName(name, fieldName) {
  if (!name) {
    if (fieldName === 'firstName') {
      return { valid: false, error: 'First name is required' };
    }
    return { valid: true };
  }
  
  if (name.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }
  
  if (name.length > 50) {
    return { valid: false, error: `${fieldName} must be less than 50 characters` };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const namePattern = /^[a-zA-Z\s\-\']+$/;
  if (!namePattern.test(name)) {
    return { valid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }
  
  return { valid: true, formatted: name.trim() };
}
```

---

## 🏥 Insurance Plan Type Mapping & Scoring

The CRM automatically maps various input formats to standardized insurance types:

| Input Values | CRM Type | Scoring Weight | Assignment Priority |
|-------------|----------|----------------|--------------------|
| "Medicare", "MEDICARE", "Medicare Advantage" | `MEDICARE_ADVANTAGE` | High (20 pts) | Senior Specialists |
| "ACA", "ACA_PLANS", "Obamacare", "Health" | `ACA_PLANS` | Medium (15 pts) | General Agents |
| "Supplement", "Medigap", "Medicare Supplement" | `SUPPLEMENT` | High (18 pts) | Medicare Specialists |
| "Part D", "PART_D", "Prescription" | `PART_D` | Medium (12 pts) | Medicare Specialists |
| "Life", "LIFE_INSURANCE", "Term Life" | `LIFE_INSURANCE` | High (20 pts) | Life Insurance Specialists |
| "Auto", "AUTO_INSURANCE", "Car Insurance" | `AUTO_INSURANCE` | Low (8 pts) | General Agents |
| "Home", "HOME_INSURANCE", "Homeowners" | `HOME_INSURANCE` | Medium (10 pts) | Property Specialists |
| "Dental", "Vision", "Short Term" | `OTHER` | Low (5 pts) | General Agents |

---

## 🚀 Basic Integration Examples

### Example 1: Simple HTML Form Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insurance Quote Request</title>
    <style>
        .lead-form {
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        .submit-btn {
            background-color: #007cba;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }
        .submit-btn:hover {
            background-color: #005a87;
        }
        .submit-btn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .form-status {
            margin-top: 15px;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .loading {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
    </style>
</head>
<body>
    <form id="leadForm" class="lead-form">
        <h2>Get Your Free Insurance Quote</h2>
        
        <div class="form-group">
            <label for="email">Email Address *</label>
            <input type="email" id="email" name="email" required 
                   placeholder="john.doe@email.com">
        </div>
        
        <div class="form-group">
            <label for="firstName">First Name *</label>
            <input type="text" id="firstName" name="firstName" required 
                   placeholder="John">
        </div>
        
        <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" name="lastName" 
                   placeholder="Doe">
        </div>
        
        <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" 
                   placeholder="(555) 123-4567">
        </div>
        
        <div class="form-group">
            <label for="planType">Insurance Type</label>
            <select id="planType" name="planType">
                <option value="">Select Insurance Type</option>
                <option value="Medicare">Medicare Advantage</option>
                <option value="ACA">ACA Health Plans</option>
                <option value="Life Insurance">Life Insurance</option>
                <option value="Supplement">Medicare Supplement</option>
                <option value="Auto Insurance">Auto Insurance</option>
                <option value="Home Insurance">Home Insurance</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="zipCode">ZIP Code</label>
            <input type="text" id="zipCode" name="zipCode" 
                   placeholder="12345" pattern="[0-9]{5}">
        </div>
        
        <button type="submit" class="submit-btn" id="submitBtn">
            Get My Free Quote
        </button>
        
        <div id="formStatus" class="form-status" style="display: none;"></div>
    </form>

    <script>
        // Configuration
        const CRM_CONFIG = {
            apiEndpoint: 'https://your-crm-domain.com/api/webhooks/form-submission',
            source: 'Homepage Quote Form',
            redirectUrl: '/thank-you.html',
            trackingEnabled: true
        };

        // Session tracking
        let sessionStartTime = Date.now();
        let pageViewCount = 1;

        // Track page views (simple implementation)
        if (sessionStorage.getItem('pageViews')) {
            pageViewCount = parseInt(sessionStorage.getItem('pageViews')) + 1;
        }
        sessionStorage.setItem('pageViews', pageViewCount.toString());

        // Form submission handler
        document.getElementById('leadForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const statusDiv = document.getElementById('formStatus');
            
            // Disable form and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            showStatus('Submitting your request...', 'loading');
            
            try {
                // Collect form data
                const formData = new FormData(e.target);
                const leadData = Object.fromEntries(formData);
                
                // Add tracking data
                const enrichedData = {
                    ...leadData,
                    source: CRM_CONFIG.source,
                    landingPage: window.location.pathname,
                    sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000),
                    pagesViewed: pageViewCount,
                    formCompletionTime: Math.floor((Date.now() - sessionStartTime) / 1000),
                    deviceType: getDeviceType(),
                    browserInfo: getBrowserInfo(),
                    referrer: document.referrer,
                    // UTM parameters
                    utmSource: getUrlParameter('utm_source'),
                    utmMedium: getUrlParameter('utm_medium'),
                    utmCampaign: getUrlParameter('utm_campaign'),
                    utmTerm: getUrlParameter('utm_term'),
                    utmContent: getUrlParameter('utm_content')
                };
                
                // Remove empty values
                Object.keys(enrichedData).forEach(key => {
                    if (enrichedData[key] === '' || enrichedData[key] === null || enrichedData[key] === undefined) {
                        delete enrichedData[key];
                    }
                });
                
                console.log('Submitting lead data:', enrichedData);
                
                // Submit to CRM
                const response = await fetch(CRM_CONFIG.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(enrichedData)
                });
                
                const responseData = await response.json();
                
                if (response.ok) {
                    // Success
                    showStatus('Thank you! We\'ll contact you within 15 minutes.', 'success');
                    
                    // Track conversion
                    if (CRM_CONFIG.trackingEnabled) {
                        trackConversion(enrichedData);
                    }
                    
                    // Redirect after delay
                    setTimeout(() => {
                        window.location.href = CRM_CONFIG.redirectUrl;
                    }, 3000);
                    
                } else {
                    // API error
                    const errorMessage = responseData.error || 'Please check your information and try again.';
                    showStatus(`Error: ${errorMessage}`, 'error');
                    resetForm();
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                showStatus('Network error. Please check your connection and try again.', 'error');
                resetForm();
            }
        });
        
        // Utility functions
        function showStatus(message, type) {
            const statusDiv = document.getElementById('formStatus');
            statusDiv.textContent = message;
            statusDiv.className = `form-status ${type}`;
            statusDiv.style.display = 'block';
        }
        
        function resetForm() {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Get My Free Quote';
        }
        
        function getUrlParameter(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        }
        
        function getDeviceType() {
            const userAgent = navigator.userAgent.toLowerCase();
            if (/tablet|ipad|playbook|silk/.test(userAgent)) {
                return 'tablet';
            } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
                return 'mobile';
            }
            return 'desktop';
        }
        
        function getBrowserInfo() {
            return navigator.userAgent;
        }
        
        function trackConversion(leadData) {
            // Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'form_name': 'insurance_quote',
                    'plan_type': leadData.planType,
                    'source': leadData.source
                });
            }
            
            // Facebook Pixel
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead', {
                    content_name: 'Insurance Quote Request',
                    content_category: leadData.planType,
                    value: 100, // Estimated lead value
                    currency: 'USD'
                });
            }
            
            // Custom tracking
            console.log('Conversion tracked:', leadData);
        }
    </script>
</body>
</html>
```

### Example 2: AJAX Form with Progressive Enhancement

```html
<!-- Progressive Enhancement Form -->
<form id="progressiveLeadForm" action="/fallback-handler" method="POST" class="progressive-form">
    <fieldset>
        <legend>Contact Information</legend>
        
        <div class="input-group">
            <input type="email" name="email" id="prog-email" required 
                   placeholder="Email Address" 
                   autocomplete="email"
                   aria-describedby="email-error">
            <div id="email-error" class="error-message" role="alert"></div>
        </div>
        
        <div class="input-row">
            <div class="input-group half">
                <input type="text" name="firstName" id="prog-firstName" required 
                       placeholder="First Name" 
                       autocomplete="given-name"
                       aria-describedby="firstName-error">
                <div id="firstName-error" class="error-message" role="alert"></div>
            </div>
            <div class="input-group half">
                <input type="text" name="lastName" id="prog-lastName" 
                       placeholder="Last Name" 
                       autocomplete="family-name">
            </div>
        </div>
        
        <div class="input-group">
            <input type="tel" name="phone" id="prog-phone" 
                   placeholder="Phone Number" 
                   autocomplete="tel"
                   pattern="[0-9\s\(\)\-\+\.]{10,}">
        </div>
    </fieldset>
    
    <fieldset>
        <legend>Insurance Information</legend>
        
        <div class="input-group">
            <select name="planType" id="prog-planType" 
                    aria-describedby="planType-help">
                <option value="">What type of insurance are you looking for?</option>
                <option value="Medicare">Medicare Advantage</option>
                <option value="ACA">ACA Health Plans</option>
                <option value="Life Insurance">Life Insurance</option>
                <option value="Supplement">Medicare Supplement</option>
                <option value="Auto Insurance">Auto Insurance</option>
                <option value="Home Insurance">Home Insurance</option>
            </select>
            <div id="planType-help" class="help-text">Select the insurance type you're most interested in</div>
        </div>
        
        <div class="input-row">
            <div class="input-group half">
                <input type="text" name="zipCode" id="prog-zipCode" 
                       placeholder="ZIP Code" 
                       pattern="[0-9]{5}" 
                       maxlength="5">
            </div>
            <div class="input-group half">
                <input type="number" name="monthlyBudget" id="prog-budget" 
                       placeholder="Monthly Budget" 
                       min="0" max="10000" step="50">
            </div>
        </div>
    </fieldset>
    
    <div class="form-actions">
        <button type="submit" class="primary-btn" id="prog-submit">
            <span class="btn-text">Get Free Quote</span>
            <span class="btn-loader" style="display: none;">⏳</span>
        </button>
        
        <div class="trust-indicators">
            <small>🔒 Your information is secure and will not be shared</small>
        </div>
    </div>
    
    <div id="prog-status" class="form-status" role="status" aria-live="polite"></div>
</form>

<script>
(function() {
    'use strict';
    
    // Configuration
    const config = {
        apiEndpoint: 'https://your-crm-domain.com/api/leads', // Using enhanced API
        source: 'Progressive Form - Homepage',
        fallbackAction: '/fallback-handler',
        validation: {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\+]?[1-9][\d\s\(\)\-\.]{8,}$/,
            zipCode: /^[0-9]{5}$/
        }
    };
    
    // Form elements
    const form = document.getElementById('progressiveLeadForm');
    const submitBtn = document.getElementById('prog-submit');
    const statusDiv = document.getElementById('prog-status');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // State management
    let isSubmitting = false;
    let sessionData = {
        startTime: Date.now(),
        interactions: [],
        validationErrors: 0
    };
    
    // Initialize form
    initializeForm();
    
    function initializeForm() {
        // Remove default action to prevent fallback submission
        form.removeAttribute('action');
        
        // Add real-time validation
        addValidationListeners();
        
        // Add submission handler
        form.addEventListener('submit', handleSubmit);
        
        // Track user interactions
        trackUserBehavior();
    }
    
    function addValidationListeners() {
        const fields = ['email', 'firstName', 'phone', 'zipCode'];
        
        fields.forEach(fieldName => {
            const field = document.getElementById(`prog-${fieldName}`);
            if (field) {
                field.addEventListener('blur', () => validateField(fieldName));
                field.addEventListener('input', () => clearFieldError(fieldName));
            }
        });
    }
    
    function validateField(fieldName) {
        const field = document.getElementById(`prog-${fieldName}`);
        const errorDiv = document.getElementById(`${fieldName}-error`);
        const value = field.value.trim();
        
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'email':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Email address is required';
                } else if (!config.validation.email.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
                
            case 'firstName':
                if (!value) {
                    isValid = false;
                    errorMessage = 'First name is required';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'First name must be at least 2 characters';
                }
                break;
                
            case 'phone':
                if (value && !config.validation.phone.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
                
            case 'zipCode':
                if (value && !config.validation.zipCode.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid 5-digit ZIP code';
                }
                break;
        }
        
        if (errorDiv) {
            if (isValid) {
                errorDiv.textContent = '';
                field.classList.remove('error');
                field.classList.add('valid');
            } else {
                errorDiv.textContent = errorMessage;
                field.classList.add('error');
                field.classList.remove('valid');
                sessionData.validationErrors++;
            }
        }
        
        return isValid;
    }
    
    function clearFieldError(fieldName) {
        const field = document.getElementById(`prog-${fieldName}`);
        const errorDiv = document.getElementById(`${fieldName}-error`);
        
        if (errorDiv && errorDiv.textContent) {
            field.classList.remove('error');
            errorDiv.textContent = '';
        }
    }
    
    function validateForm() {
        const requiredFields = ['email', 'firstName'];
        const optionalFields = ['phone', 'zipCode'];
        let isValid = true;
        
        // Validate required fields
        requiredFields.forEach(fieldName => {
            if (!validateField(fieldName)) {
                isValid = false;
            }
        });
        
        // Validate optional fields if they have values
        optionalFields.forEach(fieldName => {
            const field = document.getElementById(`prog-${fieldName}`);
            if (field && field.value.trim()) {
                if (!validateField(fieldName)) {
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }
    
    async function handleSubmit(e) {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        // Validate form
        if (!validateForm()) {
            showStatus('Please correct the errors above', 'error');
            return;
        }
        
        isSubmitting = true;
        setLoadingState(true);
        
        try {
            // Collect form data
            const formData = new FormData(form);
            const leadData = Object.fromEntries(formData);
            
            // Enrich with session data
            const enrichedData = {
                ...leadData,
                source: config.source,
                landingPage: window.location.pathname,
                sessionDuration: Math.floor((Date.now() - sessionData.startTime) / 1000),
                formCompletionTime: Math.floor((Date.now() - sessionData.startTime) / 1000),
                pagesViewed: getPageViewCount(),
                deviceType: getDeviceType(),
                browserInfo: getBrowserInfo(),
                referrer: document.referrer,
                validationErrors: sessionData.validationErrors,
                userInteractions: sessionData.interactions.length,
                // UTM parameters
                utmSource: getUrlParameter('utm_source'),
                utmMedium: getUrlParameter('utm_medium'),
                utmCampaign: getUrlParameter('utm_campaign'),
                utmTerm: getUrlParameter('utm_term'),
                utmContent: getUrlParameter('utm_content'),
                // Custom tracking
                customFields: {
                    formVersion: 'progressive-v1.2',
                    sessionId: getSessionId(),
                    timestamp: new Date().toISOString()
                }
            };
            
            console.log('Submitting enhanced lead data:', enrichedData);
            
            // Submit to CRM API
            const response = await submitWithRetry(enrichedData, 3);
            
            if (response.success) {
                showStatus('🎉 Thank you! A specialist will contact you within 15 minutes.', 'success');
                
                // Track successful conversion
                trackConversion(enrichedData, response.leadId);
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = '/thank-you?leadId=' + response.leadId;
                }, 3000);
                
            } else {
                throw new Error(response.error || 'Submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            showStatus('Sorry, there was a problem submitting your request. Please try again.', 'error');
            
            // Restore form for retry
            setLoadingState(false);
            isSubmitting = false;
        }
    }
    
    async function submitWithRetry(data, maxRetries) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(config.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const responseData = await response.json();
                
                if (response.ok) {
                    return responseData;
                } else if (response.status >= 400 && response.status < 500) {
                    // Client error - don't retry
                    throw new Error(responseData.error || `HTTP ${response.status}`);
                } else {
                    // Server error - retry
                    throw new Error(`Server error: ${response.status}`);
                }
                
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
            }
        }
    }
    
    function setLoadingState(loading) {
        submitBtn.disabled = loading;
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline';
            submitBtn.classList.add('loading');
        } else {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            submitBtn.classList.remove('loading');
        }
    }
    
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `form-status ${type}`;
        statusDiv.style.display = 'block';
        
        // Scroll to status message
        statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    function trackUserBehavior() {
        // Track form interactions
        const formFields = form.querySelectorAll('input, select, textarea');
        
        formFields.forEach(field => {
            field.addEventListener('focus', () => {
                sessionData.interactions.push({
                    type: 'focus',
                    field: field.name,
                    timestamp: Date.now()
                });
            });
            
            field.addEventListener('change', () => {
                sessionData.interactions.push({
                    type: 'change',
                    field: field.name,
                    value: field.type === 'password' ? '[hidden]' : field.value,
                    timestamp: Date.now()
                });
            });
        });
    }
    
    function trackConversion(leadData, leadId) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'generate_lead', {
                'currency': 'USD',
                'value': 150, // Estimated lead value
                'lead_id': leadId,
                'insurance_type': leadData.planType,
                'source': leadData.source
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: 'Insurance Quote - Progressive Form',
                content_category: leadData.planType,
                value: 150,
                currency: 'USD',
                lead_id: leadId
            });
        }
        
        // Google Ads Conversion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
                'value': 150,
                'currency': 'USD',
                'transaction_id': leadId
            });
        }
    }
    
    // Utility functions
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    function getPageViewCount() {
        return parseInt(sessionStorage.getItem('pageViews') || '1');
    }
    
    function getDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/tablet|ipad/.test(userAgent)) return 'tablet';
        if (/mobile|iphone|android/.test(userAgent)) return 'mobile';
        return 'desktop';
    }
    
    function getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        
        return browser + ' - ' + navigator.platform;
    }
    
    function getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }
    
})();
</script>

<style>
.progressive-form {
    max-width: 600px;
    margin: 0 auto;
    padding: 30px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.progressive-form fieldset {
    border: none;
    padding: 0;
    margin: 0 0 25px 0;
}

.progressive-form legend {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
    color: #333;
}

.input-group {
    margin-bottom: 20px;
}

.input-row {
    display: flex;
    gap: 15px;
}

.input-group.half {
    flex: 1;
}

.input-group input,
.input-group select {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 6px;
    font-size: 16px;
    transition: border-color 0.3s ease;
}

.input-group input:focus,
.input-group select:focus {
    outline: none;
    border-color: #007cba;
    box-shadow: 0 0 0 3px rgba(0, 124, 186, 0.1);
}

.input-group input.valid {
    border-color: #28a745;
}

.input-group input.error {
    border-color: #dc3545;
}

.error-message {
    color: #dc3545;
    font-size: 14px;
    margin-top: 5px;
    display: block;
}

.help-text {
    color: #6c757d;
    font-size: 14px;
    margin-top: 5px;
}

.form-actions {
    text-align: center;
    margin-top: 30px;
}

.primary-btn {
    background: linear-gradient(135deg, #007cba 0%, #005a87 100%);
    color: white;
    border: none;
    padding: 14px 40px;
    border-radius: 6px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    max-width: 300px;
}

.primary-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 124, 186, 0.3);
}

.primary-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

.primary-btn.loading {
    background: #6c757d;
}

.trust-indicators {
    margin-top: 15px;
    color: #6c757d;
}

.form-status {
    margin-top: 20px;
    padding: 15px;
    border-radius: 6px;
    text-align: center;
    font-weight: 500;
}

.form-status.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.form-status.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

@media (max-width: 600px) {
    .progressive-form {
        padding: 20px;
        margin: 20px;
    }
    
    .input-row {
        flex-direction: column;
        gap: 0;
    }
    
    .input-group.half {
        margin-bottom: 20px;
    }
}
</style>
```

---

## 📋 Field Specifications & Validation Rules

### Required Fields (Minimum)

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `email` | string | Email format, max 255 chars | Primary contact email |
| `firstName` | string | 1-50 chars, letters only | Customer first name |

**Minimum payload example:**
```json
{
  "email": "customer@email.com",
  "firstName": "John"
}
```

### Optional Fields (Recommended)

| Field | Type | Validation | Default | Scoring Impact |
|-------|------|------------|---------|----------------|
| `lastName` | string | max 50 chars | null | +2 points |
| `phone` | string | 10-15 digits | null | +15 points |
| `planType` | string | See mapping table | "OTHER" | +5-20 points |
| `zipCode` | string | 5-10 chars | null | +3 points |
| `source` | string | max 100 chars | "WEBSITE" | Varies by source |

### Extended Data Fields

| Field | Type | Validation | Purpose |
|-------|------|------------|----------|
| `dateOfBirth` | string | YYYY-MM-DD format | Age-based scoring |
| `monthlyBudget` | number | 0-50000 | Budget qualification |
| `currentInsurance` | string | max 100 chars | Competitor analysis |
| `healthConditions` | array | Array of strings | Risk assessment |
| `dependents` | number | 0-20 | Family size factor |
| `notes` | string | max 1000 chars | Additional context |

### Marketing Attribution Fields

| Field | Type | Description | Example |
|-------|------|-------------|----------|
| `utmSource` | string | Traffic source | "google", "facebook" |
| `utmMedium` | string | Marketing medium | "cpc", "email", "social" |
| `utmCampaign` | string | Campaign name | "medicare-2024", "life-insurance-q1" |
| `utmTerm` | string | Keyword | "medicare plans", "life insurance quotes" |
| `utmContent` | string | Ad content | "header-banner", "sidebar-ad" |
| `referrer` | string | HTTP referrer | Full URL of referring page |

### Behavioral Analytics Fields

| Field | Type | Range | Scoring Impact |
|-------|------|-------|----------------|
| `sessionDuration` | number | 0-7200 seconds | +0-12 points |
| `pagesViewed` | number | 1-50 pages | +0-8 points |
| `formCompletionTime` | number | 10-1800 seconds | +0-5 points |
| `landingPage` | string | URL path | Premium pages +10 points |
| `deviceType` | string | desktop/mobile/tablet | Mobile +2 points |
| `browserInfo` | string | User agent string | Analytics only |

### Geographic Data Fields

| Field | Type | Validation | Purpose |
|-------|------|------------|----------|
| `city` | string | max 100 chars | Local agent assignment |
| `state` | string | 2-char state code | Regional specialization |
| `country` | string | ISO 3166 code | International handling |
| `timezone` | string | IANA timezone | Contact time optimization |

### Complete Field Structure Example
```json
{
  "email": "customer@email.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "555-123-4567",
  "dateOfBirth": "1975-06-15",
  "zipCode": "90210",
  "planType": "Medicare",
  "source": "Homepage Form",
  "notes": "Interested in Medicare Advantage plans",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "medicare-2024",
  "landingPage": "/medicare-plans",
  "sessionDuration": 180,
  "pagesViewed": 3
}
```

## 🎯 Supported Insurance Plan Types

The CRM automatically maps various plan type formats:

| Input Value | CRM Insurance Type |
|-------------|-------------------|
| "Medicare", "MEDICARE" | MEDICARE_ADVANTAGE |
| "ACA", "ACA_PLANS" | ACA_PLANS |
| "Supplement", "SUPPLEMENT" | SUPPLEMENT |
| "Part D", "PART_D" | PART_D |
| "Life", "LIFE_INSURANCE" | LIFE_INSURANCE |
| "Auto", "AUTO_INSURANCE" | AUTO_INSURANCE |
| "Home", "HOME_INSURANCE" | HOME_INSURANCE |
| Any other value | OTHER |

## 🔄 What Happens After Submission

### 1. **Immediate Processing**
- Lead created in CRM database
- Unique ID assigned
- Data validation performed

### 2. **Automatic Lead Scoring**
Your lead is scored based on:
- Insurance type (high-value plans score higher)
- Contact information completeness
- Session engagement metrics
- Traffic source quality
- Form completion speed

### 3. **Intelligent Assignment**
- System automatically assigns leads to available agents
- Assignment based on specialization and workload
- Considers lead score and priority

### 4. **Instant Notifications**
- Email alerts to assigned agents
- SMS notifications for high-priority leads
- Webhook notifications to external systems
- Real-time dashboard updates

## 🛠️ Advanced Integration Methods

### Method 1: JavaScript Widget

Create a reusable widget for multiple pages:

```javascript
// lead-capture-widget.js
class LeadCaptureWidget {
  constructor(config) {
    this.apiEndpoint = config.apiEndpoint;
    this.source = config.source || 'Website';
    this.containerId = config.containerId;
    this.redirectUrl = config.redirectUrl || '/thank-you';
  }

  render() {
    const container = document.getElementById(this.containerId);
    container.innerHTML = `
      <form id="leadCaptureForm" class="lead-form">
        <div class="form-group">
          <input type="email" name="email" required placeholder="Email Address*">
        </div>
        <div class="form-group">
          <input type="text" name="firstName" required placeholder="First Name*">
        </div>
        <div class="form-group">
          <input type="text" name="lastName" placeholder="Last Name">
        </div>
        <div class="form-group">
          <input type="tel" name="phone" placeholder="Phone Number">
        </div>
        <div class="form-group">
          <select name="planType">
            <option value="">Select Insurance Type</option>
            <option value="Medicare">Medicare Advantage</option>
            <option value="ACA">ACA Health Plans</option>
            <option value="Life Insurance">Life Insurance</option>
            <option value="Supplement">Medicare Supplement</option>
          </select>
        </div>
        <button type="submit" class="submit-btn">Get My Quote</button>
        <div id="form-status"></div>
      </form>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const form = document.getElementById('leadCaptureForm');
    const statusDiv = document.getElementById('form-status');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Show loading state
      statusDiv.innerHTML = '<p class="loading">Submitting...</p>';
      
      const formData = new FormData(form);
      const leadData = Object.fromEntries(formData);
      
      // Add tracking data
      const enrichedData = {
        ...leadData,
        source: this.source,
        landingPage: window.location.pathname,
        utmSource: this.getUrlParameter('utm_source'),
        utmMedium: this.getUrlParameter('utm_medium'),
        utmCampaign: this.getUrlParameter('utm_campaign'),
        sessionDuration: Math.floor((Date.now() - this.sessionStart) / 1000),
        pagesViewed: this.getPageViewCount()
      };

      try {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(enrichedData)
        });

        if (response.ok) {
          statusDiv.innerHTML = '<p class="success">Thank you! We\'ll be in touch soon.</p>';
          setTimeout(() => {
            window.location.href = this.redirectUrl;
          }, 2000);
        } else {
          const errorData = await response.json();
          statusDiv.innerHTML = `<p class="error">Error: ${errorData.error || 'Please try again'}</p>`;
        }
      } catch (error) {
        statusDiv.innerHTML = '<p class="error">Network error. Please check your connection and try again.</p>';
      }
    });
  }

  getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  getPageViewCount() {
    // Implement page view tracking
    return sessionStorage.getItem('pageViews') || 1;
  }
}

// Usage
const widget = new LeadCaptureWidget({
  apiEndpoint: 'https://your-crm-domain.com/api/webhooks/form-submission',
  source: 'Homepage Widget',
  containerId: 'lead-form-container',
  redirectUrl: '/thank-you'
});

widget.render();
```

### Method 2: React Component Integration

For React applications:

```jsx
// LeadCaptureForm.jsx
import React, { useState } from 'react';

const LeadCaptureForm = ({ source = 'React App' }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    planType: ''
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('Submitting...');

    try {
      const response = await fetch('/api/webhooks/form-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source,
          landingPage: window.location.pathname,
          notes: 'Lead from React application'
        })
      });

      if (response.ok) {
        setStatus('Success! We\'ll contact you soon.');
        // Reset form or redirect
        setTimeout(() => {
          window.location.href = '/thank-you';
        }, 2000);
      } else {
        const errorData = await response.json();
        setStatus(`Error: ${errorData.error}`);
      }
    } catch (error) {
      setStatus('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="lead-capture-form">
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address*"
          required
        />
      </div>
      <div>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name*"
          required
        />
      </div>
      <div>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
        />
      </div>
      <div>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
        />
      </div>
      <div>
        <select
          name="planType"
          value={formData.planType}
          onChange={handleChange}
        >
          <option value="">Select Insurance Type</option>
          <option value="Medicare">Medicare Advantage</option>
          <option value="ACA">ACA Health Plans</option>
          <option value="Life Insurance">Life Insurance</option>
          <option value="Supplement">Medicare Supplement</option>
        </select>
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Get Quote'}
      </button>
      {status && <div className="form-status">{status}</div>}
    </form>
  );
};

export default LeadCaptureForm;
```

### Method 3: WordPress Integration

For WordPress sites, create a custom plugin:

```php
<?php
// angels-care-crm-integration.php

function angels_care_lead_form_shortcode($atts) {
    $attributes = shortcode_atts(array(
        'source' => 'WordPress Site',
        'redirect' => '/thank-you/'
    ), $atts);

    ob_start();
    ?>
    <form id="angels-care-lead-form" method="post">
        <div class="form-group">
            <input type="email" name="email" required placeholder="Email Address*">
        </div>
        <div class="form-group">
            <input type="text" name="firstName" required placeholder="First Name*">
        </div>
        <div class="form-group">
            <input type="text" name="lastName" placeholder="Last Name">
        </div>
        <div class="form-group">
            <input type="tel" name="phone" placeholder="Phone Number">
        </div>
        <div class="form-group">
            <select name="planType">
                <option value="">Select Insurance Type</option>
                <option value="Medicare">Medicare Advantage</option>
                <option value="ACA">ACA Health Plans</option>
                <option value="Life Insurance">Life Insurance</option>
                <option value="Supplement">Medicare Supplement</option>
            </select>
        </div>
        <button type="submit">Get Quote</button>
        <div id="form-status"></div>
    </form>

    <script>
    document.getElementById('angels-care-lead-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const leadData = Object.fromEntries(formData);
        
        fetch('<?php echo get_option('angels_care_api_endpoint'); ?>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...leadData,
                source: '<?php echo esc_js($attributes['source']); ?>',
                landingPage: window.location.pathname
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('form-status').innerHTML = '<p class="success">Thank you! We\'ll be in touch soon.</p>';
                setTimeout(() => {
                    window.location.href = '<?php echo esc_js($attributes['redirect']); ?>';
                }, 2000);
            } else {
                document.getElementById('form-status').innerHTML = '<p class="error">Error: ' + (data.error || 'Please try again') + '</p>';
            }
        })
        .catch(error => {
            document.getElementById('form-status').innerHTML = '<p class="error">Network error. Please try again.</p>';
        });
    });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('angels_care_lead_form', 'angels_care_lead_form_shortcode');

// Usage: [angels_care_lead_form source="Homepage" redirect="/thank-you/"]
?>
```

## 📊 Response Handling

### Success Response
```json
{
  "success": true,
  "message": "Lead created successfully",
  "leadId": "uuid-here"
}
```

### Error Responses
```json
{
  "error": "Email and firstName are required"
}
```

## 🔧 Testing Your Integration

### 1. Test Endpoint
Use a simple curl command to test:

```bash
curl -X POST https://your-crm-domain.com/api/webhooks/form-submission \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "phone": "555-123-4567",
    "planType": "Medicare",
    "source": "API Test"
  }'
```

### 2. Check CRM Dashboard
- Log into your CRM dashboard
- Navigate to Leads → All Leads
- Verify your test lead appears with correct data
- Check that lead scoring and assignment worked

### 3. Verify Notifications
- Check that configured notifications were sent
- Verify email alerts reached the assigned agent
- Test SMS notifications if configured

## 🚨 Error Handling Best Practices

### 1. Client-Side Validation
```javascript
function validateLeadForm(formData) {
  const errors = [];
  
  if (!formData.email) {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.push('Email format is invalid');
  }
  
  if (!formData.firstName) {
    errors.push('First name is required');
  }
  
  if (formData.phone && !/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
    errors.push('Phone number must be at least 10 digits');
  }
  
  return errors;
}
```

### 2. Retry Logic
```javascript
async function submitLeadWithRetry(leadData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/webhooks/form-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      
      if (response.ok) {
        return await response.json();
      } else if (response.status >= 400 && response.status < 500) {
        // Client error - don't retry
        throw new Error(`Client error: ${response.status}`);
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

## 🔒 Security Considerations

### 1. Rate Limiting
Implement client-side rate limiting to prevent spam:

```javascript
const SUBMISSION_COOLDOWN = 60000; // 1 minute
let lastSubmission = 0;

function canSubmitForm() {
  const now = Date.now();
  if (now - lastSubmission < SUBMISSION_COOLDOWN) {
    return false;
  }
  lastSubmission = now;
  return true;
}
```

### 2. Data Sanitization
Always sanitize user input:

```javascript
function sanitizeLeadData(formData) {
  return {
    email: formData.email?.trim().toLowerCase(),
    firstName: formData.firstName?.trim().replace(/[<>]/g, ''),
    lastName: formData.lastName?.trim().replace(/[<>]/g, ''),
    phone: formData.phone?.replace(/\D/g, ''),
    planType: formData.planType?.trim(),
    notes: formData.notes?.substring(0, 500) // Limit length
  };
}
```

## 📈 Analytics Integration

### Track Form Performance
```javascript
// Google Analytics 4
gtag('event', 'form_start', {
  'form_name': 'lead_capture'
});

// On successful submission
gtag('event', 'form_submit', {
  'form_name': 'lead_capture',
  'plan_type': leadData.planType
});

// Facebook Pixel
fbq('track', 'Lead', {
  content_name: 'Insurance Quote Request',
  content_category: leadData.planType
});
```

## 🆘 Support

For integration support or questions:
- Check the CRM dashboard for lead status
- Review API response codes and error messages
- Test with the provided examples
- Contact your CRM administrator for webhook endpoint details

## 📋 Checklist

Before going live:
- [ ] Test API endpoint with sample data
- [ ] Verify lead appears in CRM dashboard
- [ ] Confirm lead scoring is working
- [ ] Check agent assignment functionality
- [ ] Test notification delivery
- [ ] Implement proper error handling
- [ ] Add client-side validation
- [ ] Set up analytics tracking
- [ ] Configure thank you page redirect
- [ ] Test mobile responsiveness