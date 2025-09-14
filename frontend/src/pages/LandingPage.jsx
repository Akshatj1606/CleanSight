import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { variants, useMotionPref } from '@/lib/motion';
import Navbar from '@/components/layout/Navbar';
import BlurText from '@/components/ui/BlurText';
import CountUp from '@/components/ui/CountUp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import logoImage2 from '@/assets/logo2.png';
// Partnership logos
import partner1 from '@/assets/landing carousel/I-1.avif';
import partner2 from '@/assets/landing carousel/i-2.png';
import partner3 from '@/assets/landing carousel/i-3.webp';
import partner4 from '@/assets/landing carousel/i-4.png';
import partner5 from '@/assets/landing carousel/i-5.jpg';
import partner6 from '@/assets/landing carousel/i-6.png';
import partner7 from '@/assets/landing carousel/i-7.webp';
import partner8 from '@/assets/landing carousel/i-8.png';
import partner9 from '@/assets/landing carousel/i-9.png';
import partner10 from '@/assets/landing carousel/i-10.png';
import partner11 from '@/assets/landing carousel/i-11.svg';
import AIDetectionWidget from '@/components/ui/AIDetectionWidget';
import {
  Camera, MapPin, Trophy, Users, Recycle, Star, ArrowRight,
  Globe, Award, TrendingUp, Shield, Zap, Play,
  BarChart3, Leaf, Clock, Verified,
  Droplets, AlertTriangle, Twitter, Instagram, Linkedin, MessageSquare
} from 'lucide-react';


