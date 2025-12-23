'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { FiHeart, FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Nilai Gizi', href: '/nilai-gizi', protected: true },
  { name: 'Menu Zat Gizi', href: '/zat-gizi', protected: true },
  { name: 'History', href: '/history', protected: true },
  { name: 'Edukasi', href: '/edukasi', protected: true },
];

const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

const Logo = () => {
  const handleLogoClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      scrollToSection('home-hero');
    }
  };

  return (
    <Link 
      href="/" 
      className="flex items-center space-x-3 group"
      onClick={handleLogoClick}
    >
      <div className="w-10 h-10 bg-[#a8e6cf] rounded-xl rotate-45 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <FiHeart className="w-5 h-5 text-white -rotate-45" />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-[#5d4037] leading-6">
          Nutri<span className="text-[#a8e6cf]">Plan</span>
        </span>
        <span className="text-xs text-[#8d6e63] -mt-1">Healthy Living</span>
      </div>
    </Link>
  );
};

const DesktopNavigation = ({ user }) => {
  const router = useRouter();

  const handleNavClick = (e, href, isProtected) => {
    if (isProtected && !user) {
      e.preventDefault();
      router.push('/login');
      return;
    }

    if (href === '/' && window.location.pathname === '/') {
      e.preventDefault();
      scrollToSection('home-hero');
    }
  };

  return (
    <div className="hidden md:flex items-center space-x-8">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.protected && !user ? '/login' : item.href}
          onClick={(e) => handleNavClick(e, item.href, item.protected)}
          className={`text-[#5d4037] font-medium hover:text-[#a8e6cf] transition-colors duration-200 relative py-2 group ${
            item.protected && !user ? 'opacity-80 hover:opacity-100' : ''
          }`}
        >
          <span className="relative">
            {item.name}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#a8e6cf] transition-all duration-300 group-hover:w-full"></span>
          </span>
        </Link>
      ))}
    </div>
  );
};

const LoginButton = () => (
  <Link
    href="/login"
    className="hidden md:inline-block px-6 py-3 bg-[#a8e6cf] text-white font-semibold rounded-lg shadow-[4px_4px_0px_0px_rgba(93,64,55,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200 ease-in-out transform hover:bg-[#88d4b2] focus:outline-none focus:ring-2 focus:ring-[#a8e6cf]"
  >
    Login
  </Link>
);

const MobileMenuButton = ({ open, onClick }) => (
  <button
    onClick={onClick}
    className="md:hidden p-2 rounded-xl hover:bg-[#f8f6f2] transition-colors duration-200"
  >
    {open ? (
      <FiX className="w-6 h-6 text-[#5d4037]" />
    ) : (
      <FiMenu className="w-6 h-6 text-[#5d4037]" />
    )}
  </button>
);

const MobileMenu = ({ open, user, onClose, mobileMenuRef }) => {
  const router = useRouter();

  const handleMobileNavClick = (href, isProtected) => {
    if (isProtected && !user) {
      router.push('/login');
      onClose();
      return;
    }

    if (href === '/' && window.location.pathname === '/') {
      scrollToSection('home-hero');
      onClose();
      return;
    }

    router.push(href);
    onClose();
  };

  if (!open) return null;

  return (
    <div 
      ref={mobileMenuRef}
      className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#f0f0f0] shadow-lg"
      style={{
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div className="px-4 py-6 space-y-3">
        {navigationItems.map((item) => (
          <button
            key={item.href}
            onClick={() => handleMobileNavClick(item.href, item.protected)}
            className={`w-full p-3 text-[#5d4037] font-medium hover:bg-[#f8f6f2] rounded-2xl transition-colors duration-200 text-center ${
              item.protected && !user ? 'opacity-80' : ''
            }`}
          >
            {item.name}
          </button>
        ))}

        {!user && (
          <div className="pt-4 border-t border-[#f8f6f2]">
            <Link
              href="/login"
              className="inline-block w-full px-4 py-3 bg-[#a8e6cf] text-white font-semibold rounded-lg shadow-[4px_4px_0px_0px_rgba(93,64,55,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200 ease-in-out transform hover:bg-[#88d4b2] text-center"
              onClick={onClose}
            >
              Login to Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const UserDropdown = ({ user, dropdownOpen, setDropdownOpen, handleLogout, dropdownRef }) => (
  <div className="relative" ref={dropdownRef}>
    <button
      onClick={() => setDropdownOpen(!dropdownOpen)}
      className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-[#f8f6f2] transition-all duration-200 group"
    >
      <div className="w-10 h-10 bg-gradient-to-br from-[#a8e6cf] to-[#88d4b2] rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
      </div>
      <div className="hidden lg:block text-left">
        <p className="text-sm font-medium text-[#5d4037]">
          {user.displayName || user.email?.split('@')[0]}
        </p>
        <p className="text-xs text-[#8d6e63]">Welcome back!</p>
      </div>
    </button>

    {dropdownOpen && (
      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg py-2 z-50 border border-[#f0f0f0]">
        <div className="px-4 py-3 border-b border-[#f8f6f2]">
          <p className="text-sm font-medium text-[#5d4037] truncate">
            {user.displayName || 'User'}
          </p>
          <p className="text-xs text-[#8d6e63] truncate">{user.email}</p>
        </div>
        
        <Link
          href="/profile"
          className="flex items-center space-x-3 px-4 py-3 text-sm text-[#5d4037] hover:bg-[#f8f6f2] transition-colors duration-200"
          onClick={() => setDropdownOpen(false)}
        >
          <FiUser className="w-4 h-4 text-[#a8e6cf]" />
          <span>Profile Settings</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-[#d32f2f] hover:bg-[#ffebee] transition-colors duration-200"
        >
          <FiLogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    )}
  </div>
);

export default function Navbar() {
  const { user: userFromHook, loading } = useAuth();
  const [user, setUser] = useState(userFromHook);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    setUser(userFromHook);
  }, [userFromHook]);

  useEffect(() => {
    const handleUserUpdate = () => {
      if (auth.currentUser) {
        auth.currentUser.reload().then(() => {
          setUser({ ...auth.currentUser });
        });
      }
    };

    window.addEventListener('userProfileUpdated', handleUserUpdate);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => {
      window.removeEventListener('userProfileUpdated', handleUserUpdate);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout gagal:', error);
    } finally {
      setDropdownOpen(false);
      setMobileMenuOpen(false);
    }
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-sm py-4 border-b border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm py-4 border-b border-[#f0f0f0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          <Logo />

          <DesktopNavigation user={user} />

          <div className="flex items-center space-x-4">
            {user ? (
              <UserDropdown 
                user={user}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                handleLogout={handleLogout}
                dropdownRef={dropdownRef}
              />
            ) : (
              <LoginButton />
            )}

            <MobileMenuButton 
              open={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>

        </div>
      </div>

      <MobileMenu 
        open={mobileMenuOpen} 
        user={user}
        onClose={() => setMobileMenuOpen(false)}
        mobileMenuRef={mobileMenuRef}
      />
    </nav>
  );
}