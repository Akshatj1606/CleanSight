import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Upload, 
  Users,
  Building2,
  Shield,
  Check,
  MapPin,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getStates, getDistricts, getZones, getFullLocationString } from '@/lib/locationData';
import { signInWithGoogleRaw, signOut as googleSignOut } from '@/lib/firebaseAuthService';
import { ensureUserDoc } from '@/lib/firebaseUserService';

const Register = () => {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isGoogleFlow = searchParams.get('google') === '1';
  const pendingEmail = (()=>{ try { return sessionStorage.getItem('pendingGoogleEmail') || ''; } catch(_) { return ''; } })();
  
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: isGoogleFlow ? pendingEmail : '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: '',
    // Location fields
    state: '',
    city: '',
    zone: '',
    address: ''
  });

  // Location handlers
  const handleStateChange = (state) => {
    setFormData(prev => ({
      ...prev,
      state,
      city: '',
      zone: ''
    }));
  };

  const handleCityChange = (city) => {
    setFormData(prev => ({
      ...prev,
      city,
      zone: ''
    }));
  };

  const handleZoneChange = (zone) => {
    setFormData(prev => ({
      ...prev,
      zone
    }));
  };

  const handleAddressChange = (e) => {
    setFormData(prev => ({
      ...prev,
      address: e.target.value
    }));
  };

  const roles = [
    {
      id: 'citizen',
      name: 'Citizen',
      description: 'Report waste and environmental issues',
      icon: <User className="w-8 h-8" />,
      color: 'bg-blue-500'
    },
    {
      id: 'ragpicker',
      name: 'Ragpicker',
      description: 'Collect and process recyclable waste',
      icon: <Users className="w-8 h-8" />,
      color: 'bg-green-500'
    },
    {
      id: 'institution',
      name: 'Institution',
      description: 'Manage waste collection operations',
      icon: <Building2 className="w-8 h-8" />,
      color: 'bg-purple-500'
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'System administration and oversight',
      icon: <Shield className="w-8 h-8" />,
      color: 'bg-red-500'
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
    setFormData(prev => ({ ...prev, role: role.id }));
    try { sessionStorage.setItem('pendingGoogleRole', role.id); } catch(_) {}
  };

  // Restore role & advance if coming back with google flow
  useEffect(() => {
    if (isGoogleFlow && step === 1) {
      try {
        const r = sessionStorage.getItem('pendingGoogleRole');
        if (r) {
          setSelectedRole(r);
          setFormData(prev => ({ ...prev, role: r }));
          // Do NOT auto-advance; wait for user to click Continue or Google
        }
      } catch(_) {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGoogleFlow, step]);

  const handleGoogleStep1 = async () => {
    if (!selectedRole) {
      alert('Please select a role first.');
      return;
    }
    setLoading(true);
    try {
      const cred = await signInWithGoogleRaw();
      const email = cred.user.email;
      // Check if user profile already exists
      const { getUserProfile } = await import('@/lib/firebaseUserService');
      const existing = await getUserProfile(cred.user.uid);
      if (existing) {
        // Existing user; send them to dashboard (or login) directly
        navigate('/dashboard', { replace: true });
        return;
      }
      try {
        sessionStorage.setItem('pendingGoogleEmail', email);
        sessionStorage.setItem('pendingGoogleRole', selectedRole);
      } catch(_) {}
      // Sign out so we can finish details before finalizing
      await googleSignOut();
      navigate('/register?google=1', { replace: true });
    } catch (e) {
      console.error('Google init failed', e);
      alert(e.message || 'Google sign-in failed to initialize');
    } finally {
      setLoading(false);
    }
  };

  // If already logged in AND not mid Google deferred flow, redirect
  useEffect(() => {
    if (!user) return;
    // In Google flow we only sign in at final submission now, so safe to redirect immediately
    navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    if (step === 2) {
      if (isGoogleFlow) {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
          alert('Please fill in all required fields');
          return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
          alert('Please enter a valid email');
          return false;
        }
        if (!/^\d{10}$/.test(formData.phoneNumber)) {
          alert('Please enter a valid 10-digit phone number');
          return false;
        }
      } else {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phoneNumber) {
          alert('Please fill in all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          alert('Password must be at least 6 characters long');
          return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
          alert('Please enter a valid email address');
          return false;
        }
        if (!/^\d{10}$/.test(formData.phoneNumber)) {
          alert('Please enter a valid 10-digit phone number');
          return false;
        }
      }
    } else if (step === 3) {
      if (!formData.state || !formData.city || !formData.zone || !formData.address.trim()) {
        alert('Please select your complete location (State, City, Zone) and enter your address');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    
    try {
      const userData = {
        ...formData,
        profileImage,
        fullLocation: getFullLocationString(formData.state, formData.city, formData.zone)
      };
      
      if (isGoogleFlow) {
        // Defer Google auth until final step
        if (step === 2) {
          // Move to location step
            setStep(3);
            setLoading(false);
            return;
        } else if (step === 3 && selectedRole !== 'citizen') {
          // Non-citizen roles have additional details step next
          setStep(4);
          setLoading(false);
          return;
        } else if ((step === 3 && selectedRole === 'citizen') || (step === 4 && selectedRole !== 'citizen')) {
          // Finalization point: perform Google sign-in now
          const cred = await signInWithGoogleRaw();
          // Create profile atomically with correct role & collected data
          await ensureUserDoc(cred.user, { ...userData, email: cred.user.email, role: selectedRole });
          try { sessionStorage.removeItem('pendingGoogleEmail'); sessionStorage.removeItem('pendingGoogleRole'); } catch(_) {}
          // user effect will redirect
        }
      } else {
        // Email/password flow
        if ((step === 2 && selectedRole === 'citizen') || (step === 3 && selectedRole !== 'citizen')) {
          // Not yet collected location -> advance
          if (selectedRole === 'citizen') {
            setStep(3);
          } else {
            setStep(step + 1); // move to location or additional details accordingly
          }
          setLoading(false);
          return;
        } else if ((step === 3 && selectedRole === 'citizen') || (step === 4 && selectedRole !== 'citizen')) {
          await signUp(formData.email, formData.password, userData);
          try { sessionStorage.removeItem('pendingGoogleEmail'); sessionStorage.removeItem('pendingGoogleRole'); } catch(_) {}
        }
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const states = getStates();
  const cities = formData.state ? getDistricts(formData.state) : [];
  const zones = formData.city ? getZones(formData.state, formData.city) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Particles */}
      <FloatingParticles count={25} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-2xl backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Join CleanSight
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Be part of the environmental revolution
              </p>
              
              {/* Progress Indicator */}
              <div className="flex justify-center mt-6 mb-4">
                <div className="flex items-center space-x-2">
                  {Array.from({ length: selectedRole === 'citizen' ? 3 : 4 }).map((_, index) => (
                    <div key={index} className="flex items-center">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ 
                          scale: step > index + 1 ? 1.1 : 1,
                          backgroundColor: step > index + 1 ? '#10b981' : step === index + 1 ? '#3b82f6' : '#e5e7eb'
                        }}
                        transition={{ duration: 0.3 }}
                        className={`w-3 h-3 rounded-full ${
                          step > index + 1 
                            ? 'bg-emerald-500' 
                            : step === index + 1 
                              ? 'bg-blue-500' 
                              : 'bg-gray-300'
                        }`}
                      />
                      {index < (selectedRole === 'citizen' ? 2 : 3) && (
                        <div className={`w-8 h-0.5 mx-1 ${
                          step > index + 1 ? 'bg-emerald-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Step {step} of {selectedRole === 'citizen' ? 3 : 4}
              </p>
            </motion.div>
          </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3"
                    >
                      Choose Your Role
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-600 text-lg"
                    >
                      Select how you want to contribute to a cleaner environment
                    </motion.p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roles.map((role, index) => (
                      <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * (index + 1) }}
                        whileHover={{ 
                          scale: 1.03,
                          y: -5,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        className={`group p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                          selectedRole === role.id 
                            ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-blue-50 shadow-lg shadow-emerald-500/25' 
                            : 'border-gray-200 hover:border-emerald-300 bg-white/50 hover:bg-white/80 hover:shadow-xl'
                        }`}
                        onClick={() => handleRoleSelect(role)}
                      >
                        <div className="flex flex-col items-center text-center space-y-4">
                          <motion.div 
                            className={`p-4 rounded-2xl text-white transition-all duration-300 ${role.color} group-hover:scale-110`}
                            whileHover={{ rotate: 5 }}
                          >
                            {role.icon}
                          </motion.div>
                          <h4 className="font-semibold text-xl text-gray-800 group-hover:text-emerald-700 transition-colors">{role.name}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{role.description}</p>
                          {selectedRole === role.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-4 mt-2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 }}
                    >
                      <Button
                        type="button"
                        disabled={!selectedRole}
                        onClick={() => setStep(2)}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      >
                        {selectedRole ? 'Continue' : 'Select a role to continue'}
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 }}
                    >
                      <Button
                        type="button"
                        disabled={loading || !selectedRole}
                        onClick={handleGoogleStep1}
                        variant="outline"
                        className="w-full py-3 bg-white border border-gray-300 hover:border-emerald-400 text-gray-700 hover:text-emerald-700 font-medium rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        {loading ? 'Processing...' : 'Use Google' }
                      </Button>
                      <p className="text-[11px] text-gray-500 mt-2 text-center">You can proceed normally or start with Google.</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Badge 
                        variant="secondary" 
                        className="capitalize px-4 py-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0"
                      >
                        {selectedRole}
                      </Badge>
                    </motion.div>
                  </div>

                  <div className="text-center mb-8">
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3"
                    >
                      Personal Information
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-gray-600 text-lg"
                    >
                      Tell us about yourself
                    </motion.p>
                  </div>

                  {/* Enhanced Profile Image Upload */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mb-8"
                  >
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative">
                        <Avatar className="w-28 h-28 border-4 border-white shadow-xl">
                          <AvatarImage src={profileImage} alt="Profile" />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-blue-100">
                            <User className="w-12 h-12 text-emerald-600" />
                          </AvatarFallback>
                        </Avatar>
                        <motion.label 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Upload className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </motion.label>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative group"
                    >
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        type="text"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="pl-12 py-3 border-2 rounded-xl focus:border-emerald-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="relative group"
                    >
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        type="text"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="pl-12 py-3 border-2 rounded-xl focus:border-emerald-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </motion.div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative group"
                  >
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={e => !isGoogleFlow && setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={isGoogleFlow}
                      className="pl-12 py-3 border-2 rounded-xl focus:border-emerald-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      required
                    />
                    {isGoogleFlow && (
                      <span className="absolute -bottom-5 left-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">Google account</span>
                    )}
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative group"
                  >
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="pl-12 py-3 border-2 rounded-xl focus:border-emerald-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      required
                    />
                  </motion.div>

                  {!isGoogleFlow && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className="relative group"
                    >
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-12 py-3 border-2 rounded-xl focus:border-emerald-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="relative group"
                    >
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-12 py-3 border-2 rounded-xl focus:border-emerald-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </motion.div>
                  </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Button 
                      type="submit" 
                      disabled={loading || (isGoogleFlow && !formData.email)}
                      className={`w-full py-3 ${isGoogleFlow ? 'bg-white border border-gray-300 hover:border-emerald-400 text-gray-700 hover:text-emerald-700' : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white'} font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60`}
                    >
                      {isGoogleFlow && <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />}
                      {loading ? 'Processing...' : (
                        isGoogleFlow ? 'Continue to Location' : 'Continue to Location'
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Badge 
                        variant="secondary" 
                        className="capitalize px-4 py-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0"
                      >
                        {selectedRole}
                      </Badge>
                    </motion.div>
                  </div>

                  <div className="text-center mb-8">
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3"
                    >
                      Location Details
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-gray-600 text-lg"
                    >
                      Help us connect you with nearby opportunities
                    </motion.p>
                  </div>

                  {/* Enhanced Location Selection */}
                  <div className="space-y-6">
                    {/* State Selection */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="state" className="text-sm font-semibold text-gray-700">State</Label>
                      <Select 
                        value={formData.state} 
                        onChange={(e) => handleStateChange(e.target.value)}
                      >
                        <SelectValue 
                          placeholder="Select your state" 
                          className="bg-white/50 backdrop-blur-sm border-2 rounded-xl py-3 focus:border-emerald-400 transition-all duration-300"
                        />
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </Select>
                    </motion.div>

                    {/* City Selection */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City</Label>
                      <Select 
                        value={formData.city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        disabled={!formData.state}
                      >
                        <SelectValue 
                          placeholder={formData.state ? "Select your city" : "Please select state first"}
                          className="bg-white/50 backdrop-blur-sm border-2 rounded-xl py-3 focus:border-emerald-400 transition-all duration-300"
                        />
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </Select>
                    </motion.div>

                    {/* Zone Selection */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="zone" className="text-sm font-semibold text-gray-700">Zone</Label>
                      <Select 
                        value={formData.zone}
                        onChange={(e) => handleZoneChange(e.target.value)}
                        disabled={!formData.city}
                      >
                        <SelectValue 
                          placeholder={formData.city ? "Select your zone" : "Please select city first"}
                          className="bg-white/50 backdrop-blur-sm border-2 rounded-xl py-3 focus:border-emerald-400 transition-all duration-300"
                        />
                        {zones.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                      </Select>
                    </motion.div>

                    {/* Enhanced Address Input */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Complete Address</Label>
                      <div className="relative group">
                        <FileText className="absolute left-4 top-4 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                        <Textarea
                          id="address"
                          placeholder="Enter your complete address (street, landmark, etc.)"
                          value={formData.address}
                          onChange={handleAddressChange}
                          rows={3}
                          className="pl-12 pt-3 border-2 rounded-xl focus:border-emerald-400 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                          required
                        />
                      </div>
                    </motion.div>

                    {/* Enhanced Location Preview */}
                    {formData.state && formData.city && formData.zone && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200 shadow-lg backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-3 text-emerald-700 mb-3">
                          <motion.div
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <MapPin className="w-5 h-5" />
                          </motion.div>
                          <span className="font-semibold text-lg">Selected Location</span>
                        </div>
                        <div className="text-emerald-600 font-medium text-base mb-2">
                          {getFullLocationString(formData.state, formData.city, formData.zone)}
                        </div>
                        {formData.address && (
                          <div className="text-gray-600 text-sm">
                            <span className="font-medium">Address:</span> {formData.address}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    {selectedRole === 'citizen' ? (
                      <Button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 ${isGoogleFlow ? 'bg-white border border-gray-300 hover:border-emerald-400 text-gray-700 hover:text-emerald-700' : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white'} font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5`}
                      >
                        {loading ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin"></div>
                            {isGoogleFlow ? 'Finalizing...' : 'Creating Account...'}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {isGoogleFlow && <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />}
                            {isGoogleFlow ? 'Complete with Google' : 'Create Account'}
                          </div>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        type={isGoogleFlow ? 'submit' : 'button'} 
                        onClick={!isGoogleFlow ? handleNext : undefined} 
                        disabled={loading}
                        className={`w-full py-3 ${isGoogleFlow ? 'bg-white border border-gray-300 hover:border-emerald-400 text-gray-700 hover:text-emerald-700' : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white'} font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5`}
                      >
                        {loading ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin"></div>
                            {isGoogleFlow ? 'Continuing...' : 'Processing...'}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {isGoogleFlow && <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />}
                            {isGoogleFlow ? 'Continue to Additional Details' : 'Continue to Additional Details'}
                          </div>
                        )}
                      </Button>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {step === 4 && selectedRole !== 'citizen' && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(3)}
                        className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Badge 
                        variant="secondary" 
                        className="capitalize px-4 py-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0"
                      >
                        {selectedRole}
                      </Badge>
                    </motion.div>
                  </div>

                  <div className="text-center mb-8">
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3"
                    >
                      Additional Information
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-gray-600 text-lg"
                    >
                      Tell us more about your background
                    </motion.p>
                  </div>

                  {selectedRole === 'ragpicker' && (
                    <div className="space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-semibold text-gray-700">Experience Level</Label>
                        <Select 
                          onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                        >
                          <SelectValue 
                            placeholder="Select your experience level"
                            className="bg-white/50 backdrop-blur-sm border-2 rounded-xl py-3 focus:border-emerald-400 transition-all duration-300"
                          />
                          <SelectItem value="beginner">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              Beginner (Less than 1 year)
                            </div>
                          </SelectItem>
                          <SelectItem value="intermediate">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              Intermediate (1-3 years)
                            </div>
                          </SelectItem>
                          <SelectItem value="experienced">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              Experienced (3+ years)
                            </div>
                          </SelectItem>
                        </Select>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-semibold text-gray-700">Preferred Collection Areas</Label>
                        <div className="relative group">
                          <FileText className="absolute left-4 top-4 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                          <Textarea
                            placeholder="Describe the types of waste you specialize in or areas you prefer to work"
                            onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                            rows={4}
                            className="pl-12 pt-3 border-2 rounded-xl focus:border-emerald-400 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                          />
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {selectedRole === 'institution' && (
                    <div className="space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-semibold text-gray-700">Institution Type</Label>
                        <Select 
                          onChange={(e) => setFormData(prev => ({ ...prev, institutionType: e.target.value }))}
                        >
                          <SelectValue 
                            placeholder="Select institution type"
                            className="bg-white/50 backdrop-blur-sm border-2 rounded-xl py-3 focus:border-emerald-400 transition-all duration-300"
                          />
                          <SelectItem value="municipal">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-blue-500" />
                              Municipal Corporation
                            </div>
                          </SelectItem>
                          <SelectItem value="ngo">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-green-500" />
                              NGO
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-purple-500" />
                              Private Company
                            </div>
                          </SelectItem>
                          <SelectItem value="cooperative">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-orange-500" />
                              Cooperative Society
                            </div>
                          </SelectItem>
                        </Select>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-semibold text-gray-700">Institution Name</Label>
                        <div className="relative group">
                          <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                          <Input
                            type="text"
                            placeholder="Enter institution name"
                            onChange={(e) => setFormData(prev => ({ ...prev, institutionName: e.target.value }))}
                            className="pl-12 py-3 border-2 rounded-xl focus:border-emerald-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-semibold text-gray-700">Description</Label>
                        <div className="relative group">
                          <FileText className="absolute left-4 top-4 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                          <Textarea
                            placeholder="Brief description of your institution and its waste management activities"
                            onChange={(e) => setFormData(prev => ({ ...prev, institutionDescription: e.target.value }))}
                            rows={4}
                            className="pl-12 pt-3 border-2 rounded-xl focus:border-emerald-400 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                          />
                        </div>
                      </motion.div>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 ${isGoogleFlow ? 'bg-white border border-gray-300 hover:border-emerald-400 text-gray-700 hover:text-emerald-700' : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white'} font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5`}
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin"></div>
                          {isGoogleFlow ? 'Finalizing...' : 'Creating Account...'}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {isGoogleFlow && <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />}
                          {isGoogleFlow ? 'Complete with Google' : 'Create Account'}
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          
          {/* Enhanced Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 mb-4">
              <span>Already have an account?</span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-emerald-600 font-semibold cursor-pointer hover:text-emerald-700 transition-colors"
                onClick={() => window.location.href = '/login'}
              >
                Sign in here
              </motion.span>
            </div>
            
            <div className="text-xs text-gray-400 leading-relaxed">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
  );
};

export default Register;
