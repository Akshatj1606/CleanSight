import { createContext, useContext, useState, useEffect } from 'react';
import { 
  subscribeToAuth,
  signIn as fbSignIn,
  signUp as fbSignUp,
  signOut as fbSignOut,
  getCurrentUserWithProfile,
  updateProfileData,
  mapAuthError,
  signInWithGoogle as fbSignInWithGoogle
} from '@/lib/firebaseAuthService';
import { ensureUserDoc } from '@/lib/firebaseUserService';
// Fallback legacy local storage (migration)
import { userService, initializeSampleData } from '../lib/localDatabase.js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Keep legacy sample data init for offline demo fallback
    initializeSampleData();

    // Subscribe to Firebase auth state
    const unsubscribe = subscribeToAuth(async (authUser) => {
      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        // Ensure Firestore user doc exists (migration from localStorage if needed)
  const profile = await ensureUserDoc(authUser); // No initial data here; role decided elsewhere during onboarding
        const combined = { uid: authUser.uid, email: authUser.email, ...profile };
        setUser(combined);
      } catch (e) {
        console.error('Error loading user profile', e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const authUser = await fbSignIn(email, password);
      const full = await getCurrentUserWithProfile(authUser);
      setUser(full);
      return { user: full, redirectTo: getDashboardRoute(full.role) };
    } catch (error) {
      throw new Error(mapAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut();
      setUser(null);
      setSession(null);
      window.location.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signUp = async (email, password, userData) => {
    setLoading(true);
    try {
      const authUser = await fbSignUp(email, password, userData);
      const profile = await getCurrentUserWithProfile(authUser);
      setUser(profile);
      return { user: profile, redirectTo: getDashboardRoute(profile.role) };
    } catch (error) {
      throw new Error(mapAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (roleHint = 'citizen') => {
    setLoading(true);
    try {
      const authUser = await fbSignInWithGoogle({ role: roleHint });
      // Guarantee profile creation and fetch
      const full = await getCurrentUserWithProfile(authUser);
      setUser(full);
      // If missing location info, route to onboarding; otherwise dashboard
      const needsAddress = !full?.state || !full?.city || !full?.zone || !full?.address;
      return { user: full, redirectTo: needsAddress ? '/onboarding/address' : getDashboardRoute(full.role) };
    } catch (error) {
      throw new Error(mapAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'citizen': 'Citizen',
      'ragpicker': 'Kiosk Operator',
      'institution': 'Institution',
      'admin': 'Administrator'
    };
    return roleNames[role] || 'User';
  };

  const getDashboardRoute = (role) => {
    const routes = {
      'citizen': '/dashboard',
      'ragpicker': '/r/tasks',
      'institution': '/org/dashboard',
      'admin': '/admin/overview'
    };
    return routes[role] || '/dashboard';
  };

  const updateUser = async (updatedUserData) => {
    if (!user?.uid) return null;
    await updateProfileData(user.uid, updatedUserData);
    const refreshed = { ...user, ...updatedUserData, updatedAt: Date.now() };
    setUser(refreshed);
    return refreshed;
  };

  const value = {
    user,
  session: null,
    userRole: user?.role || null,
    loading,
    signIn,
    signOut,
    signUp,
  signInWithGoogle,
    updateUser,
    getRoleDisplayName,
    getDashboardRoute
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
