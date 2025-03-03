"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useApp } from '@/lib/contexts/AppContext';

// Icons
const DashboardIcon = () => (
  <svg className="sidebar-link-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ExpensesIcon = () => (
  <svg className="sidebar-link-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const VendorsIcon = () => (
  <svg className="sidebar-link-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const RevenueIcon = () => (
  <svg className="sidebar-link-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="sidebar-link-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="sidebar-link-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const InventoryIcon = () => (
  <svg className="sidebar-link-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

// Default logo component
const DefaultLogo = () => (
  <svg className="w-8 h-8 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function Navigation() {
  const { user, loading, signInWithPin } = useAuth();
  const { settings } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(settings.logoUrl);
  
  // Update local state when settings.logoUrl changes
  useEffect(() => {
    setLogoUrl(settings.logoUrl);
  }, [settings.logoUrl]);
  
  const generalNavigation = [
    { name: 'Dashboard', href: '/', icon: DashboardIcon },
    { name: 'Expenses', href: '/expenses', icon: ExpensesIcon },
    { name: 'Inventory', href: '/inventory', icon: InventoryIcon },
    { name: 'Vendors', href: '/vendors', icon: VendorsIcon },
    { name: 'Revenue', href: '/revenue', icon: RevenueIcon },
    { name: 'Analytics', href: '/analytics', icon: AnalyticsIcon },
  ];
  
  const settingsNavigation = [
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];
  
  const handleSignInClick = () => {
    setShowPinInput(true);
    setPinError(false);
  };
  
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    
    signInWithPin(pin)
      .then(success => {
        if (success) {
          setShowPinInput(false);
          setPin('');
          setPinError(false);
        } else {
          setPinError(true);
        }
      })
      .finally(() => {
        setIsSigningIn(false);
      });
  };
  
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPin(e.target.value);
    setPinError(false);
  };
  
  const handleCancelPin = () => {
    setShowPinInput(false);
    setPin('');
    setPinError(false);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  
  return (
    <>
      {/* Mobile menu toggle */}
      <button 
        className="mobile-menu-toggle fixed top-4 left-4 z-20 p-2 rounded-md bg-white shadow-md"
        onClick={toggleMobileMenu}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          {logoUrl ? (
            <div className="relative w-8 h-8 mr-2">
              <Image
                src={logoUrl}
                alt="Company Logo"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : (
            <DefaultLogo />
          )}
          <span>ExpenseTracker</span>
        </div>
        
        <div className="sidebar-nav">
          {/* General section */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">General</div>
            {generalNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          {/* Settings section */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Settings</div>
            {settingsNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* User profile */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          {loading ? (
            <div className="animate-pulse flex items-center">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="ml-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32 mt-2"></div>
              </div>
            </div>
          ) : user ? (
            <div className="user-profile">
              <div className="user-avatar">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div className="user-info">
                <div className="user-name">{user.displayName || 'User'}</div>
                <div className="user-email">{user.email || 'user@example.com'}</div>
              </div>
            </div>
          ) : showPinInput ? (
            <form onSubmit={handlePinSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="Enter PIN"
                  maxLength={4}
                  className={`form-input ${pinError ? 'border-red-500' : ''}`}
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-red-500 mt-1">Incorrect PIN</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isSigningIn || pin.length !== 4}
                  className="btn btn-primary flex-1"
                >
                  {isSigningIn ? 'Signing in...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelPin}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={handleSignInClick}
              className="btn btn-primary w-full"
            >
              Sign in
            </button>
          )}
        </div>
      </aside>
    </>
  );
} 