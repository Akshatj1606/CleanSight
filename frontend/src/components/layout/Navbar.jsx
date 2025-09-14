import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/Logo.png';

// Simple shared event emitter for mobile menu state
const mobileMenuState = { open: false, listeners: new Set(), set(v){ this.open=v; this.listeners.forEach(l=>l(v)); } };

const MobileMenuButton = () => {
  const [open,setOpen]=useState(mobileMenuState.open);
  useEffect(()=>{ const l=v=>setOpen(v); mobileMenuState.listeners.add(l); return ()=> mobileMenuState.listeners.delete(l); },[]);
  return (
    <button
      aria-label={open? 'Close menu':'Open menu'}
      onClick={()=> mobileMenuState.set(!open)}
      className={`md:hidden relative inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-300/70 bg-white/80 backdrop-blur shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 ${open? 'text-green-700':'text-gray-700 hover:text-gray-900'}`}
    >
      <span className="sr-only">Menu</span>
      <motion.span initial={false} animate={open? {rotate:45,y:0}:{rotate:0}} className="absolute w-5 h-0.5 bg-current rounded" />
      <motion.span initial={false} animate={open? {opacity:0}:{opacity:1}} className="absolute w-5 h-0.5 bg-current rounded translate-y-2" />
      <motion.span initial={false} animate={open? {rotate:-45,y:0}:{rotate:0}} className="absolute w-5 h-0.5 bg-current rounded -translate-y-2" />
    </button>
  );
};

const MobileMenuPanel = ({ links }) => {
  const [open,setOpen]=useState(mobileMenuState.open);
  useEffect(()=>{ const l=v=>setOpen(v); mobileMenuState.listeners.add(l); return ()=> mobileMenuState.listeners.delete(l); },[]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="panel"
          initial={{opacity:0,y:-12}}
          animate={{opacity:1,y:0}}
          exit={{opacity:0,y:-8}}
          transition={{duration:0.25}}
          className="md:hidden px-4 pb-6"
        >
          <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur shadow-lg p-4 space-y-1">
            {links.map(l=> (
              <a key={l.id} href={l.href || `#${l.id}`} onClick={()=> mobileMenuState.set(false)} className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50">
                {l.label}
              </a>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-200">
              <Link to="/login" onClick={()=> mobileMenuState.set(false)} className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Sign In</Link>
              <Link to="/register" onClick={()=> mobileMenuState.set(false)} className="block mt-2">
                <Button className="w-full rounded-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white text-sm font-medium py-2.5">Get Started</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const defaultLinks = [
  {id:'home', label:'Home'},
  {id:'impact', label:'Impact'},
  {id:'features', label:'Features'},
  {id:'products', label:'Products'},
  {id:'help', label:'Help'}
];

const Navbar = ({ activeSection }) => {
  const location = useLocation();
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{ const onScroll=()=> setScrolled(window.scrollY>40); window.addEventListener('scroll',onScroll); return ()=> window.removeEventListener('scroll',onScroll); },[]);

  // If no activeSection provided, infer from route
  const current = activeSection || (location.pathname === '/login' ? 'login' : 'home');

  const links = defaultLinks.map(l=> ({...l, href: location.pathname === '/' ? `#${l.id}` : `/#${l.id}`}));

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-200' : 'bg-white/90 backdrop-blur-lg'} before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.06),transparent_65%)]`}
    >
      <a href="#home" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-green-600 text-white px-3 py-2 rounded-md text-sm">Skip to content</a>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6 ${scrolled ? 'h-16' : 'h-20'} transition-[height]`}>
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="flex items-center gap-3 group" aria-label="CleanSight home">
            <img src={logoImage} alt="CleanSight" className="h-10 w-auto transition-transform group-hover:scale-[1.04]" />
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-1 text-[13px] font-medium relative rounded-full bg-white/95 backdrop-blur px-2 py-1 border border-gray-200 shadow-sm" role="menubar">
          {links.map(link=> {
            const active = current===link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                role="menuitem"
                className={`relative rounded-full px-4 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 ${active ? 'text-green-800 font-semibold' : 'text-gray-700 hover:text-gray-900'}`}
              >
                <span className="relative z-10">{link.label}</span>
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-green-100 border border-green-200 shadow-sm"
                    transition={{ type:'spring', stiffness:380, damping:30 }}
                  />
                )}
              </a>
            );
          })}
          <Link
            to="/login"
            role="menuitem"
            className={`relative rounded-full px-4 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 ${current==='login' ? 'text-green-800 font-semibold' : 'text-gray-700 hover:text-gray-900'}`}
          >
            <span className="relative z-10">Sign In</span>
            {current==='login' && (
              <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-green-100 border border-green-200 shadow-sm" />
            )}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/register" className="hidden sm:block">
            <Button className="rounded-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-6 shadow-lg h-11 text-sm font-medium">Get Started</Button>
          </Link>
          <MobileMenuButton />
        </div>
      </div>
      <MobileMenuPanel links={links} />
    </nav>
  );
};

export default Navbar;
