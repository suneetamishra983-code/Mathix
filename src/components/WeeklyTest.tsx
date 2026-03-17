import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { generateQuestion } from '../services/aiService';
import { Question, TestResult } from '../types';
import { SUBJECTS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Trophy,
  Target,
  Clock,
  ChevronRight
} from 'lucide-react';
import { doc, setDoc, collection, addDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const WeeklyTest: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { profile, progress } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const loadTest = async () => {
    setLoading(true);
    try {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
        const topics = subject.topics;
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const difficulty = i < 3 ? 'easy' : i < 7 ? 'medium' : 'hard';
        promises.push(generateQuestion(topic, difficulty, subject.name));
      }
      const testQuestions = await Promise.all(promises);
      setQuestions(testQuestions);
      setAnswers(new Array(10).fill(null));
    } catch (error) {
      console.error("Failed to load test:", error);
      alert("Failed to generate test questions. Please check your internet or try again.");
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTest();
  }, []);

  const handleAnswer = (index: number) => {
    if (answers[currentIndex] !== null) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = index;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentIndex < 9) {
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
      const accuracy = finalScore / 10;
      const result: TestResult = {
        userId: profile.uid,
        score: finalScore,
        total: 10,
        accuracy,
        date: new Date().toISOString(),
        feedback: finalScore >= 8 ? "Excellent! 😍" : finalScore >= 5 ? "Good job! 😊" : "Try again! 😕"
      };
      await addDoc(collection(db, 'test_results'), result);

      // Update overall progress
      const progressRef = doc(db, 'progress', profile.uid);
      await setDoc(progressRef, {
        totalQuestions: increment(10),
        correctAnswers: increment(finalScore),
        level: finalScore >= 8 ? increment(1) : increment(0),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    }
  };

  const lang = profile?.language || 'en';

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] p-12 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="text-gray-500">Preparing your Weekly Test... 📝</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#1E1E1E] p-12 rounded-3xl shadow-sm text-center space-y-8"
      >
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto">
          <Trophy className="w-12 h-12 text-amber-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">Test Completed!</h2>
          <p className="text-gray-500">Here's how you did today:</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
            <p className="text-3xl font-bold text-blue-500">{score}/10</p>
            <p className="text-sm text-gray-500">Score</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
            <p className="text-3xl font-bold text-emerald-500">{score * 10}%</p>
            <p className="text-sm text-gray-500">Accuracy</p>
          </div>
        </div>

        <p className="text-2xl font-bold">
          {score >= 8 ? "Excellent! 😍" : score >= 5 ? "Good job! 😊" : "Try again! 😕"}
        </p>

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
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
            {currentIndex + 1}
          </div>
          <div>
            <h2 className="font-bold">Weekly Test</h2>
            <div className="flex gap-1 mt-1">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-6 h-1 rounded-full transition-colors",
                    i === currentIndex ? "bg-blue-500" : i < currentIndex ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-800"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-500 font-bold">
          <Clock className="w-5 h-5" />
          <span>Question {currentIndex + 1}/10</span>
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
                answers[currentIndex] === null && "border-gray-100 dark:border-gray-800 hover:border-blue-500",
                answers[currentIndex] === i && "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
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
            className="w-full mt-8 py-4 bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {currentIndex === 9 ? 'Finish Test' : 'Next Question'}
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default WeeklyTest;
