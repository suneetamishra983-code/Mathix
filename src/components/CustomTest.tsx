import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { SUBJECTS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings2, 
  ArrowRight, 
  Play, 
  X,
  CheckCircle2,
  Brain,
  BookOpen,
  Globe,
  Calculator
} from 'lucide-react';
import WeeklyTest from './WeeklyTest';
import { generateQuestion } from '../services/aiService';
import { Question, TestResult } from '../types';
import { doc, setDoc, collection, addDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CustomTest: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { profile } = useAuth();
  const [step, setStep] = useState<'config' | 'test'>('config');
  const [config, setConfig] = useState({
    subjectId: 'maths',
    topic: 'All Topics',
    count: 5,
    difficulty: 'medium'
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const startTest = async () => {
    setLoading(true);
    try {
      const subject = SUBJECTS.find(s => s.id === config.subjectId)!;
      const topics = config.topic === 'All Topics' ? subject.topics : [config.topic];
      
      const promises = [];
      for (let i = 0; i < config.count; i++) {
        const topic = topics[Math.floor(Math.random() * topics.length)];
        promises.push(generateQuestion(topic, config.difficulty, subject.name));
      }
      
      const generatedQuestions = await Promise.all(promises);
      setQuestions(generatedQuestions);
      setStep('test');
    } catch (error) {
      console.error("Failed to generate custom test:", error);
      alert("Failed to generate test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 'test') {
    // We can reuse WeeklyTest logic or implement a simplified version here
    // For simplicity, let's just use a modified version of WeeklyTest that accepts questions
    return <CustomTestRunner questions={questions} onComplete={onComplete} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Custom Test</h2>
            <p className="text-sm text-gray-500">Design your own practice session</p>
          </div>
        </div>
        <button onClick={onComplete} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-bold mb-3">Select Subject</label>
          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map((s) => {
              const Icon = s.id === 'maths' ? Calculator : s.id === 'english' ? BookOpen : s.id === 'evs' ? Globe : Brain;
              return (
                <button
                  key={s.id}
                  onClick={() => setConfig({ ...config, subjectId: s.id, topic: 'All Topics' })}
                  className={cn(
                    "p-4 rounded-2xl border-2 flex items-center gap-3 transition-all",
                    config.subjectId === s.id 
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400" 
                      : "border-gray-100 dark:border-gray-800 hover:border-purple-200"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-bold">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Selection */}
        <div>
          <label className="block text-sm font-bold mb-3">Select Topic</label>
          <select 
            value={config.topic}
            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
            className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option>All Topics</option>
            {SUBJECTS.find(s => s.id === config.subjectId)?.topics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Question Count */}
          <div>
            <label className="block text-sm font-bold mb-3">Number of Questions</label>
            <div className="flex gap-2">
              {[3, 5, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setConfig({ ...config, count: n })}
                  className={cn(
                    "flex-1 py-3 rounded-xl border-2 font-bold transition-all",
                    config.count === n 
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400" 
                      : "border-gray-100 dark:border-gray-800"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-bold mb-3">Difficulty</label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map(d => (
                <button
                  key={d}
                  onClick={() => setConfig({ ...config, difficulty: d })}
                  className={cn(
                    "flex-1 py-3 rounded-xl border-2 font-bold transition-all capitalize",
                    config.difficulty === d 
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400" 
                      : "border-gray-100 dark:border-gray-800"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={startTest}
          disabled={loading}
          className="w-full py-4 bg-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 hover:bg-purple-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <>
              <Play className="w-5 h-5" />
              Generate Test
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

const CustomTestRunner: React.FC<{ questions: Question[], onComplete: () => void }> = ({ questions, onComplete }) => {
  const { profile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (index: number) => {
    if (answers[currentIndex] !== null) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = index;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    let finalScore = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) finalScore++;
    });
    setScore(finalScore);
    setIsFinished(true);

    if (profile) {
      const accuracy = finalScore / questions.length;
      const result: TestResult = {
        userId: profile.uid,
        score: finalScore,
        total: questions.length,
        accuracy,
        date: new Date().toISOString(),
        feedback: accuracy >= 0.8 ? "Excellent! 😍" : accuracy >= 0.5 ? "Good job! 😊" : "Keep practicing! 😕"
      };
      await addDoc(collection(db, 'test_results'), result);

      // Update overall progress
      const progressRef = doc(db, 'progress', profile.uid);
      await setDoc(progressRef, {
        totalQuestions: increment(questions.length),
        correctAnswers: increment(finalScore),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    }
  };

  const lang = profile?.language || 'en';

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#1E1E1E] p-12 rounded-3xl shadow-sm text-center space-y-8 max-w-2xl mx-auto"
      >
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-amber-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">Custom Test Finished!</h2>
          <p className="text-gray-500">Great effort! Here's your result:</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
            <p className="text-3xl font-bold text-blue-500">{score}/{questions.length}</p>
            <p className="text-sm text-gray-500">Score</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
            <p className="text-3xl font-bold text-emerald-500">{Math.round((score / questions.length) * 100)}%</p>
            <p className="text-sm text-gray-500">Accuracy</p>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </motion.div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
            {currentIndex + 1}
          </div>
          <div>
            <h2 className="font-bold">Custom Test</h2>
            <div className="flex gap-1 mt-1">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-4 h-1 rounded-full transition-colors",
                    i === currentIndex ? "bg-purple-500" : i < currentIndex ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-800"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-gray-500 font-bold">
          {currentIndex + 1}/{questions.length}
        </div>
      </header>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-[#1E1E1E] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
      >
        <h3 className="text-xl font-bold mb-6 leading-relaxed">
          {lang === 'en' ? currentQ.textEn : currentQ.textHi}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(lang === 'en' ? currentQ.optionsEn : currentQ.optionsHi).map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={cn(
                "p-4 rounded-2xl border-2 text-left font-bold transition-all duration-200",
                answers[currentIndex] === null && "border-gray-100 dark:border-gray-800 hover:border-purple-500",
                answers[currentIndex] === i && "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
                answers[currentIndex] !== null && answers[currentIndex] !== i && "opacity-50"
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {answers[currentIndex] !== null && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={nextQuestion}
            className="w-full mt-8 py-4 bg-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            {currentIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default CustomTest;
