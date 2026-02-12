import React from 'react';
import { User as UserIcon, Settings, LogOut, Bell, Shield, Trophy, Zap, Flag, Moon, Layers, Award } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { BADGE_REGISTRY } from '../constants';

const ProfileView: React.FC = () => {
  const { user, logout, getLevelInfo } = useUser();
  const navigate = useNavigate();
  const levelInfo = getLevelInfo();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Icon mapping
  const iconMap: Record<string, React.ElementType> = {
      'Flag': Flag,
      'Moon': Moon,
      'Layers': Layers,
      'Award': Award
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Profile & Settings</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
         {/* Header */}
         <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
               <UserIcon size={32} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-slate-900">{user?.name || 'Student'}</h2>
               <p className="text-slate-500">{user?.email || 'email@example.com'}</p>
               <p className="text-xs text-indigo-600 font-medium mt-1">{user?.university}</p>
            </div>
         </div>

         {/* XP & Leveling Section */}
         <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
            <div className="flex justify-between items-end mb-2">
                <div>
                   <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Current Level</span>
                   <div className="flex items-center gap-2">
                       <h3 className="text-2xl font-bold text-slate-900">Level {levelInfo.level}: {levelInfo.title}</h3>
                       <Trophy size={20} className="text-yellow-500" />
                   </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-indigo-600">{user?.xp || 0}</span>
                    <span className="text-sm text-slate-500 ml-1">XP</span>
                </div>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden mb-2">
                <div 
                   className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                   style={{ width: `${levelInfo.progress}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>{levelInfo.min} XP</span>
                <span>{levelInfo.max} XP</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                    <span className="block text-xs text-slate-400">Next Level</span>
                    <span className="block font-bold text-slate-700">+{Math.round(levelInfo.max - levelInfo.current)} XP</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                   <span className="block text-xs text-slate-400">Current Streak</span>
                   <span className="block font-bold text-orange-500">{user?.streak} Days</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                   <span className="block text-xs text-slate-400">Goal</span>
                   <span className="block font-bold text-indigo-600">{user?.studyGoal || 'Daily'}</span>
                </div>
            </div>
         </div>

         {/* Trophy Case */}
         <div className="p-6 border-b border-slate-100">
             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Trophy size={18} className="text-yellow-600" />
                 Trophy Case
             </h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {BADGE_REGISTRY.map(badge => {
                     const isUnlocked = user?.badges.includes(badge.id);
                     const Icon = iconMap[badge.icon] || Flag;
                     
                     return (
                         <div 
                            key={badge.id}
                            className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                                isUnlocked 
                                  ? `${badge.color} border-slate-100` 
                                  : 'bg-slate-50 border-slate-100 text-slate-300 grayscale'
                            }`}
                         >
                             <div className={`p-2 rounded-full mb-2 ${isUnlocked ? 'bg-white/50' : 'bg-slate-100'}`}>
                                 <Icon size={24} />
                             </div>
                             <p className={`text-xs font-bold ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}>{badge.name}</p>
                             <p className={`text-[10px] mt-1 leading-tight ${isUnlocked ? 'opacity-80' : 'opacity-40'}`}>{badge.description}</p>
                         </div>
                     )
                 })}
             </div>
         </div>

         {/* Settings List */}
         <div className="divide-y divide-slate-100">
            <div className="p-4 hover:bg-slate-50 cursor-pointer flex items-center gap-4 transition-colors">
               <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Settings size={20} /></div>
               <div className="flex-1">
                  <h3 className="font-medium text-slate-900">General Settings</h3>
                  <p className="text-sm text-slate-500">Language, Timezone</p>
               </div>
            </div>
            
            <div className="p-4 hover:bg-slate-50 cursor-pointer flex items-center gap-4 transition-colors">
               <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Bell size={20} /></div>
               <div className="flex-1">
                  <h3 className="font-medium text-slate-900">Notifications</h3>
                  <p className="text-sm text-slate-500">Study reminders, Exam alerts</p>
               </div>
            </div>

            <div className="p-4 hover:bg-slate-50 cursor-pointer flex items-center gap-4 transition-colors">
               <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Shield size={20} /></div>
               <div className="flex-1">
                  <h3 className="font-medium text-slate-900">Data & Privacy</h3>
                  <p className="text-sm text-slate-500">Manage your data</p>
               </div>
            </div>

            <div 
              onClick={handleLogout}
              className="p-4 hover:bg-red-50 cursor-pointer flex items-center gap-4 transition-colors group"
            >
               <div className="p-2 bg-red-100 rounded-lg text-red-600 group-hover:bg-red-200"><LogOut size={20} /></div>
               <div className="flex-1">
                  <h3 className="font-medium text-red-600">Sign Out</h3>
               </div>
            </div>
         </div>
      </div>
      
      <p className="text-center text-slate-400 text-sm mt-8">medoraGPT v1.0.0 (Concept)</p>
    </div>
  );
};

export default ProfileView;