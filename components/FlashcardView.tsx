import React, { useState, useEffect, useRef } from 'react';
import { Flashcard } from '../types';
import { RotateCw, Check, X, Flame } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface FlashcardViewProps {
  cards: Flashcard[];
  onComplete: (minutesSpent: number, cardsReviewed: number) => void;
  onRateCard?: (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ cards, onComplete, onRateCard }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const { recordStudyActivity, addXp, updateQuestProgress, user } = useUser();
  const [showStreakOverlay, setShowStreakOverlay] = useState(false);

  // Trigger streak check only on the very first card interaction of the session
  const [hasCheckedStreak, setHasCheckedStreak] = useState(false);

  if (!cards || cards.length === 0) {
      return <div className="p-8 text-center text-slate-500">No flashcards available.</div>;
  }

  const currentCard = cards[currentIndex];

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    // Attempt to extend streak on first card rating
    if (!hasCheckedStreak) {
        const streakExtended = recordStudyActivity();
        setHasCheckedStreak(true);
        if (streakExtended) {
            setShowStreakOverlay(true);
            // Hide overlay after 3 seconds
            setTimeout(() => setShowStreakOverlay(false), 3000);
        }
    }

    // Award XP
    addXp(10);

    if (onRateCard) {
        onRateCard(currentCard.id, rating);
    }
    
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const endTime = Date.now();
        const minutes = (endTime - startTimeRef.current) / 60000;
        
        // Update Quest Progress
        updateQuestProgress('REVIEW_CARDS', cards.length);
        
        onComplete(minutes, cards.length); // Pass total cards reviewed
      }
    }, 200);
  };

  const progress = ((currentIndex) / cards.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 max-w-2xl mx-auto relative">
      
      {/* Streak Overlay */}
      {showStreakOverlay && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border-2 border-orange-100 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                   <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                       <Flame className="text-orange-500 fill-orange-500" size={48} />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900 mb-1">Streak Extended!</h2>
                   <p className="text-orange-600 font-bold text-lg">{user?.streak} Day Streak 🔥</p>
              </div>
          </div>
      )}

      {/* Progress */}
      <div className="w-full bg-slate-200 rounded-full h-2 mb-8">
        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Card Container */}
      <div 
        className="relative w-full aspect-[3/2] cursor-pointer group perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full text-center transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          
          {/* Front */}
          <div className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-8 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
             <span className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Question</span>
             <h3 className="text-2xl font-medium text-slate-800 leading-relaxed select-none">{currentCard.front}</h3>
             <p className="text-xs text-slate-400 absolute bottom-6">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 bg-indigo-50 rounded-2xl shadow-xl border border-indigo-100 flex flex-col items-center justify-center p-8 backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
             <span className="text-xs font-bold text-indigo-400 uppercase mb-4 tracking-wider">Answer</span>
             <h3 className="text-xl font-medium text-indigo-900 leading-relaxed select-none">{currentCard.back}</h3>
          </div>
        </div>
      </div>

      {/* Controls (Only show when flipped) */}
      <div className={`mt-8 grid grid-cols-4 gap-3 w-full transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
         <button onClick={(e) => { e.stopPropagation(); handleRating('again'); }} className="flex flex-col items-center p-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors">
            <span className="font-bold text-sm">Again</span>
            <span className="text-xs text-slate-500 mt-1">+10 XP</span>
         </button>
         <button onClick={(e) => { e.stopPropagation(); handleRating('hard'); }} className="flex flex-col items-center p-3 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors">
            <span className="font-bold text-sm">Hard</span>
            <span className="text-xs text-slate-500 mt-1">+10 XP</span>
         </button>
         <button onClick={(e) => { e.stopPropagation(); handleRating('good'); }} className="flex flex-col items-center p-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors">
            <span className="font-bold text-sm">Good</span>
            <span className="text-xs text-slate-500 mt-1">+10 XP</span>
         </button>
         <button onClick={(e) => { e.stopPropagation(); handleRating('easy'); }} className="flex flex-col items-center p-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors">
            <span className="font-bold text-sm">Easy</span>
            <span className="text-xs text-slate-500 mt-1">+10 XP</span>
         </button>
      </div>

    </div>
  );
};

export default FlashcardView;