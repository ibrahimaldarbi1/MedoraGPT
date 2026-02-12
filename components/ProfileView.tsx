import React from 'react';
import { User, Settings, LogOut, Bell, Shield } from 'lucide-react';

const ProfileView: React.FC = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Profile & Settings</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         {/* Header */}
         <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
               <User size={32} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-slate-900">Student User</h2>
               <p className="text-slate-500">student@university.edu</p>
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

            <div className="p-4 hover:bg-red-50 cursor-pointer flex items-center gap-4 transition-colors group">
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