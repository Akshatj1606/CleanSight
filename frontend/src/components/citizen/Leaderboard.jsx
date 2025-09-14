import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  TrendingUp, 
  Users, 
  Calendar,
  Crown,
  Zap,
  RefreshCw,
  Weight,
  MapPin
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { leaderboardService, userService, initializeSampleData } from "@/lib/localDatabase.js";

const timeFilters = [
  { id: 'week', label: 'This Week', icon: Calendar },
  { id: 'month', label: 'This Month', icon: TrendingUp },
  { id: 'year', label: 'This Year', icon: Trophy },
  { id: 'all', label: 'All Time', icon: Star }
];

const getRankIcon = (rank) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-green-600" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-green-500" />;
  if (rank === 3) return <Award className="h-5 w-5 text-green-500" />;
  return <Star className="h-5 w-5 text-green-400" />;
};

const getRankClasses = (rank, isCurrentUser) => {
  const base = 'w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm ring-1';
  if (isCurrentUser) return base + ' bg-green-600 text-white ring-green-500 shadow';
  if (rank === 1) return base + ' bg-green-600 text-white ring-green-500';
  if (rank === 2) return base + ' bg-green-500/90 text-white ring-green-400';
  if (rank === 3) return base + ' bg-green-500/70 text-white ring-green-300';
  return base + ' bg-green-50 text-green-700 ring-green-200';
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('month');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalPoints: 0,
    totalWeight: 0
  });
  const [userRank, setUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const statusRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Load leaderboard data
  const loadLeaderboardData = async () => {
  setIsLoading(true);
  setStatusMessage('Loading leaderboard data...');
    try {
      // Initialize sample data if needed
      initializeSampleData();
      
      // Get leaderboard data
      const citizensLeaderboard = await leaderboardService.getLeaderboard('citizens', selectedFilter);
      const ragpickersLeaderboard = await leaderboardService.getLeaderboard('ragpickers', selectedFilter);
      
      // Combine and rank all users
      const combinedData = [...citizensLeaderboard, ...ragpickersLeaderboard]
        .sort((a, b) => b.total_points - a.total_points)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
          reportsSubmitted: Math.floor(entry.total_points / 30) || 1, // Estimate reports from points
          impactScore: Math.min(100, Math.floor((entry.total_points / 10) + 50)), // Calculate impact score
          badges: generateBadges(entry),
          change: 'same', // For now, we'll show as same (in real app, compare with previous period)
          changeAmount: 0
        }));

      setLeaderboardData(combinedData);

      // Calculate global stats
      const allUsers = await getAllUsers();
      const stats = {
        totalUsers: allUsers.filter(u => u.role === 'citizen' || u.role === 'ragpicker').length,
        totalPoints: allUsers.reduce((sum, u) => sum + (u.total_points || 0), 0),
        totalWeight: allUsers.reduce((sum, u) => sum + (u.total_weight || 0), 0)
      };
      setGlobalStats(stats);

      // Find current user's rank
      if (user) {
        const userIndex = combinedData.findIndex(entry => entry.user_id === user.id);
        setUserRank(userIndex >= 0 ? userIndex + 1 : null);
      }

      const now = new Date();
      setLastUpdated(now);
      setStatusMessage(`Leaderboard updated at ${now.toLocaleTimeString()}`);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setStatusMessage('Error loading leaderboard.');
    } finally {
      setIsLoading(false);
      setTimeout(()=>statusRef.current?.focus(), 40);
    }
  };

  // Helper function to get all users
  const getAllUsers = async () => {
    const users = JSON.parse(localStorage.getItem('cleansight_users') || '[]');
    return users;
  };

  // Generate badges based on user performance
  const generateBadges = (userEntry) => {
    const badges = [];
    
    if (userEntry.total_points >= 500) badges.push('Eco Champion');
    if (userEntry.total_points >= 200) badges.push('Week Warrior');
    if (userEntry.total_points >= 100) badges.push('Active Contributor');
    if (userEntry.role === 'ragpicker' && userEntry.total_earnings >= 1000) badges.push('Top Collector');
    if (userEntry.role === 'citizen') badges.push('Community Reporter');
    if (userEntry.role === 'ragpicker') badges.push('Cleanup Hero');

    return badges.length > 0 ? badges : ['New Member'];
  };

  // Auto-refresh every 3 minutes (only when tab is active)
  useEffect(() => {
    loadLeaderboardData();
    
    // Auto-refresh with visibility detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (window.leaderboardInterval) {
          clearInterval(window.leaderboardInterval);
          window.leaderboardInterval = null;
        }
      } else {
        if (!window.leaderboardInterval) {
          window.leaderboardInterval = setInterval(() => {
            loadLeaderboardData();
          }, 180000); // 3 minutes
        }
      }
    };

    if (!document.hidden && !window.leaderboardInterval) {
      window.leaderboardInterval = setInterval(() => {
        loadLeaderboardData();
      }, 180000);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (window.leaderboardInterval) {
        clearInterval(window.leaderboardInterval);
        window.leaderboardInterval = null;
      }
    };
  }, [selectedFilter, user]);

  // Manual refresh
  const handleRefresh = () => {
    loadLeaderboardData();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div ref={statusRef} tabIndex={-1} aria-live="polite" className="sr-only">{statusMessage}</div>
      {/* Header */}
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3">
          Community Leaderboard
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Recognizing citizens & collectors driving a cleaner city.
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.05 }}
      >
        <div className="card-surface p-0">
          <div className="p-5 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-4 ring-1 ring-green-200">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{globalStats.totalUsers.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Active Contributors</p>
          </div>
        </div>
        <div className="card-surface p-0">
          <div className="p-5 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-4 ring-1 ring-green-200">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{globalStats.totalPoints.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Points</p>
          </div>
        </div>
        <div className="card-surface p-0">
          <div className="p-5 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-4 ring-1 ring-green-200">
              <Weight className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{globalStats.totalWeight.toFixed(1)} kg</p>
            <p className="text-sm text-gray-500">Waste Collected</p>
          </div>
        </div>
        {userRank && (
          <div className="card-surface p-0">
            <div className="p-5 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4 ring-1 ring-green-300">
                <MapPin className="h-6 w-6 text-green-700" />
              </div>
              <p className="text-2xl font-bold text-green-700">#{userRank}</p>
              <p className="text-sm text-gray-500">Your Rank</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="flex flex-wrap justify-center gap-3 mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.1 }}
      >
        {timeFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = selectedFilter === filter.id;
          
          return (
            <Button
              key={filter.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <Icon className="h-4 w-4" />
              {filter.label}
            </Button>
          );
        })}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Leaderboard */}
      <div className="max-w-4xl mx-auto">
        <div className="card-surface p-0">
          <div className="px-6 pt-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" /> Top Contributors ({selectedFilter === 'week' ? 'This Week' : selectedFilter === 'month' ? 'This Month' : selectedFilter === 'year' ? 'This Year' : 'All Time'})
            </h2>
            <div className="text-xs text-gray-500">Updated {lastUpdated.toLocaleTimeString()}</div>
          </div>
          <div className="px-6 pb-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
                <span className="ml-3 text-sm text-gray-500">Loading leaderboard...</span>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-14">
                <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                <p className="text-base font-medium text-gray-600 mb-1">No data available</p>
                <p className="text-sm text-gray-400">Be the first to contribute and appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {leaderboardData.map((entry, index) => (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.4) }}
                      className={`flex items-center gap-4 p-4 border rounded-xl hover:border-green-300/70 hover:bg-white/70 transition-colors group backdrop-blur-sm ${
                        user && entry.user_id === user.id ? 'border-green-400/70 bg-green-50/70' : 'border-gray-200 bg-white/40'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0">
                        <div className={getRankClasses(entry.rank, user && entry.user_id === user.id)}>{entry.rank}</div>
                      </div>

                      {/* Avatar & Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-12 h-12 ring-1 ring-green-100">
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback className="bg-green-50 text-green-600">
                            {entry.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {entry.full_name || 'Unknown User'}
                              {user && entry.user_id === user.id && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">You</span>
                              )}
                            </h3>
                            <Badge variant="outline" className="text-xs capitalize bg-green-50 text-green-700 border-green-200">
                              {entry.role}
                            </Badge>
                            {entry.rank <= 3 && getRankIcon(entry.rank)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{entry.reportsSubmitted} reports</span>
                            <span>•</span>
                            <span>{entry.impactScore}% impact</span>
                            {entry.role === 'ragpicker' && entry.total_earnings > 0 && (
                              <>
                                <span>•</span>
                                <span>₹{entry.total_earnings} earned</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Points & Badges */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-700">{entry.total_points.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">points</p>
                        </div>
                        
                        <div className="flex gap-1">
                          {entry.badges.slice(0, 2).map((badge, badgeIndex) => (
                            <Badge 
                              key={badgeIndex} 
                              variant="outline" 
                              className="text-xs bg-green-50 text-green-700 border-green-200"
                            >
                              {badge}
                            </Badge>
                          ))}
                          {entry.badges.length > 2 && (
                            <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-500">
                              +{entry.badges.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Rank Change */}
                      <div className="flex-shrink-0">
                        {entry.change === 'up' && (
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm">+{entry.changeAmount}</span>
                          </div>
                        )}
                        {entry.change === 'down' && (
                          <div className="flex items-center gap-1 text-red-500">
                            <TrendingUp className="h-4 w-4 rotate-180" />
                            <span className="text-sm">-{entry.changeAmount}</span>
                          </div>
                        )}
                        {entry.change === 'same' && (
                          <div className="text-gray-400 text-sm">-</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div 
        className="text-center mt-12"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.15 }}
      >
        <p className="text-gray-500 mb-4">Want to climb the leaderboard?</p>
        <Button 
          variant="default" 
          size="lg"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => window.location.href = '/citizen/report'}
        >
          <Zap className="h-5 w-5 mr-2" />
          Start Contributing
        </Button>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
