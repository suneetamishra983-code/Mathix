import React from 'react';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

const AuthScreen: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-[#1E1E1E] rounded-3xl p-8 shadow-xl shadow-blue-500/10 text-center"
      >
        <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-white font-bold text-4xl mx-auto mb-6 shadow-lg shadow-blue-500/30">
          M
        </div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Mathix</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">AI-powered learning for Class 5 students</p>
        
        <div className="space-y-4">
          <button
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/20"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
          <p className="text-xs text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
