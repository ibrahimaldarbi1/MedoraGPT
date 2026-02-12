import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Search, GraduationCap, Book, Zap, ArrowRight, Check } from 'lucide-react';

const UNIVERSITIES = [
  "Massachusetts Institute of Technology (MIT)",
  "Stanford University",
  "Harvard University",
  "University of California, Berkeley (UCB)",
  "University of Oxford",
  "University of Cambridge",
  "California Institute of Technology (Caltech)",
  "Yale University",
  "Princeton University",
  "Columbia University"
];

const MAJORS = [
  "Computer Science",
  "Medicine",
  "Law",
  "Engineering",
  "Business & Management",
  "Psychology",
  "Arts & Humanities",
  "Biological Sciences",
  "Physics",
  "Economics"
];

const GOALS = [
  { 
    id: 'Daily', 
    title: 'Daily Habit', 
    desc: 'I want to build a consistent study routine.', 
    icon: Book 
  },
  { 
    id: 'Cramming', 
    title: 'Cramming', 
    desc: 'I have exams coming up soon!', 
    icon: Zap 
  },
  { 
    id: 'Casually', 
    title: 'Casually', 
    desc: 'I am learning at my own pace.', 
    icon: GraduationCap 
  }
] as const;

const OnboardingView: React.FC = () => {
  const { updateUser, user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [university, setUniversity] = useState('');
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [goal, setGoal] = useState<typeof GOALS[number]['id'] | undefined>(undefined);
  
  const [uniSearch, setUniSearch] = useState('');
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);

  const filteredUnis = UNIVERSITIES.filter(u => u.toLowerCase().includes(uniSearch.toLowerCase()));

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    updateUser({
      university,
      majors: selectedMajors,
      studyGoal: goal,
      onboardingComplete: true
    });
    navigate('/');
  };

  const toggleMajor = (major: string) => {
    if (selectedMajors.includes(major)) {
      setSelectedMajors(prev => prev.filter(m => m !== major));
    } else {
      setSelectedMajors(prev => [...prev, major]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 justify-center">
           {[1, 2, 3].map(i => (
             <div key={i} className={`h-2 w-12 rounded-full transition-colors ${step >= i ? 'bg-indigo-600' : 'bg-slate-200'}`} />
           ))}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[400px] flex flex-col">
          
          {/* Step 1: University */}
          {step === 1 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-8 duration-300">
               <h2 className="text-3xl font-bold text-slate-900 mb-2">Where do you study?</h2>
               <p className="text-slate-500 mb-8">We'll tailor your experience to your university's curriculum style.</p>
               
               <div className="relative">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search your university..."
                      value={uniSearch}
                      onChange={(e) => {
                          setUniSearch(e.target.value);
                          setIsUniDropdownOpen(true);
                      }}
                      onFocus={() => setIsUniDropdownOpen(true)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg"
                    />
                 </div>
                 
                 {isUniDropdownOpen && filteredUnis.length > 0 && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-10">
                      {filteredUnis.map(uni => (
                        <button 
                          key={uni}
                          onClick={() => {
                            setUniversity(uni);
                            setUniSearch(uni);
                            setIsUniDropdownOpen(false);
                          }}
                          className="w-full text-left px-6 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          {uni}
                        </button>
                      ))}
                   </div>
                 )}
               </div>

               {university && (
                  <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3 text-indigo-800">
                      <GraduationCap size={24} />
                      <span className="font-medium">{university}</span>
                  </div>
               )}
            </div>
          )}

          {/* Step 2: Majors */}
          {step === 2 && (
             <div className="flex-1 animate-in fade-in slide-in-from-right-8 duration-300">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">What are you studying?</h2>
                <p className="text-slate-500 mb-8">Select all that apply to personalize your feed.</p>
                
                <div className="flex flex-wrap gap-3">
                   {MAJORS.map(major => (
                      <button
                        key={major}
                        onClick={() => toggleMajor(major)}
                        className={`px-5 py-3 rounded-full border text-sm font-medium transition-all ${
                          selectedMajors.includes(major) 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                        }`}
                      >
                        {major}
                      </button>
                   ))}
                </div>
             </div>
          )}

          {/* Step 3: Goal */}
          {step === 3 && (
             <div className="flex-1 animate-in fade-in slide-in-from-right-8 duration-300">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">What's your goal?</h2>
                <p className="text-slate-500 mb-8">This helps us schedule your spaced repetition.</p>
                
                <div className="grid gap-4">
                    {GOALS.map(g => (
                        <button
                          key={g.id}
                          onClick={() => setGoal(g.id)}
                          className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group ${
                            goal === g.id 
                              ? 'border-indigo-600 bg-indigo-50' 
                              : 'border-slate-100 hover:border-indigo-200'
                          }`}
                        >
                            <div className={`p-3 rounded-xl ${goal === g.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                <g.icon size={24} />
                            </div>
                            <div>
                                <h3 className={`font-bold ${goal === g.id ? 'text-indigo-900' : 'text-slate-900'}`}>{g.title}</h3>
                                <p className={`text-sm ${goal === g.id ? 'text-indigo-700' : 'text-slate-500'}`}>{g.desc}</p>
                            </div>
                            {goal === g.id && <Check className="ml-auto text-indigo-600" />}
                        </button>
                    ))}
                </div>
             </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-end">
             <button 
               onClick={handleNext}
               disabled={
                 (step === 1 && !university) || 
                 (step === 2 && selectedMajors.length === 0) || 
                 (step === 3 && !goal)
               }
               className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
             >
               {step === 3 ? 'Get Started' : 'Next'}
               <ArrowRight size={20} />
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OnboardingView;