const LandingPageNew = () => {
  const [showSecond, setShowSecond] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const sections = useRef(['home','impact','features','products','roadmap','how-it-works','partnerships','testimonials','help']);

  useEffect(()=>{
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.35 }
    );
    sections.current.forEach(id=>{
      const el = document.getElementById(id);
      if(el) observer.observe(el);
    });
    return ()=> observer.disconnect();
  },[]);
  // Navbar scroll handled inside Navbar component now

  const stats = [
    { 
      number: "150K+", 
      label: "Waste Reports", 
      icon: Camera,
      description: "Community submissions",
      trend: "+23% monthly"
    },
    { 
      number: "89K+", 
      label: "Tons Diverted", 
      icon: Recycle,
      description: "From landfills",
      trend: "+31% quarterly"
    },
    { 
      number: "45K+", 
      label: "Active Citizens", 
      icon: Users,
      description: "Making impact",
      trend: "+12% weekly"
    },
    { 
      number: "5+", 
      label: "Cities Connected", 
      icon: Globe,
      description: "Growing network",
      trend: "Expanding fast"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Priya Sharma",
      role: "Environmental Scientist",
      content: "CleanSight's AI accuracy and community engagement metrics are unprecedented in waste management technology.",
      rating: 5,
      avatar: "👩‍🔬",
      company: "IIT Delhi",
      verified: true
    },
    {
      name: "Rajesh Kumar",
      role: "City Planning Director",
      content: "40% improvement in waste reporting accuracy since implementing CleanSight across our municipality.",
      rating: 5,
      avatar: "👨‍💼",
      company: "Smart Cities Mission",
      verified: true
    },
    {
      name: "Maya Patel",
      role: "Community Leader",
      content: "Gamification doubled our cleanup participation. Our volunteers are more engaged than ever before.",
      rating: 5,
      avatar: "👩‍🌾",
      company: "EcoWarriors NGO",
      verified: true
    }
  ];

  const { prefersReduced, maybe } = useMotionPref();

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Navbar activeSection={activeSection} />
      {/* Hero Section */}
  <section id="home" className="relative min-h-screen flex items-center justify-center bg-white border-b border-gray-100">
    <div className="hero-soft-bg"></div>
    <div className="noise-layer"></div>
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center">
          <motion.div
            variants={maybe(variants.fadeInUp())}
            initial="hidden"
            animate="show"
          >
            {/* Headline with BlurText animation */}
            <div className="mb-8">
              <div className="mb-6">
                <a href="#demo" className="relative inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-green-600 text-white overflow-hidden shine-btn text-center">
                  <span className="relative z-10">AI Power Garbage Detection Platform</span>
                </a>
              </div>
              <div className="space-y-3">
                <BlurText
                  as="h1"
                  text="AI-Powered Garbage Detection"
                  animateBy="words"
                  delay={110}
                  direction="top"
                  className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight"
                  onAnimationComplete={() => setShowSecond(true)}
                />
                {showSecond && (
                  <div className="flex justify-center">
                    <BlurText
                      as="h2"
                      text="Cleaner, Smarter Cities."
                      animateBy="words"
                      delay={140}
                      direction="top"
                      className="text-3xl md:text-5xl font-bold text-green-600 leading-tight tracking-tight text-center"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              Real-time AI to locate waste hotspots, prioritize cleanup, and reward community action with measurable impact.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14"
            >
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 text-base font-medium rounded-full shadow-sm transition-colors"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-5 text-base font-medium border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-full bg-white transition-colors"
                onClick={() => { const el=document.getElementById('demo'); if(el) el.scrollIntoView({behavior:'smooth'}); }}
              >
                {/* <Play className="h-5 w-5 mr-3" /> */}
                Try Now
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4 max-w-4xl mx-auto flex-wrap"
            >
              {[{icon:Award,label:'99.2% AI Accuracy'},{icon:Globe,label:'5+ Cities'},{icon:Clock,label:'24/7 AI Assistant Support'}].map((t,i)=>{ const Icon=t.icon; return (
                <motion.div 
                  key={i}
                  className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm transition"
                  variants={variants.hoverCard}
                  initial="initial"
                  whileHover="hover"
                >
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-600 text-white text-sm"><Icon className="h-5 w-5" /></span>
                  <span className="text-xs font-medium text-gray-700 tracking-wide whitespace-nowrap">{t.label}</span>
                </motion.div>
              );})}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live AI Detection Demo */}
      <section className="py-24 bg-white" id="demo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Try the Platform</h2>
              <p className="text-gray-600 text-sm md:text-base mb-6 max-w-md">Upload an image to see how our AI flags waste hotspots. This lightweight demo uses the same /predict endpoint as the core platform.</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Accepts common image formats</li>
                <li>• Returns detection confidence</li>
                <li>• Shows annotated bounding boxes</li>
              </ul>
              <Link to="/register" className="inline-block">
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 text-sm font-medium">Create an Account</Button>
              </Link>
            </div>
            <div className="flex justify-center md:justify-end">
              <AIDetectionWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Snapshot Section */}
  <section id="impact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why CleanSight Matters
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Turning data into cleaner streets, greener air, and empowered communities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Tons of Waste Detected', value: 89000, suffix: '+', sub: 'Captured & Classified', icon: Recycle },
              { label: 'Communities Engaged', value: 45000, suffix: '+', sub: 'Active participants', icon: Users },
              { label: 'CO₂ Emissions Reduced', value: 12000, suffix: '+', sub: 'Tons avoided*', icon: Leaf },
              { label: 'Jobs Created', value: 3200, suffix: '+', sub: 'Ragpicker livelihoods', icon: Award },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  variants={{...maybe(variants.fadeInUp(i)), ...variants.hoverCard}}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.4 }}
                  whileHover="hover"
                  className="card-surface"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="icon-badge">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 leading-none">
                        <CountUp end={item.value} duration={1.4} />{item.suffix}
                      </div>
                      <div className="text-[11px] text-gray-500 tracking-wide mt-1">{item.sub}</div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 leading-snug">{item.label}</h3>
                </motion.div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-6 text-center">*Estimated equivalent based on diversion and lifecycle emission factors.</p>
        </div>
      </section>

      {/* Legacy Stats Section (Real Impact) */}
  <section id="stats" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Real Impact, Real Numbers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our community is transforming waste management worldwide
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={{...maybe(variants.fadeInUp(index)), ...variants.hoverCard}}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  whileHover="hover"
                  className="card-surface"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="icon-badge">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-medium tracking-wide">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1 leading-none">
                    <CountUp end={parseInt(stat.number)} duration={1.2} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-snug">
                    {stat.label}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {stat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

  {/* Core Features Section */}
  <section id="features" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Core Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">The intelligence, engagement, and speed layers that make CleanSight a next-gen urban sanitation platform.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Camera, title: 'AI Garbage Detection', desc: 'Automatic waste identification in images & video streams with category tagging.', badge: 'Real-Time' },
              { icon: BarChart3, title: 'Smart Reporting', desc: 'Instant structured reports for authorities with geo-tag & severity scoring.', badge: 'Actionable' },
              { icon: Trophy, title: 'Reward Points (B2C)', desc: 'Earn eco-points redeemable for benefits & recognition.', badge: 'Engagement' },
              { icon: Award, title: 'CSR Impact Tracking (B2B)', desc: 'Generate auditable CSR metrics & sustainability disclosures.', badge: 'B2B' },
              { icon: Globe, title: 'Carbon Credits (B2B)', desc: 'Quantified diversion data mapped to potential carbon value.', badge: 'B2B' },
              { icon: Zap, title: 'Instant Alerts', desc: 'WhatsApp / Telegram style push notifications to cleanup teams.', badge: 'Fast' }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  variants={{...maybe(variants.fadeInUp(i)), ...variants.hoverCard}}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.35 }}
                  whileHover="hover"
                  className="card-surface"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="icon-badge">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px] tracking-wide">{f.badge}</Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{f.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

  {/* Circular Products Section */}
  <section id="products" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Circular Products</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Real-world material flows transformed into scalable environmental & economic value streams.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Recycle, title: 'Plastic Recycling', impact: 'Circular Materials', desc: 'Collected plastics are sorted & routed to recyclers, diverting waste from landfills and lowering virgin material demand.' },
              { icon: Leaf, title: 'Compost & Manure', impact: 'Soil Health', desc: 'Organic waste converted to nutrient-rich compost boosting soil fertility & reducing methane from decomposition.' },
              { icon: Droplets, title: 'Bio-Fertilizer', impact: 'Regenerative Input', desc: 'Biologically derived fertilizer supporting sustainable agriculture with lower synthetic chemical dependence.' }
            ].map((p,i)=> { const Icon = p.icon; return (
              <motion.div key={i}
                variants={{...maybe(variants.fadeInUp(i)), ...variants.hoverCard}}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.35 }}
                whileHover="hover"
                className="card-surface"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="icon-badge"><Icon className="h-6 w-6" /></div>
                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px] tracking-wide">{p.impact}</Badge>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{p.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
              </motion.div>
            );})}
          </div>
          <div className="text-center mt-10 text-xs text-gray-400">Lifecycle tracing & impact accounting coming soon.</div>
        </div>
      </section>

  {/* Future-Ready Add-Ons / Roadmap */}
  <section className="py-24 bg-white border-t border-gray-100" id="roadmap">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Future-Ready Add-Ons</h2>
              <p className="text-lg text-gray-600 max-w-2xl">Innovation pipeline enabling proactive infrastructure maintenance and data-driven sanitation intelligence.</p>
            </div>
            <Badge className="bg-green-600 text-white px-4 py-2 rounded-md">Roadmap 2025</Badge>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MapPin, title: 'Pothole Detection', desc: 'Computer vision spotting road hazards early.', stage: 'Beta' },
              { icon: Droplets, title: 'Sewer Overflow Alerts', desc: 'Detect surges & blockages before flooding.', stage: 'Research' },
              { icon: Shield, title: 'IoT Smart Bin Integration', desc: 'Bin fill-level telemetry + predictive routing.', stage: 'Design' },
              { icon: TrendingUp, title: 'Predictive Waste Analytics', desc: 'Forecast hotspots & optimize resource allocation.', stage: 'Alpha' },
              { icon: AlertTriangle, title: 'Illegal Dumping Detection', desc: 'Real-time anomaly detection for dumping.', stage: 'Planned' },
            ].map((r, i) => {
              const Icon = r.icon || Camera;
              return (
                <motion.div
                  key={i}
                  variants={{...maybe(variants.fadeInUp(i)), ...variants.hoverCard}}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.4 }}
                  whileHover="hover"
                  className="card-surface"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="icon-badge">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px] tracking-wide">{r.stage}</Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{r.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">{r.desc}</p>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">Scalable module</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
  <section id="how-it-works" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.8}} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">From detection to rewarding verified environmental action.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: 'Detect', icon: Camera, desc: 'Cameras, drones & citizen uploads feed AI that classifies and geo-tags waste hotspots.' },
              { step: 'Report', icon: BarChart3, desc: 'Dashboards auto-generate structured cleanup tasks with severity & material metadata.' },
              { step: 'Act & Reward', icon: Trophy, desc: 'Teams complete cleanups, evidence is verified, eco-points + leaderboards update instantly.' }
            ].map((s,i)=>{ const Icon = s.icon; return (
              <motion.div key={i}
                variants={{...maybe(variants.fadeInUp(i)), ...variants.hoverCard}}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.35 }}
                whileHover="hover"
                className="card-surface">
                <div className="flex items-start justify-between mb-5">
                  <div className="icon-badge"><Icon className="h-6 w-6" /></div>
                  <div className="text-xs font-medium tracking-wide text-gray-500">Step {i+1}</div>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-snug">{s.step}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
              </motion.div>
            );})}
          </div>
        </div>
      </section>

      {/* Community & Partnerships */}
  <section id="partnerships" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.8}} viewport={{ once: true }} className="grid md:grid-cols-3 gap-6 mb-14">
            <div className="md:col-span-2 card-surface">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Community & Partnerships</h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">We collaborate with municipalities, NGOs, residential societies and circular economy stakeholders to accelerate climate-positive sanitation outcomes.</p>
            </div>
            <div className="card-surface">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Why Partner?</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Unlock impact-based revenue streams, workforce empowerment & ESG-grade reporting with verifiable waste intelligence.</p>
            </div>
          </motion.div>
          <div className="partner-marquee mt-2">
            <div className="partner-track">
              {[
                partner1, partner2, partner3, partner4, partner5, partner6, partner7, partner8, partner9, partner10, partner11
              ].concat([
                partner1, partner2, partner3, partner4, partner5, partner6, partner7, partner8, partner9, partner10, partner11
              ]).map((src, i) => (
                <div key={i} className="partner-item flex items-center justify-center">
                  <img 
                    src={src} 
                    alt="Partner logo" 
                    loading="lazy" 
                    decoding="async" 
                    className="max-h-10 w-auto object-contain opacity-80 hover:opacity-100 transition duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6 text-center">Logos shown are samples / placeholders for prospective or ecosystem partners.</p>
        </div>
      </section>

      {/* User Stories / Testimonials */}
  <section className="py-24 bg-white border-t border-gray-100" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">User Stories & Testimonials</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">From city officials to citizen volunteers – real voices behind measurable change.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                variants={{...maybe(variants.fadeInUp(index)), ...variants.hoverCard}}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.35 }}
                whileHover="hover"
                className="card-surface"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl leading-none">{t.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">{t.name}</h4>
                      {t.verified && <Verified className="h-3.5 w-3.5 text-blue-500" />}
                    </div>
                    <p className="text-xs text-gray-600 leading-tight">{t.role}</p>
                    <p className="text-[10px] text-gray-500">{t.company}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed mb-3 italic">"{t.content}"</p>
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner (Refactored Minimal) */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-surface text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">Be Part of the Clean Revolution</h2>
            <p className="text-sm md:text-base text-gray-600 mb-8 leading-relaxed">Join a growing network turning real-time waste intelligence into measurable climate and social impact. Fast onboarding. Immediate visibility. Verifiable results.</p>
            <Link to="/register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-4 rounded-full text-sm md:text-base">Get Started</Button>
            </Link>
            <div className="mt-6 text-[10px] uppercase tracking-wide text-gray-400">Impact-first • Data-driven • Scalable</div>
          </div>
        </div>
      </section>

      {/* Help & Support / FAQs */}
  <section id="help" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.7}} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Help & Support</h2>
            <p className="text-lg text-gray-600">Quick answers to common questions.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: 'How do I report garbage?', a: 'Upload a photo – AI auto-detects type & location.' },
              { q: 'How are rewards distributed?', a: 'Eco-points per validated report; redeem in rewards.' },
              { q: 'Can officials access analytics?', a: 'Yes, partners receive real-time dashboards.' },
              { q: 'Is my data secure?', a: 'Submissions anonymized; encrypted storage.' },
              { q: 'Do you support WhatsApp alerts?', a: 'Opt-in for instant cleanup task notifications.' },
              { q: 'How can I become a partner?', a: 'Email partnerships@cleansight.ai or use the form.' }
            ].map((f,i)=>(
              <motion.div key={i} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} transition={{duration:0.45, delay:i*0.05}} viewport={{ once: true }} whileHover={{y:-3}} className="card-surface">
                <div className="flex items-start gap-4">
                  <div className="icon-badge shrink-0"><MessageSquare className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{f.q}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10 text-sm text-gray-500">Need more? Visit the <Link to="/help" className="text-green-600 hover:underline">Help Center</Link>.</div>
        </div>
      </section>

      {/* Footer */}
  <footer className="bg-black text-white py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src={logoImage2} alt="CleanSight" className="w-40 object-contain" />
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">AI-driven urban sanitation intelligence platform enabling cleaner streets, reduced emissions and inclusive green jobs.</p>
              <div className="flex items-center gap-4 text-gray-400">
                <a href="#" aria-label="Twitter" className="hover:text-green-500 transition"><Twitter className="h-5 w-5" /></a>
                <a href="#" aria-label="LinkedIn" className="hover:text-green-500 transition"><Linkedin className="h-5 w-5" /></a>
                <a href="#" aria-label="Instagram" className="hover:text-green-500 transition"><Instagram className="h-5 w-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm tracking-wide text-gray-200">Product</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#impact" className="hover:text-white transition">Impact</a></li>
                <li><a href="#roadmap" className="hover:text-white transition">Roadmap</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm tracking-wide text-gray-200">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#partnerships" className="hover:text-white transition">Partnerships</a></li>
                <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
                <li><a href="#testimonials" className="hover:text-white transition">Testimonials</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm tracking-wide text-gray-200">Legal</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Use</a></li>
                <li><a href="#" className="hover:text-white transition">Data Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm tracking-wide text-gray-200">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-4">Monthly insights & roadmap drops. No spam.</p>
              <form onSubmit={(e)=>{e.preventDefault();}} className="space-y-3">
                <div className="flex items-center bg-white/10 rounded-full p-1">
                  <input type="email" required placeholder="Email address" className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none" />
                  <Button type="submit" size="sm" className="rounded-full bg-green-600 hover:bg-green-700 text-white px-5">Join</Button>
                </div>
              </form>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-sm text-gray-500">
            <p>&copy; 2025 CleanSight. Transforming cities, one report at a time.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageNew;
