import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Award,
  TrendingUp,
  Recycle,
  Camera,
  MapPin,
  Star,
  Calendar,
  Medal,
  MessageCircle,
  Heart,
  ClipboardList,
  Loader,
  Share2,
  Users,
  Gift
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { reportService, leaderboardService, taskService } from '@/lib/localDatabase.js';
import LocationDisplay from '@/components/ui/LocationDisplay';
import ProfilePicture from '@/components/ui/ProfilePicture';
import StatCard from '@/components/ui/StatCard';
import { motion } from 'framer-motion';

// Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const [recentReports, setRecentReports] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState({
    total_points: 0,
    total_earnings: 0,
    total_weight: 0,
    total_activities: 0
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    console.log('Loading dashboard for user:', user.id);
    setLoading(true);
    
    try {
      // Fetch all dashboard data (localStorage is instant, no timeout needed)
      const [reports, recentTasksData, leaderboardData, stats] = await Promise.all([
        reportService.getReportsByUser(user.id).catch((err) => {
          console.error('Reports fetch failed:', err);
          return [];
        }),
        // Get tasks related to user's reports
        (async () => {
          try {
            const userReports = await reportService.getReportsByUser(user.id);
            const allTasks = [];
            
            for (const report of userReports) {
              const tasks = await taskService.getTasksByReport?.(report.id) || [];
              allTasks.push(...tasks.map(task => ({ ...task, report })));
            }
            
            return allTasks.slice(0, 5); // Get recent 5 tasks
          } catch (error) {
            console.error('Tasks fetch failed:', error);
            return [];
          }
        })(),
        leaderboardService.getLeaderboard('citizens', 'month').catch((err) => {
          console.error('Leaderboard fetch failed:', err);
          return [];
        }),
        leaderboardService.getUserStats(user.id).catch((err) => {
          console.error('User stats fetch failed:', err);
          return {
            total_points: 0,
            total_earnings: 0,
            total_weight: 0,
            total_activities: 0
          };
        })
      ]);

      console.log('Dashboard data loaded:', { reports, recentTasksData, leaderboardData, stats });
      setRecentReports((reports || []).slice(0, 5));
      setRecentTasks(recentTasksData || []);
      setLeaderboard(leaderboardData || []);
      setUserStats(stats || {
        total_points: 0,
        total_earnings: 0,
        total_weight: 0,
        total_activities: 0
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleRefresh = useCallback(async () => {
    await loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh every 2 minutes (only when component is visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (window.dashboardInterval) {
          clearInterval(window.dashboardInterval);
          window.dashboardInterval = null;
        }
      } else {
        if (!window.dashboardInterval) {
          window.dashboardInterval = setInterval(() => {
            loadDashboardData();
          }, 120000); // 2 minutes
        }
      }
    };

    if (!document.hidden && !window.dashboardInterval) {
      window.dashboardInterval = setInterval(() => {
        loadDashboardData();
      }, 120000);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (window.dashboardInterval) {
        clearInterval(window.dashboardInterval);
        window.dashboardInterval = null;
      }
    };
  }, [loadDashboardData]);

  const achievements = [
    { title: "First Report", description: "Submitted your first garbage report", earned: true, icon: "🏆" },
    { title: "Week Warrior", description: "7 reports in a week", earned: true, icon: "⚡" },
    { title: "Location Scout", description: "Reports from 10 different areas", earned: false, icon: "📍" },
    { title: "Eco Champion", description: "1000 points milestone", earned: true, icon: "🌱" },
  ];

  const weeklyStats = [
    { day: 'Mon', reports: 2 },
    { day: 'Tue', reports: 1 },
    { day: 'Wed', reports: 3 },
    { day: 'Thu', reports: 0 },
    { day: 'Fri', reports: 2 },
    { day: 'Sat', reports: 4 },
    { day: 'Sun', reports: 1 },
  ];

  const communityPosts = [
    { id: 1, user: "Priya S.", time: "2h ago", content: "Just cleaned up the park! 🌱", likes: 24, comments: 8 },
    { id: 2, user: "Raj P.", time: "4h ago", content: "Weekend cleanup drive anyone? 🧹", likes: 15, comments: 12 },
    { id: 3, user: "Maya C.", time: "6h ago", content: "Eco-tip: Use newspapers to wrap gifts! ♻️", likes: 31, comments: 5 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <Loader className="h-8 w-8 animate-spin text-green-500" />
        <span className="sr-only">Loading dashboard data</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="card-surface overflow-hidden"
      >
        <div className="relative">
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.4),transparent_60%)]" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
            <div className="flex-1 pt-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-gray-900">Welcome back, {user.full_name || 'User'}!</h1>
              <p className="text-gray-600 mb-3">Here's your environmental impact dashboard</p>
              <LocationDisplay
                user={user}
                className="text-sm text-gray-500"
              />
            </div>
            <ProfilePicture
              src={user.profileImage}
              alt={user.full_name || 'User'}
              size="xl"
              className="ring-2 ring-green-100"
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Trophy className="h-6 w-6" />}
          label="Total Points"
          value={userStats.total_points || 0}
          meta={`+${userStats.total_points || 0} this week`}
          accent="green"
          trend={{ value: 'This week', direction: 'up', sr: 'Points gained this week' }}
        />
        <StatCard
          icon={<Award className="h-6 w-6" />}
          label="Global Rank"
          value="#1"
          meta="↑5 positions"
          accent="green"
          trend={{ value: '+5', direction: 'up', sr: 'Rank improved by five' }}
        />
        <StatCard
          icon={<Camera className="h-6 w-6" />}
          label="Reports Submitted"
          value={userStats.total_activities || 0}
          meta={`${userStats.total_activities || 0} verified`}
          accent="green"
        />
        <StatCard
          icon={<Recycle className="h-6 w-6" />}
          label="Total Waste Collected"
          value={`${userStats.total_weight || 0}kg`}
          meta="Progress toward goal"
          accent="green"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="lg:col-span-2 card-surface"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              <MapPin className="h-5 w-5 text-green-600" />
              Recent Reports
            </h2>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-md px-2 py-1">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">No recent reports found.</div>
            ) : (
              recentReports.map((report) => {
                const status = report.status || 'Pending';
                const statusStyles =
                  /completed/i.test(status) ? 'bg-green-50 text-green-700 border border-green-100' :
                  /progress/i.test(status) ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                  'bg-gray-50 text-gray-600 border border-gray-100';
                return (
                  <div key={report.id} className="p-4 rounded-lg border hover-lift bg-white/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                        <Camera className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{report.location || report.address || 'Unknown Location'}</p>
                        <p className="text-xs text-gray-500 truncate">{(report.type || report.category || 'N/A')} • {report.date ? report.date : (report.created_at ? new Date(report.created_at).toLocaleDateString() : '')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${statusStyles}`}>{status}</span>
                      <span className="text-xs font-medium">
                        {/completed/i.test(status) ? (
                          <span className="text-green-600">+50 pts</span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Task Status */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-2 card-surface"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              <ClipboardList className="h-5 w-5 text-green-600" />
              Task Status
            </h2>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-md px-2 py-1 disabled:opacity-50"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </button>
          </div>
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">No tasks assigned yet.</div>
            ) : (
              recentTasks.map((task) => {
                const status = task.status;
                const statusStyles =
                  status === 'completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                  status === 'in_progress' ? 'bg-green-50/60 text-green-600 border border-green-100' :
                  'bg-green-50/40 text-green-600 border border-green-100/60';
                return (
                  <div key={task.id} className="p-4 rounded-lg border hover-lift bg-white/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <ClipboardList className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{task.type === 'collection' ? 'Waste Collection' : 'Cleanup Task'}</p>
                        <p className="text-xs text-gray-500 truncate">{task.report?.location || 'Location not specified'} • {task.assigned_at ? `Assigned ${new Date(task.assigned_at).toLocaleDateString()}` : 'Recently assigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${statusStyles}`}>
                        {status === 'assigned' ? 'Assigned' : status === 'in_progress' ? 'In Progress' : status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                      {task.ragpicker_id && (
                        <span className="text-[11px] text-gray-400">Operator #{task.ragpicker_id}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="card-surface"
          >
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              Weekly Activity
            </h2>
            <div className="flex items-end justify-between h-24">
              {weeklyStats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center w-full">
                  <div
                    className="w-6 rounded-t-lg bg-gradient-to-t from-green-600 to-green-400/60 transition-all duration-500"
                    style={{ height: `${(stat.reports / Math.max(...weeklyStats.map(s => s.reports))) * 72}px` }}
                  />
                  <span className="text-[11px] text-gray-500 mt-1">{stat.day}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
            <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card-surface"
          >
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-green-600" />
              Recent Achievements
            </h2>
            <div className="space-y-3">
              {achievements.slice(0, 3).map((achievement, index) => (
                <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border hover-lift ${
                  achievement.earned ? 'bg-green-50/70 border-green-100' : 'bg-gray-50/60 border-gray-100'
                }`}>
                  <span className="text-xl" aria-hidden="true">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>{achievement.title}</p>
                    <p className={`text-xs ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`}>{achievement.description}</p>
                  </div>
                  {achievement.earned && <Medal className="h-4 w-4 text-green-600" aria-label="Earned" />}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Community Feed */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="card-surface"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
            <Users className="h-5 w-5 text-green-600" />
            Community Highlights
          </h2>
          <button className="text-green-600 hover:text-green-700 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-md px-2 py-1">
            View Community
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communityPosts.map((post) => (
            <div key={post.id} className="p-4 rounded-lg border bg-white/50 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-50 border border-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{post.user}</p>
                  <p className="text-xs text-gray-500">{post.time}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{post.content}</p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors text-xs">
                  <Heart className="h-3 w-3" /> {post.likes}
                </button>
                <button className="flex items-center gap-1 text-gray-400 hover:text-green-600 transition-colors text-xs">
                  <MessageCircle className="h-3 w-3" /> {post.comments}
                </button>
                <button className="flex items-center gap-1 text-gray-400 hover:text-green-700 transition-colors text-xs">
                  <Share2 className="h-3 w-3" /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Report Waste', icon: Camera },
          { label: 'View Map', icon: MapPin },
          { label: 'Rewards', icon: Gift },
          { label: 'Community', icon: Users }
        ].map((action) => (
          <button
            key={action.label}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium hover-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <span className="absolute inset-0 bg-gradient-to-br from-green-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <action.icon className="h-5 w-5 text-green-600" />
            <span className="text-gray-700 group-hover:text-gray-900">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

