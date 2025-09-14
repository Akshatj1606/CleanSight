import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  MapPin, 
  Camera, 
  Palette, 
  Globe, 
  Phone, 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader,
  RefreshCw,
  Settings as SettingsIcon,
  Check,
  X,
  AlertCircle,
  Moon,
  Sun,
  Upload,
  UserCheck,
  Activity,
  Calendar,
  Gift
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { userService } from '../../lib/localDatabase';
import ProfilePicture from '../ui/ProfilePicture';
import ToggleSwitch from '../ui/ToggleSwitch';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme = 'light', toggleTheme = () => {} } = useTheme() || {};
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Form states
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    profile_image: null
  });

  const [preferences, setPreferences] = useState({
    notifications: {
      email_reports: true,
      push_updates: true,
      task_notifications: true,
      weekly_summary: false,
      promotional: false
    },
    privacy: {
      profile_visibility: 'public',
      location_sharing: true,
      activity_visibility: true,
      leaderboard_participation: true
    },
    location: {
      default_city: '',
      auto_location: true,
      preferred_zones: []
    },
    display: {
      language: 'en',
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      units: 'metric'
    }
  });

  const [security, setSecurity] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
    two_factor_enabled: false,
    show_current_password: false,
    show_new_password: false,
    show_confirm_password: false
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [saveMessage, setSaveMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateProfile = () => {
    const newErrors = {};
    
    if (!profile.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (profile.phone && !/^\+?[\d\s\-\(\)]+$/.test(profile.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!security.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    
    if (!security.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (security.new_password.length < 6) {
      newErrors.new_password = 'Password must be at least 6 characters';
    }
    
    if (security.new_password !== security.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Load user settings
  const loadUserSettings = useCallback(async () => {
    if (!user) return;
    
    console.log('Loading settings for user:', user.id);
    setLoading(true);
    try {
      // Get latest user data
      const userData = await userService.getUserById(user.id);
      console.log('Fetched user data:', userData);
      
      if (userData) {
        setProfile({
          full_name: userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          bio: userData.bio || '',
          profile_image: userData.profile_image || null
        });

        // Initialize with default values if settings don't exist
        const defaultNotifications = {
          email_reports: true,
          push_updates: true,
          task_notifications: true,
          weekly_summary: false,
          promotional: false
        };

        const defaultPrivacy = {
          profile_visibility: 'public',
          location_sharing: true,
          activity_visibility: true,
          leaderboard_participation: true
        };

        const defaultLocation = {
          default_city: '',
          auto_location: true,
          preferred_zones: []
        };

        const defaultDisplay = {
          language: 'en',
          timezone: 'UTC',
          date_format: 'MM/DD/YYYY',
          units: 'metric'
        };

        setPreferences({
          notifications: {
            ...defaultNotifications,
            ...(userData.settings?.notifications || {})
          },
          privacy: {
            ...defaultPrivacy,
            ...(userData.settings?.privacy || {})
          },
          location: {
            ...defaultLocation,
            ...(userData.settings?.location || {})
          },
          display: {
            ...defaultDisplay,
            ...(userData.settings?.display || {})
          }
        });

        setSecurity(prev => ({
          ...prev,
          two_factor_enabled: userData.two_factor_enabled || false
        }));
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      setSaveMessage('Error loading settings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auto-refresh every 2 minutes (only when tab is active)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clear interval when tab is not active
        if (window.settingsInterval) {
          clearInterval(window.settingsInterval);
          window.settingsInterval = null;
        }
      } else {
        // Start interval when tab becomes active
        if (!window.settingsInterval) {
          window.settingsInterval = setInterval(() => {
            loadUserSettings();
          }, 120000); // 2 minutes instead of 30 seconds
        }
      }
    };

    // Set up interval initially if tab is active
    if (!document.hidden && !window.settingsInterval) {
      window.settingsInterval = setInterval(() => {
        loadUserSettings();
      }, 120000);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (window.settingsInterval) {
        clearInterval(window.settingsInterval);
        window.settingsInterval = null;
      }
    };
  }, [loadUserSettings]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadUserSettings();
    } else {
      console.warn('No user found, redirecting or creating test user...');
      // Create a test user for development
      const testUser = {
        id: "citizen-test-1",
        email: "citizen@test.com",
        full_name: "Test Citizen",
        role: "citizen",
        phone: "",
        address: "",
        bio: "",
        created_at: new Date().toISOString()
      };
      
      // Store test user
      const users = JSON.parse(localStorage.getItem('cleansight_users') || '[]');
      const existingUserIndex = users.findIndex(u => u.id === testUser.id);
      if (existingUserIndex === -1) {
        users.push(testUser);
        localStorage.setItem('cleansight_users', JSON.stringify(users));
      }
      
      localStorage.setItem('cleansight_auth_user', JSON.stringify(testUser));
      setTimeout(() => window.location.reload(), 100);
    }
  }, [loadUserSettings, user]);

  // Save settings
  const handleSave = useCallback(async (section = 'all') => {
    console.log('Saving settings, section:', section);
    setSaving(true);
    setSaveMessage('');
    setErrors({});

    try {
      if (section === 'all') {
        // Save profile first
        if (validateProfile()) {
          const profileUpdates = {
            full_name: profile.full_name.trim(),
            email: profile.email.trim(),
            phone: profile.phone.trim(),
            address: profile.address.trim(),
            bio: profile.bio.trim(),
            profile_image: profile.profile_image
          };

          console.log('Updating profile with:', profileUpdates);
          const updatedUser = await userService.updateProfile(user.id, profileUpdates);
          console.log('Profile updated:', updatedUser);
          updateUser(updatedUser);
        }
        
        // Save all preferences
        const settingsUpdate = {
          notifications: preferences.notifications,
          privacy: preferences.privacy,
          location: preferences.location,
          display: preferences.display
        };

        console.log('Updating all settings with:', settingsUpdate);
        await userService.updateUserSettings(user.id, settingsUpdate);
        console.log('All settings updated successfully');
        setSaveMessage('All settings saved successfully!');
      } else if (section === 'profile') {
        if (!validateProfile()) {
          setSaving(false);
          setSaveMessage('Please fix the errors below');
          return;
        }
        const profileUpdates = {
          full_name: profile.full_name.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
          address: profile.address.trim(),
          bio: profile.bio.trim(),
          profile_image: profile.profile_image
        };
        console.log('Updating profile with:', profileUpdates);
        const updatedUser = await userService.updateProfile(user.id, profileUpdates);
        console.log('Profile updated:', updatedUser);
        updateUser(updatedUser);
        setSaveMessage('Profile updated successfully!');
      }

      if (section === 'preferences' || section === 'notifications' || section === 'privacy' || section === 'location' || section === 'display') {
        const settingsUpdate = {};
        
        if (section === 'notifications' || section === 'preferences') {
          settingsUpdate.notifications = preferences.notifications;
        }
        if (section === 'privacy' || section === 'preferences') {
          settingsUpdate.privacy = preferences.privacy;
        }
        if (section === 'location' || section === 'preferences') {
          settingsUpdate.location = preferences.location;
        }
        if (section === 'display' || section === 'preferences') {
          settingsUpdate.display = preferences.display;
        }

        console.log('Updating settings with:', settingsUpdate);
        await userService.updateUserSettings(user.id, settingsUpdate);
        console.log('Settings updated successfully');
        setSaveMessage('Settings updated successfully!');
      }

      if (section === 'security') {
        if (!validatePassword()) {
          setSaving(false);
          setSaveMessage('Please fix the password errors below');
          return;
        }

        try {
          console.log('Changing password for user:', user.id);
          await userService.changePassword(user.id, security.current_password, security.new_password);
          
          if (security.two_factor_enabled !== user.two_factor_enabled) {
            console.log('Toggling 2FA to:', security.two_factor_enabled);
            await userService.toggleTwoFactor(user.id, security.two_factor_enabled);
          }

          setSaveMessage('Security settings updated successfully!');
          
          // Clear password fields
          setSecurity(prev => ({
            ...prev,
            current_password: '',
            new_password: '',
            confirm_password: ''
          }));

        } catch (error) {
          console.error('Security update error:', error);
          if (error.message.includes('Current password')) {
            setErrors({ current_password: error.message });
            setSaveMessage('Please check your current password');
          } else {
            setSaveMessage('Error updating security settings');
          }
          setSaving(false);
          return;
        }
      }

      setLastSaved(new Date());
      
      // Reload user settings to sync changes
      setTimeout(() => {
        loadUserSettings();
      }, 500);
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setSaveMessage(''), 5000);

    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage(error.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  }, [profile, preferences, security, user, updateUser, validateProfile, validatePassword, loadUserSettings]);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    await loadUserSettings();
  }, [loadUserSettings]);

  // Handle profile image upload
  const handleImageUpload = useCallback((imageData) => {
    setProfile(prev => ({ ...prev, profile_image: imageData }));
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback((field) => {
    setSecurity(prev => ({
      ...prev,
      [`show_${field}`]: !prev[`show_${field}`]
    }));
  }, []);

  // Clear specific error
  const clearError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between" role="banner">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Refresh settings"
            aria-label="Refresh settings"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
          <button
            onClick={() => handleSave('all')}
            disabled={saving}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
            aria-label="Save all settings"
          >
            {saving ? <Loader className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            Save All
          </button>
        </div>
      </div>

      {/* Save Message */}
      <div aria-live="polite" role="status">
        {saveMessage && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            saveMessage.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {saveMessage.includes('Error') ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {saveMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-surface p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card-surface p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                
                {/* Profile Image */}
                <div className="flex items-center gap-6">
                  <ProfilePicture 
                    src={profile.profile_image || user?.profileImage} 
                    alt={profile.full_name || 'User'} 
                    size="2xl"
                    editable={true}
                    onImageChange={handleImageUpload}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-500">JPG, PNG up to 5MB. Click the camera icon to change.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => {
                        setProfile(prev => ({ ...prev, full_name: e.target.value }));
                        if (errors.full_name) clearError('full_name');
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.full_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.full_name}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => {
                        setProfile(prev => ({ ...prev, email: e.target.value }));
                        if (errors.email) clearError('email');
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => {
                        setProfile(prev => ({ ...prev, phone: e.target.value }));
                        if (errors.phone) clearError('phone');
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Your address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    maxLength={500}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Tell us about yourself..."
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {profile.bio.length}/500 characters
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSave('profile')}
                    disabled={saving}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Profile
                  </button>
                  
                  {lastSaved && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Check className="h-4 w-4 text-green-500" />
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Notification Preferences</h2>
                
                <div className="space-y-4">
                  {Object.entries(preferences.notifications).map(([key, value]) => {
                    const label = key.replace('_', ' ');
                    const description =
                      key === 'email_reports' ? 'Get notified via email when you submit new reports or when they are updated' :
                      key === 'push_updates' ? 'Receive push notifications for important app updates and announcements' :
                      key === 'task_notifications' ? 'Get notified when collection services are assigned to clean your reported areas' :
                      key === 'weekly_summary' ? 'Receive a weekly summary of your environmental impact and achievements' :
                      key === 'promotional' ? 'Get promotional emails about new features, rewards, and community events' : '';
                    return (
                      <div key={key} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {key === 'email_reports' && <Mail className="h-5 w-5 text-blue-500" />}
                            {key === 'push_updates' && <Bell className="h-5 w-5 text-green-500" />}
                            {key === 'task_notifications' && <Activity className="h-5 w-5 text-orange-500" />}
                            {key === 'weekly_summary' && <Calendar className="h-5 w-5 text-purple-500" />}
                            {key === 'promotional' && <Gift className="h-5 w-5 text-pink-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <ToggleSwitch
                              checked={value}
                              onChange={(next) => setPreferences(prev => ({
                                ...prev,
                                notifications: {
                                  ...prev.notifications,
                                  [key]: next
                                }
                              }))}
                              label={label}
                              description={description}
                              className="w-full"
                            />
                            {value && (
                              <div className="flex items-center gap-1 mt-1 pl-[52px]">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-xs text-green-600">Active</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Notification Settings</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        You can customize when and how you receive notifications. All critical security notifications will always be delivered.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSave('notifications')}
                    disabled={saving}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Notifications
                  </button>

                  {lastSaved && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Check className="h-4 w-4 text-green-500" />
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Privacy Settings</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Profile Visibility</h3>
                    <div className="space-y-2">
                      {['public', 'friends', 'private'].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="profile_visibility"
                            value={option}
                            checked={preferences.privacy.profile_visibility === option}
                            onChange={(e) => setPreferences(prev => ({
                              ...prev,
                              privacy: {
                                ...prev.privacy,
                                profile_visibility: e.target.value
                              }
                            }))}
                            className="mr-2 text-green-500"
                          />
                          <span className="capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {Object.entries(preferences.privacy).filter(([key]) => key !== 'profile_visibility').map(([key, value]) => {
                    const description =
                      key === 'location_sharing' ? 'Allow sharing your location for better task matching' :
                      key === 'activity_visibility' ? 'Show your activity in public feeds' :
                      key === 'leaderboard_participation' ? 'Participate in public leaderboards' : '';
                    return (
                      <div key={key} className="p-4 bg-gray-50 rounded-lg">
                        <ToggleSwitch
                          checked={value}
                          onChange={(next) => setPreferences(prev => ({
                            ...prev,
                            privacy: {
                              ...prev.privacy,
                              [key]: next
                            }
                          }))}
                          label={key.replace('_', ' ')}
                          description={description}
                          className="w-full"
                        />
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleSave('preferences')}
                  disabled={saving}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Privacy Settings
                </button>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Location Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default City
                    </label>
                    <input
                      type="text"
                      value={preferences.location.default_city}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          default_city: e.target.value
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <ToggleSwitch
                      checked={preferences.location.auto_location}
                      onChange={(next) => setPreferences(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          auto_location: next
                        }
                      }))}
                      label="Auto-detect Location"
                      description="Automatically detect your location for reports"
                      className="w-full"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSave('preferences')}
                  disabled={saving}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Location Settings
                </button>
              </div>
            )}

            {/* Display Tab */}
            {activeTab === 'display' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Display Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Theme</h3>
                      <p className="text-sm text-gray-500">Switch between light and dark mode</p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <select
                        value={preferences.display.language}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          display: {
                            ...prev.display,
                            language: e.target.value
                          }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Format
                      </label>
                      <select
                        value={preferences.display.date_format}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          display: {
                            ...prev.display,
                            date_format: e.target.value
                          }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSave('preferences')}
                  disabled={saving}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Display Settings
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Security Settings</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-medium text-yellow-800 mb-2">Change Password</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password *
                        </label>
                        <div className="relative">
                          <input
                            type={security.show_current_password ? 'text' : 'password'}
                            placeholder="Enter current password"
                            value={security.current_password}
                            onChange={(e) => {
                              setSecurity(prev => ({ ...prev, current_password: e.target.value }));
                              if (errors.current_password) clearError('current_password');
                            }}
                            className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                              errors.current_password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current_password')}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {security.show_current_password ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors.current_password && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.current_password}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={security.show_new_password ? 'text' : 'password'}
                            placeholder="Enter new password"
                            value={security.new_password}
                            onChange={(e) => {
                              setSecurity(prev => ({ ...prev, new_password: e.target.value }));
                              if (errors.new_password) clearError('new_password');
                            }}
                            className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                              errors.new_password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new_password')}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {security.show_new_password ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors.new_password && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.new_password}
                          </p>
                        )}
                        {security.new_password && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Password strength:</span>
                              <div className={`px-2 py-1 rounded text-xs ${
                                security.new_password.length < 6 ? 'bg-red-100 text-red-700' :
                                security.new_password.length < 10 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {security.new_password.length < 6 ? 'Weak' :
                                 security.new_password.length < 10 ? 'Medium' : 'Strong'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={security.show_confirm_password ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={security.confirm_password}
                            onChange={(e) => {
                              setSecurity(prev => ({ ...prev, confirm_password: e.target.value }));
                              if (errors.confirm_password) clearError('confirm_password');
                            }}
                            className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                              errors.confirm_password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm_password')}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {security.show_confirm_password ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors.confirm_password && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.confirm_password}
                          </p>
                        )}
                        {security.new_password && security.confirm_password && security.new_password === security.confirm_password && (
                          <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            Passwords match
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="mt-1"><Shield className="h-5 w-5 text-blue-500" /></div>
                      <div className="flex-1 min-w-0">
                        <ToggleSwitch
                          checked={security.two_factor_enabled}
                          onChange={(next) => setSecurity(prev => ({ ...prev, two_factor_enabled: next }))}
                          label="Two-Factor Authentication"
                          description="Add an extra layer of security to your account"
                          className="w-full"
                        />
                        {security.two_factor_enabled && (
                          <p className="text-sm text-green-600 mt-1 pl-[52px]">✓ 2FA is currently enabled</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Account Activity</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Last login: {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                        </p>
                        <p className="text-sm text-blue-700">
                          Password last changed: {user?.password_changed_at ? new Date(user.password_changed_at).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSave('security')}
                    disabled={saving || (!security.new_password && security.two_factor_enabled === user?.two_factor_enabled)}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Update Security
                  </button>

                  {lastSaved && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Check className="h-4 w-4 text-green-500" />
                      Last updated: {lastSaved.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
