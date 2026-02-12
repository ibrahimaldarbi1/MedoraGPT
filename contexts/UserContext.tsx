import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Quest, QuestType } from '../types';
import { BADGE_REGISTRY } from '../constants';

interface LevelInfo {
  level: number;
  title: string;
  min: number;
  max: number;
  current: number;
  progress: number;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  signup: (name: string, email: string) => void;
  updateUser: (updates: Partial<User>) => void;
  recordStudyActivity: () => boolean; // Returns true if streak was extended today
  addXp: (amount: number) => void;
  checkBadges: (stats: { cardsReviewed?: number; quizScore?: number; quizTotal?: number }) => string[]; // Returns list of newly unlocked badge IDs
  updateQuestProgress: (type: QuestType, amount: number) => void;
  getLevelInfo: () => LevelInfo;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const QUEST_TEMPLATES: Omit<Quest, 'id' | 'progress' | 'completed'>[] = [
    { type: 'REVIEW_CARDS', description: 'Review 10 Flashcards', target: 10, xpReward: 50, icon: 'Brain' },
    { type: 'REVIEW_CARDS', description: 'Review 25 Flashcards', target: 25, xpReward: 100, icon: 'Layers' },
    { type: 'ACE_QUIZ', description: 'Score 80%+ on a Quiz', target: 1, xpReward: 75, icon: 'Award' },
    { type: 'UPLOAD_LECTURE', description: 'Upload a New Lecture', target: 1, xpReward: 50, icon: 'Upload' },
    { type: 'ACE_QUIZ', description: 'Get a Perfect Quiz Score', target: 1, xpReward: 150, icon: 'Star' },
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const getToday = () => new Date().toISOString().split('T')[0];

  const getYesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('medoraGPT_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      
      const today = getToday();
      const yesterday = getYesterday();
      
      let updatedUser = { ...parsedUser };
      
      // Initialize fields if missing (backward compatibility)
      if (typeof updatedUser.xp === 'undefined') updatedUser.xp = 0;
      if (!updatedUser.badges) updatedUser.badges = [];
      if (!updatedUser.dailyStats) updatedUser.dailyStats = { date: today, cardsStudied: 0 };
      if (!updatedUser.dailyQuests) updatedUser.dailyQuests = [];
      if (!updatedUser.lastQuestGenerationDate) updatedUser.lastQuestGenerationDate = '';
      
      // Check streak validity on load
      if (parsedUser.lastStudyDate && parsedUser.lastStudyDate !== today && parsedUser.lastStudyDate !== yesterday) {
         updatedUser.streak = 0;
      }
      
      // Generate Daily Quests if needed
      if (updatedUser.lastQuestGenerationDate !== today) {
          const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 3).map((q, i) => ({
              ...q,
              id: `${today}-${i}`,
              progress: 0,
              completed: false
          }));
          updatedUser.dailyQuests = selected;
          updatedUser.lastQuestGenerationDate = today;
          // Reset daily stats if day changed
          updatedUser.dailyStats = { date: today, cardsStudied: 0 };
      }

      setUser(updatedUser);
      // We don't save to localStorage immediately inside useEffect to avoid re-render loops or side effects, 
      // but syncing initial migration is good practice.
      localStorage.setItem('medoraGPT_user', JSON.stringify(updatedUser));
    }
  }, []);

  const login = (email: string) => {
    const today = getToday();
    // Generate initial quests for new session
    const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
    const initialQuests = shuffled.slice(0, 3).map((q, i) => ({
        ...q,
        id: `${today}-${i}`,
        progress: 0,
        completed: false
    }));

    const dummyUser: User = {
      name: "Demo Student",
      email: email,
      university: "MIT", 
      onboardingComplete: true,
      streak: 0,
      lastStudyDate: '',
      xp: 120,
      badges: [],
      dailyStats: { date: today, cardsStudied: 0 },
      dailyQuests: initialQuests,
      lastQuestGenerationDate: today
    };
    setUser(dummyUser);
    localStorage.setItem('medoraGPT_user', JSON.stringify(dummyUser));
  };

  const signup = (name: string, email: string) => {
    const today = getToday();
    const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
    const initialQuests = shuffled.slice(0, 3).map((q, i) => ({
        ...q,
        id: `${today}-${i}`,
        progress: 0,
        completed: false
    }));

    const newUser: User = {
      name: name,
      email: email,
      onboardingComplete: false,
      streak: 0,
      lastStudyDate: '',
      xp: 0,
      badges: [],
      dailyStats: { date: today, cardsStudied: 0 },
      dailyQuests: initialQuests,
      lastQuestGenerationDate: today
    };
    setUser(newUser);
    localStorage.setItem('medoraGPT_user', JSON.stringify(newUser));
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, ...updates };
        localStorage.setItem('medoraGPT_user', JSON.stringify(updated));
        return updated;
    });
  };

  const recordStudyActivity = (): boolean => {
      if (!user) return false;

      const today = getToday();
      const yesterday = getYesterday();

      if (user.lastStudyDate === today) {
          return false;
      }

      let newStreak = 1;
      if (user.lastStudyDate === yesterday) {
          newStreak = (user.streak || 0) + 1;
      } 
      
      const updatedUser = {
          ...user,
          streak: newStreak,
          lastStudyDate: today
      };

      setUser(updatedUser);
      localStorage.setItem('medoraGPT_user', JSON.stringify(updatedUser));
      return true;
  };

  const addXp = (amount: number) => {
      setUser(prev => {
          if (!prev) return null;
          const updated = { ...prev, xp: (prev.xp || 0) + amount };
          localStorage.setItem('medoraGPT_user', JSON.stringify(updated));
          return updated;
      });
  };

  const updateQuestProgress = (type: QuestType, amount: number) => {
      if (!user) return;
      
      let xpGained = 0;
      const updatedQuests = user.dailyQuests.map(q => {
          if (q.type === type && !q.completed) {
              const newProgress = q.progress + amount;
              const isCompleted = newProgress >= q.target;
              if (isCompleted) {
                  xpGained += q.xpReward;
              }
              return {
                  ...q,
                  progress: newProgress,
                  completed: isCompleted
              };
          }
          return q;
      });

      // Only update state if something changed
      const hasChanges = JSON.stringify(updatedQuests) !== JSON.stringify(user.dailyQuests);
      
      if (hasChanges) {
          setUser(prev => {
              if (!prev) return null;
              const updated = { ...prev, dailyQuests: updatedQuests };
              if (xpGained > 0) {
                  updated.xp = (updated.xp || 0) + xpGained;
              }
              localStorage.setItem('medoraGPT_user', JSON.stringify(updated));
              return updated;
          });
      }
  };

  const checkBadges = (stats: { cardsReviewed?: number; quizScore?: number; quizTotal?: number }) => {
      if (!user) return [];
      
      const today = getToday();
      let currentStats = { ...user.dailyStats };
      
      // Reset daily stats if new day (redundancy check)
      if (currentStats.date !== today) {
          currentStats = { date: today, cardsStudied: 0 };
      }

      if (stats.cardsReviewed) {
          currentStats.cardsStudied += stats.cardsReviewed;
      }

      const newBadges: string[] = [];
      const unlockedSet = new Set(user.badges);

      if (!unlockedSet.has('first_step')) newBadges.push('first_step');

      if (!unlockedSet.has('night_owl')) {
          const hour = new Date().getHours();
          if (hour >= 22 || hour < 4) newBadges.push('night_owl');
      }

      if (!unlockedSet.has('crammer')) {
          if (currentStats.cardsStudied >= 500) newBadges.push('crammer');
      }

      if (!unlockedSet.has('quiz_master')) {
          if (stats.quizScore !== undefined && stats.quizTotal !== undefined && stats.quizTotal > 0) {
              if (stats.quizScore === stats.quizTotal) newBadges.push('quiz_master');
          }
      }

      if (newBadges.length > 0 || currentStats.cardsStudied !== user.dailyStats.cardsStudied) {
          setUser(prev => {
              if (!prev) return null;
              const updated = {
                  ...prev,
                  dailyStats: currentStats,
                  badges: [...prev.badges, ...newBadges]
              };
              localStorage.setItem('medoraGPT_user', JSON.stringify(updated));
              return updated;
          });
      }

      return newBadges;
  };

  const getLevelInfo = (): LevelInfo => {
      const xp = user?.xp || 0;
      if (xp < 500) return { level: 1, title: 'Novice', min: 0, max: 500, current: xp, progress: (xp / 500) * 100 };
      if (xp < 1500) return { level: 2, title: 'Apprentice', min: 500, max: 1500, current: xp, progress: ((xp - 500) / 1000) * 100 };
      if (xp < 3000) return { level: 3, title: 'Scholar', min: 1500, max: 3000, current: xp, progress: ((xp - 1500) / 1500) * 100 };
      return { level: 4, title: 'Master', min: 3000, max: 10000, current: xp, progress: Math.min(100, ((xp - 3000) / 7000) * 100) };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medoraGPT_user');
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated: !!user, login, signup, updateUser, recordStudyActivity, addXp, checkBadges, updateQuestProgress, getLevelInfo, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};