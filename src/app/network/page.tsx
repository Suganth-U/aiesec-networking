'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Search, Clock, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { Session, User } from '@/types';
import { getGroupById, getTargetGroupForRound } from '@/lib/matrix';
import { getGroupColor } from '@/lib/colors';
import { AvatarCharacter, ElementParticles } from '@/components/NationSymbols';

const FO_TO_ELEMENT: Record<string, 'water' | 'earth' | 'fire' | 'air'> = {
  iGT: 'water', iGV: 'earth', oGT: 'fire', oGV: 'air',
};
const FO_TO_NATION: Record<string, string> = {
  iGT: 'Water Tribe', iGV: 'Earth Kingdom', oGT: 'Fire Nation', oGV: 'Air Nomads',
};

export default function NetworkPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [myGroupId, setMyGroupId] = useState<number | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    const storedUid = localStorage.getItem('aiesec-uid');
    const storedGroup = localStorage.getItem('aiesec-group');
    if (!storedUid) { router.push('/join'); return; }
    setUid(storedUid);
    if (storedGroup) setMyGroupId(parseInt(storedGroup));
  }, [router]);

  useEffect(() => {
    if (!uid) return;
    const unsubUser = onSnapshot(doc(db, 'users', uid), (snap) => {
      setUserLoaded(true);
      if (snap.exists()) setUser(snap.data() as User);
      else setError('notRegistered');
    }, () => { setUserLoaded(true); setError('firestore'); });

    const unsubSession = onSnapshot(doc(db, 'sessions', 'main-event'), async (snap) => {
      setSessionLoaded(true);
      if (snap.exists()) {
        setSession(snap.data() as Session);
      } else {
        try {
          await setDoc(doc(db, 'sessions', 'main-event'), {
            status: 'waiting', currentRound: 0, timeRemaining: 300,
            questions: ['Why did you join AIESEC?', "What's something people don't know about you?", "What's your biggest goal this year?"],
          });
        } catch { setError('firestore'); }
      }
    }, () => { setSessionLoaded(true); setError('firestore'); });

    return () => { unsubUser(); unsubSession(); };
  }, [uid]);

  const handleFinishRound = async () => {
    if (!uid) return;
    setIsFinishing(true);
    try { await updateDoc(doc(db, 'users', uid), { status: 'finished_round' }); } catch {}
    setIsFinishing(false);
  };

  const spinIcebreaker = () => {
    if (!session?.questions?.length) return;
    const shuffled = [...session.questions].sort(() => 0.5 - Math.random());
    setIcebreakers(shuffled.slice(0, 3));
    setCheckedQuestions({});
  };

  // ── Error states ──
  if (error === 'firestore') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center mb-5">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
            <p className="text-sm text-white/50 mb-6">Unable to connect to the event server.</p>
            <button onClick={() => window.location.reload()} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl h-11 transition-all active:scale-[0.98]">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (error === 'notRegistered') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 flex items-center justify-center mb-5">
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Not Registered</h2>
            <p className="text-sm text-white/50 mb-6">You need to register before joining.</p>
            <button onClick={() => { localStorage.removeItem('aiesec-uid'); localStorage.removeItem('aiesec-group'); router.push('/join'); }} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl h-11 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <ArrowLeft className="w-4 h-4" /> Go to Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionLoaded || !userLoaded || !user || !session || myGroupId === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-cyan-400 animate-spin" />
          <p className="text-sm text-white/50">Connecting to event...</p>
        </div>
      </div>
    );
  }

  const myGroup = getGroupById(myGroupId);
  const myColors = myGroup ? getGroupColor(myGroup.color) : getGroupColor('Black');
  const myFO = myGroup?.name.split(' - ')[0] || 'iGT';
  const myElement = FO_TO_ELEMENT[myFO] || 'water';
  const myNation = FO_TO_NATION[myFO] || 'Water Tribe';

  const targetGroupId = session.currentRound < 4 ? getTargetGroupForRound(myGroupId, session.currentRound) : null;
  const targetGroup = targetGroupId ? getGroupById(targetGroupId) : null;
  const targetColors = targetGroup ? getGroupColor(targetGroup.color) : null;
  const targetFO = targetGroup?.name.split(' - ')[0] || 'iGT';
  const targetElement = FO_TO_ELEMENT[targetFO] || 'water';
  const targetNation = FO_TO_NATION[targetFO] || 'Water Tribe';

  const minutes = Math.floor(session.timeRemaining / 60);
  const seconds = session.timeRemaining % 60;
  const isUrgent = session.timeRemaining <= 30 && session.timeRemaining > 0;

  // ── WAITING ──
  if (session.status === 'waiting') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 relative overflow-hidden">
            <ElementParticles element={myElement} count={5} />
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-5">
              <Clock className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Hold Tight, Bender!</h2>
            <p className="text-sm text-white/50 mb-6">The arena will open shortly.</p>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-4">
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">You are</p>
              <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm font-bold ${myColors.badge}`}>
                <div className={`w-3.5 h-3.5 rounded-full ${myColors.dot}`} />
                {myNation} · {myGroup?.name.split(' - ')[1]}
              </div>
            </div>
            <p className="text-xs text-white/30">Welcome, {user.name}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── FINISHED ──
  if (session.status === 'finished' || (user.status === 'finished_round' && session.currentRound === 3)) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-6">🎉 You Did It!</h2>
            <div className="space-y-4 text-sm md:text-base text-white/80 font-medium leading-relaxed">
              <p>Every great relationship starts with a simple conversation.</p>
              <p>Today, you didn't just meet new people you built new connections.</p>
              <p className="text-emerald-400 font-bold pt-2">Thank you for being part of this journey</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── FINISHED ROUND ──
  if (user.status === 'finished_round') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 relative overflow-hidden">
            <ElementParticles element={myElement} count={4} />
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Round Complete! ✅</h2>
            <p className="text-sm text-white/50 mb-4">Great session! Take a quick breather.</p>
            <div className="flex items-center justify-center gap-2 text-xs text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Waiting for Round {session.currentRound + 2}...
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── ACTIVE ROUND ──
  return (
    <div className="flex-1 flex flex-col">
      <div className="max-w-lg mx-auto w-full p-4 sm:p-6 flex flex-col flex-1">

        {/* Your group bar */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${myColors.dot}`} />
            <span className="text-xs font-semibold text-white/50">{myNation} · <span className="text-white">{myGroup?.name.split(' - ')[1]}</span></span>
          </div>
          <span className="text-xs text-white/30">{user.name}</span>
        </div>

        {/* Timer */}
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-4 ${isUrgent ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wide">Round {session.currentRound + 1} of 4</span>
          </div>
          <div className={`text-2xl font-bold font-mono tracking-tight ${isUrgent ? 'text-red-400' : 'text-white'}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Target Card */}
        <motion.div
          key={session.currentRound}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex-1 flex flex-col relative"
        >
          {targetColors && <div className={`h-2 w-full ${targetColors.bg}`} />}
          <ElementParticles element={targetElement} count={6} />

          <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-white/40" />
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Find Your Match</span>
            </div>

            {/* Target bender character */}
            <AvatarCharacter element={targetElement} className="scale-[0.5] mb-0 -mt-4" />

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight -mt-4">
              {targetNation}
            </h2>
            <p className="text-sm text-white/50 mb-4">{targetGroup?.name.split(' - ')[1]}</p>



            {/* Icebreaker */}
            <div className="w-full space-y-3 mt-auto">
              <button onClick={spinIcebreaker} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white/70 transition-all active:scale-[0.98]">
                <Sparkles className="w-4 h-4 text-amber-400" /> Get a Conversation Starter
              </button>
              <AnimatePresence>
                {icebreakers.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-3 mt-4">
                    {icebreakers.map((q, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setCheckedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        className={`flex items-center justify-between gap-4 bg-black/40 backdrop-blur-md border rounded-xl p-4 text-left cursor-pointer transition-all active:scale-[0.98] ${checkedQuestions[idx] ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/10 hover:bg-white/5'}`}
                      >
                        <div className="flex gap-3 items-start flex-1">
                          <span className={`font-avatar tracking-widest text-lg mt-0.5 ${checkedQuestions[idx] ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {idx + 1}.
                          </span>
                          <p className={`text-sm md:text-base font-medium leading-relaxed transition-colors ${checkedQuestions[idx] ? 'text-white/40 line-through' : 'text-white/90'}`}>
                            {q}
                          </p>
                        </div>
                        <div 
                          className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all ${checkedQuestions[idx] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/30 text-transparent bg-black/20'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Finish */}
        <div className="mt-4 pb-4">
          <button 
            onClick={handleFinishRound} 
            disabled={isFinishing || icebreakers.length === 0 || !icebreakers.every((_, i) => checkedQuestions[i])} 
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl h-14 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {isFinishing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><CheckCircle2 className="w-5 h-5" /> {session.currentRound === 3 ? "✅ Finish Event" : "Done! Ready for Next Round"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
