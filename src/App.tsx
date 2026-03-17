/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { Theme, Language } from './types';
import { 
  Calculator, 
  MessageCircle, 
  LayoutDashboard, 
  Trophy, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X,
  BookOpen,
  Brain,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// UI Components
import Dashboard from './components/Dashboard';
import MathPractice from './components/MathPractice';
import AITutor from './components/AITutor';
import Leaderboard from './components/Leaderboard';
import AuthScreen from './components/AuthScreen';
import WeeklyTest from './components/WeeklyTest';
import CustomTest from './components/CustomTest';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AppContent: React.FC = () => {
  const { user, profile, loading, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState('maths');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTestActive, setIsTestActive] = useState(false);

  useEffect(() => {
    const handleStartTest = () => {
      setIsTestActive(true);
      setActiveTab('test');
    };
    const handleStartPractice = (e: any) => {
      setSelectedSubject(e.detail.subjectId);
      setActiveTab('practice');
    };
    const handleStartCustomTest = () => {
      setActiveTab('custom-test');
    };
    window.addEventListener('start-test', handleStartTest);
    window.addEventListener('start-practice', handleStartPractice);
    window.addEventListener('start-custom-test', handleStartCustomTest);
    return () => {
      window.removeEventListener('start-test', handleStartTest);
      window.removeEventListener('start-practice', handleStartPractice);
      window.removeEventListener('start-custom-test', handleStartCustomTest);
    };
  }, []);

  useEffect(() => {
    if (profile?.theme) {
      document.documentElement.classList.toggle('dark', profile.theme === 'dark');
    }
  }, [profile?.theme]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#121212]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const toggleTheme = () => {
    const newTheme: Theme = profile?.theme === 'light' ? 'dark' : 'light';
    updateProfile({ theme: newTheme });
  };

  const toggleLanguage = () => {
    const newLang: Language = profile?.language === 'en' ? 'hi' : 'en';
    updateProfile({ language: newLang });
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice', name: 'Practice', icon: Calculator },
    { id: 'custom-test', name: 'Custom Test', icon: Settings },
    { id: 'tutor', name: 'AI Tutor', icon: MessageCircle },
    { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors duration-300">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1E1E1E] shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">M</div>
          <h1 className="font-bold text-xl tracking-tight">Mathix</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className={cn(
                "fixed lg:static inset-y-0 left-0 w-72 bg-white dark:bg-[#1E1E1E] border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col",
                !isSidebarOpen && "hidden lg:flex"
              )}
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">M</div>
                  <h1 className="font-bold text-2xl tracking-tight">Mathix</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 font-medium",
                      activeTab === item.id 
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between px-4">
                  <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    {profile?.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={toggleLanguage}
                    className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold"
                  >
                    {profile?.language === 'en' ? 'EN' : 'HI'}
                  </button>
                  <button 
                    onClick={logout}
                    className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 px-4 py-2">
                  <img src={profile?.photoURL} alt="" className="w-10 h-10 rounded-full border-2 border-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-sm">{profile?.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">Class 5 Student</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && <Dashboard key="dashboard" />}
              {activeTab === 'practice' && <MathPractice key="practice" subject={selectedSubject} />}
              {activeTab === 'tutor' && <AITutor key="tutor" />}
              {activeTab === 'leaderboard' && <Leaderboard key="leaderboard" />}
              {activeTab === 'custom-test' && <CustomTest key="custom-test" onComplete={() => setActiveTab('dashboard')} />}
              {activeTab === 'test' && (
                <WeeklyTest 
                  key="test" 
                  onComplete={() => {
                    setIsTestActive(false);
                    setActiveTab('dashboard');
                  }} 
                />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
