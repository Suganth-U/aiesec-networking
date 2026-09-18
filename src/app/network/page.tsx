'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import BroadcastOverlay from '@/components/BroadcastOverlay';
import confetti from 'canvas-confetti';
import { CheckCircle2, Search, Clock, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { Session, User } from '@/types';
import { getGroupById, getTargetGroupForRound, MATCHMAKING_MATRIX } from '@/lib/matrix';
import { getGroupColor } from '@/lib/colors';
import { AvatarCharacter } from '@/components/NationSymbols';

const FO_TO_ELEMENT: Record<string, 'water' | 'earth' | 'fire' | 'air'> = {
  iGT: 'water', iGV: 'earth', oGT: 'fire', oGV: 'air',
};
const FO_TO_NATION: Record<string, string> = {
  iGT: 'Water Tribe', iGV: 'Earth Kingdom', oGT: 'Fire Nation', oGV: 'Air Nomads',
};

const TOTAL_ROUNDS = MATCHMAKING_MATRIX.length;
const MAX_ROUND_INDEX = TOTAL_ROUNDS - 1;

export default function NetworkPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [myGroupId, setMyGroupId] = useState<number | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);
  const prevRoundRef = useRef<number | null>(null);

  // Broadcast Message listener
  useEffect(() => {
    if (session?.broadcastMessage?.id) {
      setActiveBroadcast(session.broadcastMessage.text);
      const timer = setTimeout(() => {
        setActiveBroadcast(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [session?.broadcastMessage?.id, session?.broadcastMessage?.text]);

  // Reset icebreakers and checked state when the round changes
  useEffect(() => {
    if (!session) return;
    if (prevRoundRef.current !== null && prevRoundRef.current !== session.currentRound) {
      setIcebreakers([]);
      setCheckedQuestions({});
      setShowModal(false);
    }
    prevRoundRef.current = session.currentRound;
  }, [session?.currentRound]);

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
            questions: ['Why did you join AIESEC?', "What's something people don't know about you?", "What's your biggest goal this year?", "If you could do an AIESEC exchange anywhere in the world, where would you go and why?", "What's one skill you've gained from AIESEC that surprised you?", "Describe your AIESEC journey in 3 words.", "What's the best advice you've ever received from a fellow AIESECer?", "If you were LC President for a day, what's the first thing you'd change?"],
          });
        } catch { setError('firestore'); }
      }
    }, () => { setSessionLoaded(true); setError('firestore'); });

    return () => { unsubUser(); unsubSession(); };
  }, [uid]);

  const handleFinishRound = async () => {
    if (!uid) return;
    setIsFinishing(true);
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'finished_round' });
    } catch (err) {
      console.error('Failed to finish round:', err);
      alert('Failed to submit. Check your connection and try again.');
    }
    setIsFinishing(false);
  };

  const spinIcebreaker = () => {
    if (!session?.questions?.length) return;
    const shuffled = [...session.questions].sort(() => 0.5 - Math.random());
    setIcebreakers(shuffled.slice(0, 3));
    setCheckedQuestions({});
    setShowModal(true);
  };

  // ── Error states ──

  const renderContent = () => {
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
                <button onClick={() => window.location.reload()} className="w-full bg-white text-black hover:bg-gray-200 font-medium rounded-xl h-11 transition-all active:scale-[0.98]">Retry</button>
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
                <button onClick={() => { localStorage.removeItem('aiesec-uid'); localStorage.removeItem('aiesec-group'); router.push('/join'); }} className="w-full bg-white text-black hover:bg-gray-200 font-medium rounded-xl h-11 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
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
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
              <p className="text-sm text-white/70">Connecting to event...</p>
            </div>
          </div>
        );
      }
    
      const myGroup = getGroupById(myGroupId);
      const myColors = myGroup ? getGroupColor(myGroup.color) : getGroupColor('Black');
      const myFO = myGroup?.name?.split(' - ')[0] || 'iGT';
      const myElement = FO_TO_ELEMENT[myFO] || 'water';
      const myNation = FO_TO_NATION[myFO] || 'Water Tribe';
    
      const targetGroupId = session.currentRound < TOTAL_ROUNDS ? getTargetGroupForRound(myGroupId, session.currentRound) : null;
      const targetGroup = targetGroupId ? getGroupById(targetGroupId) : null;
      const targetColors = targetGroup ? getGroupColor(targetGroup.color) : null;
      const targetFO = targetGroup?.name?.split(' - ')[0] || 'iGT';
      const targetElement = FO_TO_ELEMENT[targetFO] || 'water';
      const targetNation = FO_TO_NATION[targetFO] || 'Water Tribe';
    
      const minutes = Math.floor(session.timeRemaining / 60);
      const seconds = session.timeRemaining % 60;
      const isUrgent = session.timeRemaining <= 30 && session.timeRemaining > 0;
    
      // ── WAITING ──
      if (session.status === 'waiting') {
        return (
          <>
            {/* Dynamic Element Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
              <img src={`/${myElement}-bg.jpg`} alt={`${myElement} background`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
            </div>
    
            <div className="flex-1 flex items-center justify-center p-4 relative z-10 w-full h-full">
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 relative overflow-hidden shadow-2xl">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-5">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">Hold Tight, Bender!</h2>
                  <p className="text-sm text-white/50 mb-6">The arena will open shortly.</p>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-4">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">You are</p>
                    <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm font-bold ${myColors.badge}`}>
                      <div className={`w-3.5 h-3.5 rounded-full ${myColors.dot}`} />
                      {myNation} · {myGroup?.name?.split(' - ')[1]}
                    </div>
                  </div>
                  <p className="text-xs text-white/30">Welcome, {user.name}</p>
                </div>
              </motion.div>
            </div>
          </>
        );
      }
    
      // ── FINISHED ──
      if (session.status === 'finished' || (user.status === 'finished_round' && session.currentRound === MAX_ROUND_INDEX)) {
        return <CongratsScreen user={user} myElement={myElement} />;
      }
    
      // ── FINISHED ROUND ──
      if (user.status === 'finished_round') {
        return (
          <div className="flex-1 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 relative overflow-hidden">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Round Complete! ✅</h2>
                <p className="text-sm text-white/50 mb-4">Great session! Take a quick breather.</p>
                <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Waiting for Round {session.currentRound + 2}...
                </div>
              </div>
            </motion.div>
          </div>
        );
      }
    
      // ── ACTIVE ROUND ──
      return (
        <div className="flex-1 flex flex-col relative">
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <video src="/bgVideo.mp4" autoPlay loop muted playsInline className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover object-center scale-[1.15] md:scale-100 opacity-60" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="max-w-lg mx-auto w-full p-4 sm:p-6 flex flex-col flex-1 relative z-10 overflow-y-auto">
    
            {/* Your group bar */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${myColors.dot}`} />
                <span className="text-xs font-semibold text-white/50">{myNation} · <span className="text-white">{myGroup?.name?.split(' - ')[1]}</span></span>
              </div>
              <span className="text-xs text-white/30">{user.name}</span>
            </div>
    
            {/* Timer */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-4 ${isUrgent ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wide">Round {session.currentRound + 1} of {TOTAL_ROUNDS}</span>
              </div>
              <div className={`text-2xl font-bold font-mono tracking-tight ${isUrgent ? 'text-red-400' : 'text-white'}`}>
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
            </div>
    
            {/* ═══ MATCHMAKING BATTLE CARD ═══ */}
            <motion.div
              key={session.currentRound}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col rounded-2xl overflow-hidden relative border border-white/10"
            >
              {/* Background image for target element */}
              <div className="absolute inset-0 z-0">
                <img src={`/${targetElement}-bg.jpg`} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80" />
              </div>
    
              {/* Removed ElementParticles */}
    
              {/* VS Battle Layout */}
              <div className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-6">
    
                {/* Characters Side by Side */}
                <div className="w-full flex items-end justify-center gap-2 sm:gap-4 mb-2">
                  {/* Your Character - enters from left */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 120 }}
                    className="flex flex-col items-center flex-1 max-w-[45%]"
                  >
                    <motion.div
                      animate={{ y: [-4, 4, -4] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img src={{ water: '/katara.png', earth: '/Toph.png', fire: '/zuko.png', air: '/Aang.png' }[myElement]} alt="You" className="h-28 sm:h-36 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" />
                    </motion.div>
                  </motion.div>
    
                  {/* VS Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, duration: 0.5, type: 'spring', stiffness: 200 }}
                    className="flex-shrink-0 -mb-2 z-20"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)] border-2 border-amber-300/50">
                      <span className="text-base sm:text-lg font-black text-white drop-shadow-md tracking-tight">VS</span>
                    </div>
                  </motion.div>
    
                  {/* Opponent Character - enters from right */}
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6, type: 'spring', stiffness: 120 }}
                    className="flex flex-col items-center flex-1 max-w-[45%]"
                  >
                    <motion.div
                      animate={{ y: [4, -4, 4] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img src={{ water: '/katara.png', earth: '/Toph.png', fire: '/zuko.png', air: '/Aang.png' }[targetElement]} alt="Target" className="h-28 sm:h-36 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" />
                    </motion.div>
                  </motion.div>
                </div>
    
                {/* Labels under characters */}
                <div className="w-full flex items-start justify-between gap-2 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex-1 text-center"
                  >
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 font-semibold mb-1">You</p>
                    <p className="text-sm sm:text-base font-black text-white">{myNation}</p>
                    <p className="text-lg sm:text-xl font-black text-white/90 uppercase tracking-wide">{myGroup?.name?.split(' - ')[1]}</p>
                  </motion.div>
    
                  <div className="w-px" />
    
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex-1 text-center"
                  >
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-400/80 font-semibold mb-1">Find</p>
                    <p className="text-sm sm:text-base font-black text-amber-300">{targetNation}</p>
                    <p className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-lg">{targetGroup?.name?.split(' - ')[1]}</p>
                  </motion.div>
                </div>
    
                {/* Icebreaker Button */}
                <div className="w-full mt-auto">
                  <button onClick={icebreakers.length > 0 ? () => setShowModal(true) : spinIcebreaker} className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-sm font-semibold text-white transition-all active:scale-[0.98] shadow-lg backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-amber-400" /> {icebreakers.length > 0 ? 'View Conversation Starters' : 'Get Conversation Starters'}
                  </button>
                </div>
              </div>
            </motion.div>
    
            {/* Finish */}
            <div className="mt-4 pb-4">
              <button 
                onClick={handleFinishRound} 
                disabled={isFinishing || (icebreakers.length > 0 && !icebreakers.every((_, i) => checkedQuestions[i]))} 
                className="w-full bg-white hover:bg-gray-200 text-black font-bold rounded-xl h-14 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-lg shadow-white/20 disabled:opacity-50"
              >
                {isFinishing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> {session.currentRound === MAX_ROUND_INDEX ? "✅ Finish Event" : "Done! Ready for Next Round"}</>
                )}
              </button>
            </div>
          </div>
    
          <AnimatePresence>
            {showModal && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative overflow-hidden flex flex-col"
                  style={{ maxHeight: '80vh' }}
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" /> Conversation Starters
                  </h3>
                  
                  <div className="space-y-3 mb-6 overflow-y-auto pr-1 flex-1">
                    {icebreakers.map((q, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setCheckedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        className={`flex items-center justify-between gap-4 bg-white/5 border rounded-xl p-4 text-left cursor-pointer transition-all active:scale-[0.98] ${checkedQuestions[idx] ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 hover:bg-white/10'}`}
                      >
                        <div className="flex gap-3 items-start flex-1">
                          <span className={`font-avatar tracking-widest text-lg mt-0.5 ${checkedQuestions[idx] ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {idx + 1}.
                          </span>
                          <p className={`text-sm md:text-base font-medium leading-relaxed transition-colors ${checkedQuestions[idx] ? 'text-white/40 line-through' : 'text-white/90'}`}>
                            {q}
                          </p>
                        </div>
                        <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all ${checkedQuestions[idx] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/30 text-transparent bg-black/20'}`}>
                          <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-full bg-white hover:bg-gray-200 text-black font-bold rounded-xl h-12 flex items-center justify-center transition-all active:scale-[0.98]"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
    
    function CongratsScreen({ user, myElement }: { user: User; myElement: 'water' | 'earth' | 'fire' | 'air' }) {
      const router = useRouter();
    
      useEffect(() => {
        // Fire Confetti in a loop
        const triggerConfetti = () => {
          const duration = 2 * 1000;
          const end = Date.now() + duration;
    
          const frame = () => {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#EF4444', '#3B82F6', '#22C55E', '#F97316']
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#EF4444', '#3B82F6', '#22C55E', '#F97316']
            });
    
            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
        };
    
        triggerConfetti();
        const interval = setInterval(triggerConfetti, 4000); // 2s duration, 4s interval = 2s gap
    
        return () => clearInterval(interval);
      }, []);
    
      const getCharacterMessage = () => {
        switch(myElement) {
          case 'water': return "You adapted gracefully like water! Masterful networking.";
          case 'earth': return "Solid connections! You stood your ground like a true Earthbender.";
          case 'fire': return "You sparked amazing conversations! Your energy was fiery.";
          case 'air': return "You found your freedom! Your networking was a breeze.";
          default: return "You mastered the four nations of networking!";
        }
      };
    
      const handleRestart = () => {
        localStorage.removeItem('aiesec-uid');
        router.push('/');
      };
    
      const handleExit = () => {
        router.push('/');
      };
    
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden w-full min-h-screen">
          {/* Blurred Browser Background Image */}
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat blur-sm opacity-90 scale-105 bg-[url('/mobile-bg.png')] md:bg-[url('/desktop-bg.png')]" />
          <div className="absolute inset-0 bg-black/40 z-0" />
    
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
            className="w-full max-w-3xl z-10 my-auto"
          >
            {/* Gaming Outer Frame */}
            <div className="p-[2px] rounded-[32px] bg-gradient-to-br from-white/40 via-white/5 to-white/20 shadow-2xl">
              {/* Inner Gaming Panel */}
              <div 
                className="bg-black/90 rounded-[30px] overflow-hidden relative flex flex-col md:flex-row min-h-[500px]"
              >
                {/* Background Image of the specific element */}
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 mix-blend-screen" 
                  style={{ backgroundImage: `url(/${myElement}-bg.jpg)` }} 
                />
                {/* Additional gradient to ensure text readability on the right */}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-black via-black/80 to-transparent z-0" />
    
                {/* Shimmer Effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 z-10 pointer-events-none"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                />
    
                {/* Left Area: Character */}
                <div className="relative h-[250px] md:h-auto md:w-2/5 flex items-end justify-center z-20">
                  {/* Tooltip */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute top-8 md:top-20 left-1/2 -translate-x-1/2 md:-translate-x-0 md:-left-8 bg-white text-black p-4 rounded-2xl rounded-bl-sm font-cinzel font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] z-30 w-[220px] text-sm"
                  >
                    {getCharacterMessage()}
                  </motion.div>
    
                  <div className="absolute -bottom-8 md:-bottom-10 pointer-events-none">
                    <AvatarCharacter element={myElement} className="scale-125 md:scale-[1.5]" />
                  </div>
                </div>
    
                {/* Right Area: Text & Actions */}
                <div className="relative z-20 p-8 md:p-12 md:w-3/5 flex flex-col justify-center items-center md:items-end text-center md:text-right">
                  
                  <motion.h2 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-5xl md:text-6xl font-cinzel font-bold text-white mb-6 tracking-widest drop-shadow-lg"
                  >
                    HURRAY!
                  </motion.h2>
    
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="space-y-4 text-sm md:text-base text-white/90 font-noto font-light leading-relaxed mb-10 max-w-sm"
                  >
                    <p>
                      You've successfully journeyed through all four nations! Your willingness to step out of your comfort zone, share your thoughts, and connect with others is what makes this event incredible.
                    </p>
                    <p className="font-bold text-emerald-400 pt-4 border-t border-white/20">
                      Welcome to the unified network, {user.name}!
                    </p>
                  </motion.div>
    
                  {/* Action Buttons */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5 }}
                    className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
                  >
                    <button 
                      onClick={handleRestart}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-xl h-12 flex items-center justify-center transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/30"
                    >
                      Restart Journey
                    </button>
                    <button 
                      onClick={handleExit}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl h-12 flex items-center justify-center transition-all active:scale-[0.98] border border-white/20 backdrop-blur-md"
                    >
                      Exit Game
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      );
  };

  return (
    <>
      <BroadcastOverlay activeBroadcast={activeBroadcast} />
      {renderContent()}
    </>
  );
}
