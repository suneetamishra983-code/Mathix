import React from 'react';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Target,
  Award,
  ArrowRight,
  BookOpen,
  Brain,
  Globe,
  Calculator,
  Trophy,
  Settings2,
  Sparkles
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Dashboard: React.FC = () => {
  const { profile, progress } = useAuth();

  const stats = [
    { label: 'Questions', value: progress?.totalQuestions || 0, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Correct', value: progress?.correctAnswers || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Accuracy', value: `${Math.round((progress?.accuracy || 0) * 100)}%`, icon: Target, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Level', value: progress?.level || 1, icon: Award, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  const subjects = [
    { id: 'maths', name: 'Maths', icon: Calculator, color: 'bg-blue-500', desc: 'Primary Focus' },
    { id: 'english', name: 'English', icon: BookOpen, color: 'bg-emerald-500', desc: 'Grammar & Vocab' },
    { id: 'evs', name: 'EVS', icon: Globe, color: 'bg-amber-500', desc: 'Science & Social' },
    { id: 'logic', name: 'Logic', icon: Brain, color: 'bg-purple-500', desc: 'Brain Games' },
  ];

  const handleSubjectClick = (subjectId: string) => {
    window.dispatchEvent(new CustomEvent('start-practice', { detail: { subjectId } }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.displayName}! 😊</h2>
          <p className="text-gray-500 dark:text-gray-400">Ready to learn something new today?</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('start-custom-test'))}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
          >
            <Settings2 className="w-5 h-5" />
            Custom Test
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('start-test'))}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Weekly Test
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Subjects */}
      <section>
        <h3 className="text-xl font-bold mb-4">Subjects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSubjectClick(subject.id)}
              className="group bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:border-blue-500 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white", subject.color)}>
                  <subject.icon className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">{subject.name}</p>
                  <p className="text-sm text-gray-500">{subject.desc}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Weak Topics */}
      {progress?.weakTopics && progress.weakTopics.length > 0 && (
        <section className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-amber-500" />
            <h3 className="text-xl font-bold">Focus Areas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {progress.weakTopics.map(topic => (
              <span key={topic} className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium shadow-sm">
                {topic}
              </span>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default Dashboard;
