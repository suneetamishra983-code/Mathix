import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { generateQuestion } from '../services/aiService';
import { Question } from '../types';
import { SUBJECTS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MathPractice: React.FC<{ subject?: string }> = ({ subject = 'maths' }) => {
  const { profile, progress } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentSubject = SUBJECTS.find(s => s.id === subject) || SUBJECTS[0];

  const loadQuestion = async () => {
    setLoading(true);
    setQuestion(null);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setShowTip(false);

    const topics = currentSubject.topics;
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const difficulty = (progress?.level || 1) > 5 ? 'hard' : (progress?.level || 1) > 2 ? 'medium' : 'easy';
    
    try {
      const q = await generateQuestion(topic, difficulty, currentSubject.name);
      setQuestion(q);
    } catch (error) {
      console.error("Failed to load question:", error);
      alert("Failed to load question. Please check your internet or try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [subject]);

  const handleOptionSelect = async (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    const correct = index === question?.correctIndex;
    setIsCorrect(correct);
    setShowExplanation(true);

    // Update progress
    if (profile) {
      const progressRef = doc(db, 'progress', profile.uid);
      await setDoc(progressRef, {
        totalQuestions: increment(1),
        correctAnswers: correct ? increment(1) : increment(0),
        lastUpdated: new Date().toISOString(),
        accuracy: ((progress?.correctAnswers || 0) + (correct ? 1 : 0)) / ((progress?.totalQuestions || 0) + 1)
      }, { merge: true });
    }
  };

  const lang = profile?.language || 'en';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{currentSubject.name} Practice</h2>
        <button 
          onClick={loadQuestion}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      {loading && (
        <div className="bg-white dark:bg-[#1E1E1E] p-12 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <p className="text-gray-500">Generating a fun question for you... ✨</p>
        </div>
      )}

      {question && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase">
                {question.difficulty}
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full">
                {question.topic}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-2 leading-relaxed">
              {lang === 'en' ? question.textEn : question.textHi}
            </h3>
            {lang === 'hi' && <p className="text-sm text-gray-500 italic mb-4">{question.textEn}</p>}
            {lang === 'en' && <p className="text-sm text-gray-500 italic mb-4">{question.textHi}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
              {(lang === 'en' ? question.optionsEn : question.optionsHi).map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(i)}
                  disabled={selectedOption !== null}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-left font-bold transition-all duration-200 text-lg",
                    selectedOption === null && "border-gray-100 dark:border-gray-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10",
                    selectedOption === i && i === question.correctIndex && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
                    selectedOption === i && i !== question.correctIndex && "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
                    selectedOption !== null && i === question.correctIndex && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {selectedOption === i && i === question.correctIndex && <CheckCircle2 className="w-5 h-5" />}
                    {selectedOption === i && i !== question.correctIndex && <XCircle className="w-5 h-5" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowTip(!showTip)}
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-2xl border-2 border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 transition-colors"
            >
              <Lightbulb className="w-5 h-5" />
              {lang === 'en' ? 'Need a Hint?' : 'संकेत चाहिए?'}
            </button>
            <button
              onClick={loadQuestion}
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              {lang === 'en' ? 'Next Question' : 'अगला प्रश्न'}
            </button>
          </div>

          <AnimatePresence>
            {showTip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-200 dark:border-amber-900/30"
              >
                <p className="font-bold text-amber-800 dark:text-amber-200">
                  💡 {lang === 'en' ? question.tipEn : question.tipHi}
                </p>
              </motion.div>
            )}

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-8 rounded-3xl border-2",
                  isCorrect ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30" : "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  {isCorrect ? (
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                  )}
                  <h4 className="text-xl font-bold">
                    {isCorrect 
                      ? (lang === 'en' ? 'Excellent! 😊' : 'बहुत बढ़िया! 😊') 
                      : (lang === 'en' ? 'Keep trying! 😕' : 'कोशिश करते रहो! 😕')}
                  </h4>
                </div>
                <p className="text-lg leading-relaxed mb-4">
                  {lang === 'en' ? question.explanationEn : question.explanationHi}
                </p>
                <p className="text-sm text-gray-500 italic">
                  {lang === 'en' ? question.explanationHi : question.explanationEn}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default MathPractice;
