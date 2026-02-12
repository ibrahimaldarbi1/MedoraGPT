import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Quest, QuestType } from '../types';
import { BADGE_REGISTRY } from '../constants';
import { supabase } from '../services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  updateUser: (updates: Partial<User>) => void;
  recordStudyActivity: () => boolean;
  addXp: (amount: number) => void;
  checkBadges: (stats: { cardsReviewed?: number; quizScore?: number; quizTotal?: number }) => string[];
  updateQuestProgress: (type: QuestType, amount: number) => void;
  getLevelInfo: () => LevelInfo;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const QUEST_TEMPLATES: Omit<Quest, 'id' | 'progress' | 'completed'>[] = [
    { type: 'REVIEW_CARDS', description: 'Review 10 Flashcards', target: 10, xpReward: 50, icon: 'Brain' },
    { type: 'REVIEW_CARDS', description: 'Review 25 Flashcards', target: 25, xpReward: 100, icon: 'Layers' },
    { type: 'ACE_QUIZ', description: 'Score 80%+ on a Quiz', target: 1, xpReward: 75, icon: 'Award' },
    { type: 'UPLOAD_LECTURE', description: 'Upload a New Lecture', target: 1, xpReward: 50, icon: 'Upload' },
    { type: 'ACE_QUIZ', description: 'Get a Perfect Quiz Score', target: 1, xpReward: 150, icon: 'Star' },
];

const getToday = () => new Date().toISOString().split('T')[0];

const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

const generateDailyQuests = (): Quest[] => {
  const today = getToday();
  const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map((q, i) => ({
    ...q,
    id: `${today}-${i}`,
    progress: 0,
    completed: false
  }));
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (session: Session) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: session.user.id,
          name: session.user.user_metadata?.name || '',
          email: session.user.email || '',
        });
        if (insertError) {
          console.error('Failed to create profile:', insertError);
          setUser(null);
          setIsLoading(false);
          return;
        }
        loadProfile(session);
        return;
      }
      console.error('Failed to load profile:', error);
      setUser(null);
      setIsLoading(false);
      return;
    }

    const today = getToday();
    const yesterday = getYesterday();

    let profile: User = {
      name: data.name || '',
      email: data.email || session.user.email || '',
      university: data.university || '',
      majors: data.majors || [],
      studyGoal: data.study_goal || undefined,
      onboardingComplete: data.onboarding_complete || false,
      streak: data.streak || 0,
      lastStudyDate: data.last_study_date || '',
      xp: data.xp || 0,
      badges: data.badges || [],
      dailyStats: data.daily_stats || { date: today, cardsStudied: 0 },
      dailyQuests: data.daily_quests || [],
      lastQuestGenerationDate: data.last_quest_generation_date || '',
    };

    if (profile.lastStudyDate && profile.lastStudyDate !== today && profile.lastStudyDate !== yesterday) {
      profile.streak = 0;
    }

    if (profile.lastQuestGenerationDate !== today) {
      profile.dailyQuests = generateDailyQuests();
      profile.lastQuestGenerationDate = today;
      profile.dailyStats = { date: today, cardsStudied: 0 };
    }

    setUser(profile);
    setIsLoading(false);

    await supabase.from('profiles').update({
      streak: profile.streak,
      daily_quests: profile.dailyQuests,
      last_quest_generation_date: profile.lastQuestGenerationDate,
      daily_stats: profile.dailyStats,
    }).eq('id', session.user.id);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile(session);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadProfile(session);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const saveProfileToSupabase = useCallback(async (updates: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('profiles').update(updates).eq('id', session.user.id);
    if (error) console.error('Failed to save profile:', error);
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signup = async (name: string, email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) return { error: error.message };
    return {};
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };

      const dbUpdates: Record<string, unknown> = {};
      if (updates.university !== undefined) dbUpdates.university = updates.university;
      if (updates.majors !== undefined) dbUpdates.majors = updates.majors;
      if (updates.studyGoal !== undefined) dbUpdates.study_goal = updates.studyGoal;
      if (updates.onboardingComplete !== undefined) dbUpdates.onboarding_complete = updates.onboardingComplete;
      if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
      if (updates.lastStudyDate !== undefined) dbUpdates.last_study_date = updates.lastStudyDate;
      if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
      if (updates.badges !== undefined) dbUpdates.badges = updates.badges;
      if (updates.dailyStats !== undefined) dbUpdates.daily_stats = updates.dailyStats;
      if (updates.dailyQuests !== undefined) dbUpdates.daily_quests = updates.dailyQuests;
      if (updates.lastQuestGenerationDate !== undefined) dbUpdates.last_quest_generation_date = updates.lastQuestGenerationDate;
      if (updates.name !== undefined) dbUpdates.name = updates.name;

      if (Object.keys(dbUpdates).length > 0) {
        saveProfileToSupabase(dbUpdates);
      }

      return updated;
    });
  };

  const recordStudyActivity = (): boolean => {
    if (!user) return false;

    const today = getToday();
    const yesterday = getYesterday();

    if (user.lastStudyDate === today) return false;

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
    saveProfileToSupabase({ streak: newStreak, last_study_date: today });
    return true;
  };

  const addXp = (amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, xp: (prev.xp || 0) + amount };
      saveProfileToSupabase({ xp: updated.xp });
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
        if (isCompleted) xpGained += q.xpReward;
        return { ...q, progress: newProgress, completed: isCompleted };
      }
      return q;
    });

    const hasChanges = JSON.stringify(updatedQuests) !== JSON.stringify(user.dailyQuests);

    if (hasChanges) {
      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, dailyQuests: updatedQuests };
        if (xpGained > 0) updated.xp = (updated.xp || 0) + xpGained;
        saveProfileToSupabase({ daily_quests: updatedQuests, xp: updated.xp });
        return updated;
      });
    }
  };

  const checkBadges = (stats: { cardsReviewed?: number; quizScore?: number; quizTotal?: number }) => {
    if (!user) return [];

    const today = getToday();
    let currentStats = { ...user.dailyStats };

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
        saveProfileToSupabase({
          daily_stats: currentStats,
          badges: updated.badges
        });
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

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, updateUser, recordStudyActivity, addXp, checkBadges, updateQuestProgress, getLevelInfo, logout }}>
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
