import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getTutorResponse } from '../services/aiService';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, Trash2, Paperclip, X, FileText, Image as ImageIcon, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

const AITutor: React.FC = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [attachment, setAttachment] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'chat_history', profile.uid, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(history);
      setHistoryLoading(false);
    }, (error) => {
      console.error("Chat history error:", error);
      setHistoryLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setAttachment({
        data: base64,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
      attachment: attachment || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentAttachment = attachment;
    setInput('');
    setAttachment(null);
    setLoading(true);

    try {
      const history = messages.map(m => {
        const parts: any[] = [{ text: m.text }];
        if (m.attachment) {
          parts.push({
            inlineData: {
              data: m.attachment.data,
              mimeType: m.attachment.mimeType
            }
          });
        }
        return {
          role: m.role,
          parts
        };
      });

      // Save user message to Firestore
      if (profile) {
        await addDoc(collection(db, 'chat_history', profile.uid, 'messages'), {
          ...userMsg,
          userId: profile.uid
        });
      }

      const response = await getTutorResponse(history, currentInput, currentAttachment || undefined);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: Date.now()
      };

      // Save bot message to Firestore
      if (profile) {
        await addDoc(collection(db, 'chat_history', profile.uid, 'messages'), {
          ...botMsg,
          userId: profile.uid
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!profile) return;
    if (!window.confirm("Are you sure you want to clear your chat history?")) return;

    try {
      const q = query(collection(db, 'chat_history', profile.uid, 'messages'));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const lang = profile?.language || 'en';

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <header className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-blue-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Mathix AI Tutor</h2>
            <p className="text-xs text-blue-100">Always here to help! ✨</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {historyLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
            />
            <p className="text-sm text-gray-500">Loading your chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Bot className="w-10 h-10" />
            </div>
            <div>
              <p className="font-bold text-xl">Hello! I'm Mathix.</p>
              <p className="text-sm">Ask me any Maths question or ask for a test! 😊</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-700'
                }`}>
                  {msg.attachment && (
                    <div className="mb-3 p-2 bg-black/5 dark:bg-white/5 rounded-xl flex items-center gap-2 border border-black/10 dark:border-white/10">
                      {msg.attachment.mimeType.startsWith('image/') ? (
                        <img 
                          src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} 
                          alt="attachment" 
                          className="w-12 h-12 object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <FileText className="w-8 h-8 opacity-50" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{msg.attachment.name}</p>
                        <p className="text-[10px] opacity-70 uppercase">{msg.attachment.mimeType.split('/')[1]}</p>
                      </div>
                    </div>
                  )}
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none flex gap-1">
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1A1A1A] space-y-4">
        <AnimatePresence>
          {attachment && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-500">
                {attachment.mimeType.startsWith('image/') ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{attachment.name}</p>
                <p className="text-xs text-gray-500 uppercase">{attachment.mimeType.split('/')[1]}</p>
              </div>
              <button 
                onClick={() => setAttachment(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center text-gray-500 hover:text-blue-500 transition-all"
          >
            <Paperclip className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={lang === 'en' ? "Ask Mathix anything..." : "माथिक्स से कुछ भी पूछें..."}
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !attachment) || loading}
            className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
