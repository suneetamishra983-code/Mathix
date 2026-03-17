import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { LeaderboardEntry } from '../types';
import { motion } from 'motion/react';
import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      })) as LeaderboardEntry[];
      setEntries(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <header className="text-center space-y-2">
        <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/20">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
        <p className="text-gray-500">Top 10 Mathix Champions! 🏆</p>
      </header>

      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No entries yet. Be the first to top the charts! 🚀
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {entries.map((entry, i) => (
              <div key={entry.userId} className="flex items-center gap-4 p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="w-10 flex items-center justify-center font-bold text-lg">
                  {i === 0 ? <Medal className="w-6 h-6 text-amber-500" /> : 
                   i === 1 ? <Medal className="w-6 h-6 text-gray-400" /> : 
                   i === 2 ? <Medal className="w-6 h-6 text-amber-700" /> : 
                   i + 1}
                </div>
                <img src={entry.photoURL} alt="" className="w-12 h-12 rounded-full border-2 border-gray-100 dark:border-gray-800" />
                <div className="flex-1">
                  <p className="font-bold">{entry.displayName}</p>
                  <p className="text-xs text-gray-500">Class 5 Champion</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-500">{entry.score}</p>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Leaderboard;
