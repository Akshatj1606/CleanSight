import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getStates, getDistricts, getZones, getFullLocationString } from '@/lib/locationData';
import { MapPin, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddressOnboarding = () => {
  const { user, updateUser, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    state: user?.state || '',
    city: user?.city || '',
    zone: user?.zone || '',
    address: user?.address || ''
  });
  const [saving, setSaving] = useState(false);

  const states = getStates();
  const cities = formData.state ? getDistricts(formData.state) : [];
  const zones = formData.city ? getZones(formData.state, formData.city) : [];

  const disabled = saving;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'state') setFormData(prev => ({ ...prev, city: '', zone: '' }));
    if (field === 'city') setFormData(prev => ({ ...prev, zone: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.state || !formData.city || !formData.zone || !formData.address.trim()) {
      alert('Please complete all location fields.');
      return;
    }
    setSaving(true);
    try {
      await updateUser({ ...formData, fullLocation: getFullLocationString(formData.state, formData.city, formData.zone) });
      const route = getDashboardRoute(user?.role || 'citizen');
      navigate(route, { replace: true });
    } catch (err) {
      console.error(err);
      alert('Could not save address, please retry.');
    } finally {
      setSaving(false);
    }
  };

  // Redirect inside effect to avoid side-effects in render
  useEffect(() => {
    if (user && user.state && user.city && user.zone && user.address) {
      navigate(getDashboardRoute(user.role), { replace: true });
    }
  }, [user, navigate, getDashboardRoute]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
        <Card className="backdrop-blur-sm bg-white/85 border border-emerald-100 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2 justify-center">
              <MapPin className="w-6 h-6" /> Complete Your Location
            </CardTitle>
            <p className="text-gray-600 mt-2 text-sm">We need your location to personalize tasks and community data.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700">State</Label>
                <select value={formData.state} disabled={disabled} onChange={e => handleChange('state', e.target.value)} className="mt-1 w-full rounded-lg border-2 px-4 py-2.5 text-sm bg-white/70 focus:border-emerald-500 outline-none transition">
                  <option value="">Select state</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">City</Label>
                <select value={formData.city} disabled={!formData.state || disabled} onChange={e => handleChange('city', e.target.value)} className="mt-1 w-full rounded-lg border-2 px-4 py-2.5 text-sm bg-white/70 focus:border-emerald-500 outline-none transition">
                  <option value="">{formData.state ? 'Select city' : 'Select state first'}</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Zone</Label>
                <select value={formData.zone} disabled={!formData.city || disabled} onChange={e => handleChange('zone', e.target.value)} className="mt-1 w-full rounded-lg border-2 px-4 py-2.5 text-sm bg-white/70 focus:border-emerald-500 outline-none transition">
                  <option value="">{formData.city ? 'Select zone' : 'Select city first'}</option>
                  {zones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Address</Label>
                <Textarea rows={3} disabled={disabled} value={formData.address} onChange={e => handleChange('address', e.target.value)} placeholder="Street, landmark, etc." className="mt-1 resize-none" />
              </div>
              {formData.state && formData.city && formData.zone && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 text-sm text-emerald-700">
                  <div className="font-semibold mb-1 flex items-center gap-2"><Check className="w-4 h-4" /> Location Preview</div>
                  {getFullLocationString(formData.state, formData.city, formData.zone)}{formData.address && `, ${formData.address}`}
                </div>
              )}
              <Button type="submit" disabled={disabled} className="w-full h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow">
                {saving ? 'Saving...' : (<span className="inline-flex items-center gap-2">Finish & Continue <ArrowRight className="w-4 h-4" /></span>)}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AddressOnboarding;
