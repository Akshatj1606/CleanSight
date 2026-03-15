# 🌱 CleanSight - Smart Waste Management Platform

CleanSight is a comprehensive waste management platform that connects citizens, waste collectors (ragpickers), institutions, and administrators to create cleaner communities. Built with React, Vite, and Supabase for real-time functionality.

## ✨ Features

### For Citizens
- **Report Garbage**: Upload photos and report waste locations with AI-powered detection
- **Real-time Tracking**: Track the status of your reports from submission to completion
- **Rewards System**: Earn points and rewards for contributing to community cleanliness
- **Community Dashboard**: View local cleanliness metrics and leaderboards

### For Waste Collectors (Ragpickers)
- **Zone-based Tasks**: Receive tasks based on your assigned collection zone
- **Navigation Integration**: Built-in GPS navigation to waste locations
- **Earnings Tracker**: Real-time tracking of earnings and completed tasks
- **Photo Verification**: Upload before/after photos for task completion

### For Institutions
- **Analytics Dashboard**: Monitor waste management metrics for your organization
- **Team Management**: Manage team members and their contributions
- **Bulk Reporting**: Submit multiple waste reports efficiently
- **Impact Metrics**: Track your environmental impact

### For Administrators
- **System Overview**: Monitor platform-wide statistics and activities
- **User Management**: Manage citizens, ragpickers, and institutions
- **Zone Management**: Configure and manage waste collection zones
- **Moderation Tools**: Review and moderate reports and tasks

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Maps**: Leaflet, React-Leaflet
- **UI Components**: Shadcn/ui, Radix UI
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Image Handling**: React Image Crop, React Webcam

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CleanSight
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Copy the SQL schema from `supabase-schema.sql` and run it in your Supabase SQL editor
4. Set up the storage buckets (report-images, profile-images, cleanup-images) in Storage section

### 4. Environment Configuration
Create/update a local env file (recommended: `.env.local`) with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DEV_MODE=false

# Optional (CleanSight AI ChatBot / RAG)
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

Keep API keys in `.env.local` (gitignored) and never commit them.

### 5. Run the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 6. Build for Production
```bash
npm run build
```

## 🎯 User Workflow

### Citizen Journey
1. **Sign Up/Login** → Choose "Citizen" role
2. **Report Issue** → Upload photo, add description, mark location
3. **AI Detection** → System automatically detects waste type
4. **Zone Assignment** → Report assigned to ragpickers in that zone
5. **Track Progress** → Monitor cleanup status in real-time
6. **Earn Rewards** → Receive points when task is completed

### Ragpicker Journey
1. **Sign Up/Login** → Choose "Ragpicker" role, get assigned to zone
2. **View Available Tasks** → See pending reports in your zone
3. **Accept Task** → Choose tasks based on location and reward
4. **Navigate to Location** → Use built-in GPS navigation
5. **Complete Cleanup** → Upload cleanup photos, enter weight collected
6. **Receive Payment** → Earn money based on waste type and weight

### Real-time Features
- **Live Notifications**: Ragpickers get notified instantly when new reports are submitted in their zone
- **Status Updates**: Citizens see real-time updates as their reports progress
- **Dynamic Leaderboards**: Rankings update in real-time as users earn points
- **Zone-based Distribution**: Tasks are automatically distributed based on geographic zones

## 🗂️ Project Structure

```
src/
├── components/           # React components
│   ├── admin/           # Admin dashboard components
│   ├── auth/            # Authentication components
│   ├── citizen/         # Citizen portal components
│   ├── instituitions/   # Institution dashboard components
│   ├── ragpicker/       # Ragpicker/waste collector components
│   └── ui/              # Reusable UI components
├── contexts/            # React contexts (Auth, Theme)
├── lib/                 # Utilities and database functions
│   ├── supabase.js      # Supabase client configuration
│   ├── database.js      # Database service functions
│   └── utils.js         # Utility functions
├── pages/               # Page components
└── assets/              # Static assets
```

## 🔑 Key Features Implementation

### Zone-based Task Distribution
- City is divided into zones with geographic boundaries
- Ragpickers are assigned to specific zones
- Reports are automatically routed to ragpickers in the same zone
- Real-time notifications ensure immediate task distribution

### AI-Powered Waste Detection
- Image analysis to detect waste types automatically
- Categorization into: Plastic, Organic, Metal, Glass, E-Waste, Hazardous
- Severity assessment based on visual analysis
- Automatic tagging and categorization for better sorting

### Dynamic Reward System
- Points awarded based on waste type, weight, and severity
- Citizens get 30% of ragpicker points for verified reports
- Earnings calculated using base rates with severity multipliers
- Real-time balance updates and transaction history

### Real-time Synchronization
- Live updates using Supabase real-time subscriptions
- Instant notifications for new tasks and status changes
- Real-time leaderboards and statistics
- Live tracking of cleanup progress

## 🔧 Database Schema

The application uses a PostgreSQL database with the following key tables:
- `users` - User profiles and authentication
- `reports` - Citizen waste reports
- `tasks` - Ragpicker task assignments
- `zones` - Geographic zones for task distribution
- `rewards` - Point and earning transactions
- `notifications` - Real-time user notifications

See `supabase-schema.sql` for the complete database schema.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_DEV_MODE` | Enable development mode features | No |

## 🚀 Deployment

The application can be deployed to:
- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist` folder after running `npm run build`
- **Supabase**: Use Supabase hosting for full-stack deployment

Make sure to set your environment variables in the deployment platform.

## 📱 Mobile Responsiveness

CleanSight is fully responsive and optimized for:
- Desktop computers (1920px+)
- Tablets (768px - 1919px)
- Mobile phones (320px - 767px)
- Progressive Web App (PWA) features for mobile installation

## 🔒 Security Features

- Row Level Security (RLS) policies in Supabase
- Authentication-based access control
- Secure file upload with validation
- API route protection
- Data encryption in transit and at rest

## 📈 Performance Optimization

- Image optimization and lazy loading
- Component code splitting
- Efficient database queries with proper indexing
- Real-time subscription optimization
- Caching strategies for frequently accessed data

## 🆘 Troubleshooting

### Common Issues:
1. **Supabase connection fails**: Check your environment variables
2. **Images not uploading**: Verify storage buckets are created and policies are set
3. **Real-time updates not working**: Ensure your Supabase project has real-time enabled
4. **Authentication issues**: Check if users table trigger is set up correctly

For more help, check the [Supabase documentation](https://supabase.com/docs) or open an issue.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for cleaner communities 🌍
