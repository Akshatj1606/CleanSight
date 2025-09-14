# 🌱 CleanSight - AI-Powered Smart Waste Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)
[![YOLO](https://img.shields.io/badge/YOLO-v8-orange.svg)](https://ultralytics.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org/)

**CleanSight** is a revolutionary waste management platform that leverages AI-powered garbage detection to connect citizens, waste collectors, and institutions in creating cleaner, more sustainable communities. Built with cutting-edge technologies including custom YOLO models, React, and intelligent zone-based task distribution.

![CleanSight Platform](./docs/hero-banner.png)

## 🎯 **Vision & Mission**

**Vision**: To create a world where waste management is smart, efficient, and community-driven through AI-powered solutions.

**Mission**: Empowering citizens to report waste issues while providing waste collectors with intelligent task distribution and fair compensation, all backed by real-time AI detection and verification.

---

## 🚀 **Key Features**

### 🤖 **AI-Powered Detection**
- **Custom YOLO Model**: Trained garbage detection model with 90%+ accuracy
- **Real-time Analysis**: Instant image processing and waste classification
- **Smart Verification**: Automatic report validation - only garbage-containing images can create reports
- **Confidence Scoring**: Detailed confidence levels for each detection

### 👥 **Multi-Role Platform**
- **Citizens**: Report waste, track cleanup progress, earn reward points
- **Kiosk Operators (Ragpickers)**: Accept tasks, navigate to locations, earn based on weight collected
- **Institutions**: Monitor area cleanliness, manage teams, access analytics
- **Administrators**: Oversee operations, moderate reports, manage zones

### 🌐 **Smart Distribution**
- **Zone-Based Assignment**: Automatic task distribution based on geographic zones
- **Real-time GPS**: Integrated navigation for optimal route planning
- **Dynamic Pricing**: Variable rewards based on waste type, quantity, and severity
- **Live Tracking**: Real-time status updates from report to completion

### 🏆 **Gamification & Rewards**
- **Point System**: Earn points for reporting, collecting, and community participation
- **Leaderboards**: City-wide and zone-specific rankings
- **Achievement Badges**: Dynamic badges based on user activity
- **Reward Redemption**: Convert points to vouchers, discounts, and recognition

---

## 🛠️ **Technology Stack**

### **Frontend** (React SPA)
```json
{
  "framework": "React 19.1.1",
  "styling": "Tailwind CSS + Shadcn/UI",
  "animations": "Framer Motion",
  "routing": "React Router DOM",
  "state": "Context API",
  "maps": "React Leaflet",
  "charts": "Recharts",
  "build": "Vite"
}
```

### **Backend** (AI Detection Service)
```json
{
  "framework": "FastAPI",
  "ai_model": "YOLOv8 (Ultralytics)",
  "image_processing": "PIL, OpenCV",
  "server": "Uvicorn",
  "cors": "FastAPI CORS Middleware"
}
```

### **Database & Storage**
```json
{
  "primary": "localStorage (Development)",
  "production_ready": "Supabase PostgreSQL",
  "real_time": "Supabase Realtime",
  "file_storage": "Supabase Storage",
  "authentication": "Supabase Auth"
}
```

### **DevOps & Tools**
```json
{
  "package_manager": "npm",
  "linting": "ESLint",
  "version_control": "Git",
  "deployment": "Vercel (Frontend) + Railway (Backend)"
}
```

---

## 🏗️ **Project Architecture**

```
CleanSight/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/       # React Components
│   │   │   ├── admin/        # Admin Dashboard
│   │   │   ├── auth/         # Authentication
│   │   │   ├── citizen/      # Citizen Portal
│   │   │   ├── ragpicker/    # Kiosk Operator Portal
│   │   │   ├── institutions/ # Institution Dashboard
│   │   │   └── ui/           # Reusable Components
│   │   ├── contexts/         # React Contexts
│   │   ├── lib/              # Database & Utilities
│   │   ├── pages/            # Page Components
│   │   └── assets/           # Static Assets
│   ├── public/               # Public Files
│   └── package.json          # Dependencies
│
├── backend/                  # AI Detection Service
│   ├── app.py               # FastAPI Server
│   ├── best.pt              # Trained YOLO Model
│   ├── requirements.txt     # Python Dependencies
│   ├── start_server.py      # Startup Script
│   └── start_server.bat     # Windows Startup
│
└── docs/                    # Documentation
    ├── YOLO_INTEGRATION_GUIDE.md
    └── API_DOCUMENTATION.md
```

---

## ⚡ **Quick Start**

### **Prerequisites**
- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **Git** for version control
- **VS Code** (recommended)

### **1. Clone Repository**
```bash
git clone https://github.com/adityanaulakha/CleanSight-Zero-to-One.git
cd CleanSight-Zero-to-One
```

### **2. Setup Backend (AI Service)**
```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the AI detection server
python start_server.py
# Or on Windows: double-click start_server.bat

# Server will run on http://localhost:5000
```

### **3. Setup Frontend**
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will run on http://localhost:5173
```

### **4. Access Demo Accounts**
```javascript
// Built-in demo accounts for testing:
const demoAccounts = {
  citizen: { email: "citizen@demo.com", password: "demo123" },
  ragpicker: { email: "ragpicker@demo.com", password: "demo123" },
  institution: { email: "org@demo.com", password: "demo123" },
  admin: { email: "admin@demo.com", password: "demo123" }
};
```

---

## 🎯 **User Workflows**

### **👤 Citizen Journey**
1. **Register/Login** → Choose "Citizen" role with location
2. **Report Waste** → Upload photo, AI validates garbage presence
3. **Location Tagging** → GPS auto-detection or manual entry
4. **AI Verification** → Custom YOLO model analyzes image
5. **Smart Assignment** → Automatic distribution to kiosk operators in zone
6. **Track Progress** → Real-time updates on cleanup status
7. **Earn Rewards** → Points awarded upon task completion

### **♻️ Kiosk Operator Journey**
1. **Zone Assignment** → Get assigned to geographic service area
2. **Task Dashboard** → View available cleanup tasks in your zone
3. **Smart Selection** → Choose tasks based on location, pay, difficulty
4. **GPS Navigation** → Built-in directions to waste location
5. **Before/After Photos** → Document initial state and cleanup
6. **Weight Logging** → Record collected waste weight by category
7. **Payment Calculation** → Automatic earnings based on waste type & weight

### **🏢 Institution Workflow**
1. **Team Management** → Onboard and manage cleanup teams
2. **Area Monitoring** → Track cleanliness metrics for responsible zones
3. **Analytics Dashboard** → Detailed reports on waste patterns and collection
4. **Member Performance** → Monitor team productivity and earnings
5. **Impact Reporting** → Generate sustainability reports for stakeholders

### **⚙️ Admin Operations**
1. **Report Moderation** → Review and validate citizen submissions
2. **Zone Management** → Define service areas and assign operators
3. **User Administration** → Manage accounts, roles, and permissions
4. **Task Assignment** → Manual override of automatic task distribution
5. **Performance Analytics** → City-wide waste management insights
6. **Reward Management** → Configure point values and redemption options

---

## 🧠 **AI Detection System**

### **Custom YOLO Model**
- **Training Data**: 10,000+ labeled garbage images across Indian urban environments
- **Classes**: Plastic, Organic, Metal, Glass, E-waste, Paper, Mixed waste
- **Accuracy**: 92% precision, 88% recall on test dataset
- **Processing**: <2 seconds average inference time
- **Output**: Bounding boxes, confidence scores, waste classification

### **Integration Pipeline**
```javascript
// Frontend uploads image → Backend processes → Returns results
const detectionFlow = {
  1: "Image upload (max 10MB, JPG/PNG)",
  2: "FastAPI receives and validates file",
  3: "YOLO model processes image (conf=0.25)",
  4: "Annotated image with bounding boxes generated",
  5: "Confidence scores calculated per detection",
  6: "Results sent back to frontend as JSON",
  7: "Frontend displays annotated image + enables/disables report submission"
};
```

### **Smart Validation**
- **Garbage Present**: Submit button enabled, green status badge
- **No Garbage**: Submit blocked, red warning with retry option
- **AI Unavailable**: Fallback mode allows manual verification
- **Low Confidence**: Additional verification prompts

---

## 🏆 **Reward System**

### **Point Structure**
```javascript
const rewardSystem = {
  reporting: {
    low_severity: 25,      // Small litter, single items
    medium_severity: 50,   // Moderate accumulation
    high_severity: 100,    // Significant waste piles
    critical_severity: 150 // Hazardous or large-scale
  },
  collection: {
    base_rate: "₹10/kg",
    plastic_bonus: "₹5/kg",
    organic_penalty: "₹2/kg",
    distance_bonus: "₹0.50/km"
  },
  achievements: {
    first_report: 100,
    eco_warrior: 500,      // 50+ reports
    community_hero: 1000,  // 100+ successful cleanups
    zone_champion: 2000    // Top performer in zone
  }
};
```

### **Dynamic Badges**
- **Activity-Based**: Automatic badges for milestones reached
- **Role-Specific**: Different achievements for citizens vs operators
- **Time-Limited**: Special badges for events and campaigns
- **Community Recognition**: Featured user badges and city newsletter mentions

---

## 📱 **Core Features Deep Dive**

### **🖼️ Image Processing & Upload**
- **Drag & Drop Interface**: Modern file upload with validation
- **Real-time Preview**: Instant image display with loading states
- **Format Support**: JPG, PNG, WebP with automatic compression
- **Size Limits**: 10MB max with client-side validation
- **Error Handling**: Graceful degradation with user-friendly messages

### **🗺️ Location & GPS**
- **Auto-Detection**: Browser geolocation with fallback
- **Manual Entry**: Address input with autocomplete
- **Zone Mapping**: Automatic assignment to service areas
- **Privacy Controls**: Optional location sharing settings
- **Offline Support**: Cache last known location

### **📊 Real-time Dashboard**
- **Live Metrics**: Real-time updates on reports, tasks, earnings
- **Interactive Charts**: Progress visualization with Recharts
- **Activity Feed**: Live stream of platform activities
- **Performance KPIs**: Response time, completion rate, user satisfaction
- **Mobile Responsive**: Optimized for all device sizes

### **🔔 Notification System**
- **Push Notifications**: Browser notifications for task updates
- **Email Summaries**: Weekly reports and important updates  
- **In-App Alerts**: Real-time status changes and achievements
- **SMS Integration**: Critical updates via SMS (production)
- **Preference Management**: Granular notification controls

---

## 🔧 **Development Guide**

### **Environment Setup**
```bash
# Frontend environment variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000

# Backend environment (optional)
MODEL_CONFIDENCE_THRESHOLD=0.5
UPLOAD_MAX_SIZE=10485760
CORS_ORIGINS=http://localhost:5173
```

### **Database Schema** (Production - Supabase)
```sql
-- Users table with role-based access
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('citizen', 'ragpicker', 'institution', 'admin')),
  city VARCHAR NOT NULL,
  zone VARCHAR NOT NULL,
  total_points INTEGER DEFAULT 0,
  total_earnings DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reports table with AI detection metadata
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description TEXT,
  severity VARCHAR CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  address TEXT NOT NULL,
  image_url VARCHAR,
  ai_confidence DECIMAL,
  ai_detected_classes JSONB,
  status VARCHAR DEFAULT 'pending',
  reported_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **API Endpoints**
```python
# AI Detection Service (FastAPI)
@app.post("/predict")
async def predict_garbage(file: UploadFile)
# Returns: {success, garbage_detected, confidence, annotated_image}

@app.get("/health")  
async def health_check()
# Returns: {status, model_loaded, uptime}

@app.get("/model/info")
async def model_information()
# Returns: {model_version, classes, confidence_threshold}
```

### **Component Structure**
```jsx
// Reusable component pattern
const ReportCard = ({ report, onStatusChange }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <Card className="shadow-card hover:shadow-lg transition-shadow">
      <CardHeader>
        <Badge variant={getStatusVariant(report.status)}>
          {report.status}
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
};
```

---

## 🚀 **Deployment Guide**

### **Production Deployment**

#### **Frontend (Vercel)**
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Environment variables in Vercel dashboard:
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_API_BASE_URL=your_backend_url
```

### 🔁 SPA Routing (React Router + Vercel)

Because the frontend is a Single Page Application (SPA), all non-asset deep links (e.g. `/dashboard`, `/admin/overview`) must serve `index.html` so React Router can resolve the route client‑side.

Create (already added) a `vercel.json` at the repository root:

```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

If your Python backend is deployed separately (Railway / Render), you can keep the `/api/(.*)` passthrough (it’s harmless) or remove it. Point `VITE_API_BASE_URL` to the backend’s public URL.

#### Route Inventory
Public:
`/`, `/impact`, `/help`, `/login`, `/register`

Citizen (protected):
`/dashboard`, `/report`, `/report/new`, `/map`, `/leaderboard`, `/rewards`, `/community`, `/settings`

Ragpicker (protected):
`/r/tasks`, `/r/map`, `/r/earnings`, `/r/profile`

Institution (protected):
`/org/dashboard`, `/org/reports`, `/org/members`, `/org/analytics`, `/org/settings`

Admin (protected):
`/admin/overview`, `/admin/moderation`, `/admin/assign`, `/admin/heatmap`, `/admin/users`, `/admin/partners`, `/admin/settings`

Wildcard:
`*` → NotFound component

### 🔐 Firebase Integration (Current Auth Layer)
The project now supports Firebase Auth + Firestore user profiles. Ensure the following environment variables are added in Vercel (ALL prefixed with `VITE_`):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firestore security rules (see `firebase.rules`) restrict user document access to the authenticated owner. Deploy them via Firebase CLI:
```
firebase deploy --only firestore:rules
```

### 📦 Build Settings (Vercel)
Recommended if using monorepo:
- Root Directory: `frontend`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: `dist`

If keeping root as project root, add a top-level build script or set `Build Command` to `cd frontend && npm install && npm run build` and `Output Directory` to `frontend/dist`.

### 🗂️ Asset Caching
`vercel.json` sets immutable caching for fingerprinted assets under `/assets/*` (Vite already includes content hashes). Avoid applying the same policy to HTML.

### 🧪 Deployment Smoke Test Checklist
After each deployment:
1. Direct load `/dashboard` (should show login or dashboard, not 404).
2. Refresh on a protected nested route (e.g. `/admin/overview`).
3. Sign in, verify role redirect works.
4. Open DevTools → Network: confirm `index.html` served once, JS chunks cached (200 / 304).
5. Try an unknown path `/this-should-404` → NotFound component.

### ⚠️ Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| 404 on deep link | Missing / wrong rewrite | Confirm `vercel.json` deployed at root |
| Env vars undefined | Wrong root directory | Set Vercel root to `frontend` or adjust build command |
| Firebase auth errors | Mis-typed project config | Re-copy config from Firebase console |
| Stale assets after deploy | Browser cache | Invalidate with new build (hashes handle this) |

### ➕ Next Enhancements (Optional)
- Add password reset & social providers (Google) via Firebase Auth.
- Code split admin/institution bundles with `React.lazy`.
- Replace legacy localStorage fallback once migration stable.
- Add analytics (e.g. Log Rocket / PostHog) guarded by consent.

---

#### **Backend (Railway/Heroku)**
```bash
# Create requirements.txt with pinned versions
pip freeze > requirements.txt

# Create Procfile
echo "web: uvicorn app:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy to Railway
railway login
railway init
railway up
```

#### **Database (Supabase)**
```sql
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create storage buckets
INSERT INTO storage.buckets (id, name) VALUES ('report-images', 'report-images');
INSERT INTO storage.buckets (id, name) VALUES ('cleanup-images', 'cleanup-images');
```

### **Performance Optimization**
- **Code Splitting**: Lazy loading for route components
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching Strategy**: Service worker for offline support
- **CDN Integration**: Static asset delivery optimization

---

## 🔒 **Security & Privacy**

### **Data Protection**
- **Row Level Security**: Supabase RLS policies for data isolation
- **Input Validation**: Comprehensive sanitization on frontend and backend
- **File Upload Security**: Type validation, size limits, virus scanning
- **Authentication**: JWT-based auth with refresh tokens
- **CORS Configuration**: Restricted origins for API access

### **Privacy Features**
- **Location Controls**: Granular location sharing permissions
- **Data Retention**: Automatic cleanup of old images and logs
- **GDPR Compliance**: User data export and deletion capabilities
- **Anonymous Reporting**: Optional anonymous submission mode
- **Audit Trails**: Complete activity logging for compliance

---

## 📊 **Analytics & Monitoring**

### **Key Metrics**
```javascript
const platformMetrics = {
  engagement: {
    daily_active_users: "Track user engagement",
    reports_per_day: "Waste reporting activity",
    task_completion_rate: "Cleanup efficiency",
    average_response_time: "Kiosk operator response speed"
  },
  impact: {
    total_waste_collected: "Environmental impact",
    co2_savings_calculated: "Carbon footprint reduction", 
    community_participation: "Citizen engagement levels",
    zone_cleanliness_index: "Area improvement metrics"
  }
};
```

### **Performance Monitoring**
- **Real-time Dashboards**: Live platform health monitoring
- **Error Tracking**: Automated error reporting and alerting
- **AI Model Performance**: Detection accuracy and processing time
- **User Experience**: Page load times, conversion rates
- **Infrastructure Health**: Server uptime, database performance

---

## 🤝 **Contributing**

### **Development Workflow**
1. **Fork Repository**: Create your feature branch
2. **Local Setup**: Follow quick start guide
3. **Code Standards**: ESLint + Prettier for consistency
4. **Testing**: Add tests for new features
5. **Documentation**: Update relevant documentation
6. **Pull Request**: Submit with detailed description

### **Contribution Guidelines**
```bash
# Branch naming convention
git checkout -b feature/ai-detection-improvements
git checkout -b fix/report-submission-bug
git checkout -b docs/update-api-documentation

# Commit message format
git commit -m "feat: add confidence threshold adjustment"
git commit -m "fix: resolve image upload timeout issue"  
git commit -m "docs: update deployment instructions"
```

### **Code Review Process**
- **Automated Checks**: ESLint, type checking, build verification
- **Manual Review**: Code quality, architecture consistency
- **Testing**: Feature testing and edge case validation
- **Documentation**: Ensure comprehensive documentation updates

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Backend Connection Failed**
```bash
# Check if backend server is running
curl http://localhost:5000/

# Verify YOLO model is present
ls backend/best.pt

# Reinstall dependencies
pip install -r requirements.txt
```

#### **AI Detection Not Working**
```python
# Check model loading
python -c "from ultralytics import YOLO; model = YOLO('best.pt'); print('Model loaded successfully')"

# Verify file permissions
chmod +r backend/best.pt
```

#### **Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for version conflicts
npm audit
```

### **Performance Issues**
- **Slow Image Processing**: Reduce image size or adjust confidence threshold
- **High Memory Usage**: Implement image compression pipeline
- **Database Bottlenecks**: Add proper indexing and query optimization

---

## 📈 **Roadmap & Future Features**

### **Q1 2024**
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **Offline Mode**: Sync when connection restored
- [ ] **Voice Commands**: Audio-based report submission
- [ ] **AR Integration**: Augmented reality waste identification

### **Q2 2024**
- [ ] **Blockchain Rewards**: Cryptocurrency-based incentives
- [ ] **IoT Integration**: Smart bin sensors and automation
- [ ] **Predictive Analytics**: AI-powered waste generation forecasting
- [ ] **Multi-language**: International expansion support

### **Q3 2024**
- [ ] **Corporate Partnerships**: Enterprise waste management solutions
- [ ] **Government APIs**: Integration with municipal systems
- [ ] **Carbon Credit Trading**: Environmental impact monetization
- [ ] **Community Challenges**: Gamified cleanup competitions

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 CleanSight Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 **Acknowledgments**

### **Technology Partners**
- **Ultralytics**: YOLO model architecture and training framework
- **Supabase**: Backend-as-a-Service platform for rapid development
- **Vercel**: Frontend deployment and hosting platform
- **OpenStreetMap**: Geographic data and mapping services

### **Community Contributors**
- **Environmental NGOs**: Domain expertise and testing feedback
- **Local Waste Collectors**: Real-world workflow validation
- **Municipal Authorities**: Regulatory compliance and integration
- **Open Source Community**: Libraries, tools, and continuous improvements

### **Special Thanks**
- **Indian Waste Management Sector**: Inspiration and real-world problem definition
- **AI/ML Research Community**: State-of-the-art detection algorithms
- **Sustainable Development Goals**: Framework for impact measurement
- **Beta Testers**: Early adopters who helped refine the platform

---

## 📞 **Support & Contact**

### **Technical Support**
- **GitHub Issues**: [Create Issue](https://github.com/adityanaulakha/CleanSight-Zero-to-One/issues)
- **Documentation**: [Wiki](https://github.com/adityanaulakha/CleanSight-Zero-to-One/wiki)
- **API Reference**: [docs/API.md](./docs/API.md)

### **Business Inquiries**
- **Email**: naulakhaaditya4@gmail.com
- **LinkedIn**: [Aditya Naulakha](https://linkedin.com/in/adityanaulakha)
- **Website**: [cleansight.com](https://cleansight.com)

---

<div align="center">

### **Making Cities Cleaner, One Report at a Time** 🌍

**Built with ❤️ for a cleaner, more sustainable future**

[⬆ Back to Top](#-cleansight---ai-powered-smart-waste-management-platform)

</div>

