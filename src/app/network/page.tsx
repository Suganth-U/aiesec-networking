'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Search, MessageCircle, Clock, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { Session, User } from '@/types';
import { getGroupById, getTargetGroupForRound } from '@/lib/matrix';
import { getGroupColor } from '@/lib/colors';

export default function NetworkPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [myGroupId, setMyGroupId] = useState<number | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  // Step 1: Check if user has registered
  useEffect(() => {
    const storedUid = localStorage.getItem('aiesec-uid');
    const storedGroup = localStorage.getItem('aiesec-group');
    if (!storedUid) {
      router.push('/join');
      return;
    }
    setUid(storedUid);
    if (storedGroup) setMyGroupId(parseInt(storedGroup));
  }, [router]);

  // Step 2: Subscribe to Firestore
  useEffect(() => {
    if (!uid) return;

    // Listen to user profile
    const unsubUser = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        setUserLoaded(true);
        if (snap.exists()) {
          setUser(snap.data() as User);
        } else {
          // User doc was deleted or doesn't exist
          setError('notRegistered');
        }
      },
      (err) => {
        console.error('User listener error:', err);
        setUserLoaded(true);
        setError('firestore');
      }
    );

    // Listen to session — auto-create if doesn't exist
    const unsubSession = onSnapshot(
      doc(db, 'sessions', 'main-event'),
      async (snap) => {
        setSessionLoaded(true);
        if (snap.exists()) {
          const data = snap.data() as Session;
          setSession(data);
          // Haptic on timer zero
          if (data.timeRemaining === 0 && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        } else {
          // Session doesn't exist yet — create a default one
          try {
            await setDoc(doc(db, 'sessions', 'main-event'), {
              status: 'waiting',
              currentRound: 0,
              timeRemaining: 300,
              questions: [
                'Why did you join AIESEC?',
                "What's something people don't know about you?",
                "What's your biggest goal this year?",
              ],
            });
          } catch (e) {
            console.error('Failed to create session:', e);
            setError('firestore');
          }
        }
      },
      (err) => {
        console.error('Session listener error:', err);
        setSessionLoaded(true);
        setError('firestore');
      }
    );

    return () => {
      unsubUser();
      unsubSession();
    };
  }, [uid]);

  const handleFinishRound = async () => {
    if (!uid) return;
    setIsFinishing(true);
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'finished_round' });
    } catch (e) {
      console.error('Failed to update status:', e);
    }
    setIsFinishing(false);
  };

  const spinIcebreaker = () => {
    if (!session?.questions?.length) return;
    setIcebreaker(session.questions[Math.floor(Math.random() * session.questions.length)]);
  };

  // ── Error: Firestore not connected ──
  if (error === 'firestore') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-transparent">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-5">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Connection Error</h2>
            <p className="text-sm text-zinc-500 mb-6">
              Unable to connect to the event server. Make sure the Firestore database is set up and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl h-11 transition-all active:scale-[0.98]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Error: User not registered ──
  if (error === 'notRegistered') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-transparent">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-5">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Not Registered</h2>
            <p className="text-sm text-zinc-500 mb-6">
              You need to register before joining the session.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('aiesec-uid');
                localStorage.removeItem('aiesec-group');
                router.push('/join');
              }}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl h-11 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading: Waiting for Firestore data ──
  if (!sessionLoaded || !userLoaded || !user || !session || myGroupId === null) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin" />
          <p className="text-sm text-zinc-500">Connecting to event...</p>
          <p className="text-xs text-zinc-400">Make sure the event is set up by the admin</p>
        </div>
      </div>
    );
  }

  const myGroup = getGroupById(myGroupId);
  const myColors = myGroup ? getGroupColor(myGroup.color) : getGroupColor('Black');
  const targetGroupId = session.currentRound < 7 ? getTargetGroupForRound(myGroupId, session.currentRound) : null;
  const targetGroup = targetGroupId ? getGroupById(targetGroupId) : null;
  const targetColors = targetGroup ? getGroupColor(targetGroup.color) : null;

  const minutes = Math.floor(session.timeRemaining / 60);
  const seconds = session.timeRemaining % 60;
  const isUrgent = session.timeRemaining <= 30 && session.timeRemaining > 0;

  // ── WAITING: Session not started yet ──
  if (session.status === 'waiting') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-transparent">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center mb-5">
              <Clock className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-1">Hold Tight!</h2>
            <p className="text-sm text-zinc-500 mb-6">
              The session will begin shortly. The facilitator will start the first round soon.
            </p>

            {/* Your Group Badge */}
            <div className="p-4 bg-transparent rounded-xl border border-zinc-100 mb-4">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-2">You are</p>
              <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm font-bold ${myColors.badge}`}>
                <div className={`w-3.5 h-3.5 rounded-full ${myColors.dot}`} />
                {myGroup?.name}
              </div>
            </div>

            <p className="text-xs text-zinc-400">
              Welcome, {user.name}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── FINISHED: Event is over ──
  if (session.status === 'finished') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-transparent">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-1">Session Complete! 🎉</h2>
            <p className="text-sm text-zinc-500 mb-4">
              Thank you for networking, {user.name}! We hope you made great connections.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── FINISHED ROUND: Waiting for next round ──
  if (user.status === 'finished_round') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-zinc-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-1">Round Complete! ✅</h2>
            <p className="text-sm text-zinc-500 mb-4">
              Great conversation! Hang tight while the facilitator starts the next round.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Waiting for Round {session.currentRound + 2}...
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── ACTIVE ROUND: Find your match! ──
  return (
    <div className="flex-1 flex flex-col bg-zinc-50">
      <div className="max-w-lg mx-auto w-full p-4 sm:p-6 flex flex-col flex-1">

        {/* Your Group Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white border border-zinc-200 mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${myColors.dot}`} />
            <span className="text-xs font-semibold text-zinc-500">You are <span className="text-zinc-900">{myGroup?.name}</span></span>
          </div>
          <span className="text-xs text-zinc-400">{user.name}</span>
        </div>

        {/* Timer Bar */}
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-4 ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Round {session.currentRound + 1} of 7</span>
          </div>
          <div className={`text-2xl font-bold font-mono tracking-tight ${isUrgent ? 'text-red-600' : 'text-zinc-900'}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Target Card */}
        <motion.div
          key={session.currentRound}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex-1 flex flex-col"
        >
          {/* Color strip */}
          {targetColors && <div className={`h-2 w-full ${targetColors.bg}`} />}

          <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Find Your Match</span>
            </div>

            {/* Target group name */}
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
              {targetGroup?.name}
            </h2>

            {/* Color badge */}
            {targetColors && (
              <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm font-bold mb-8 ${targetColors.badge}`}>
                <div className={`w-4 h-4 rounded-full ${targetColors.dot}`} />
                {targetGroup?.color} Group
              </div>
            )}

            {/* Icebreaker */}
            <div className="w-full space-y-3 mt-auto">
              <button
                onClick={spinIcebreaker}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-sm font-medium text-zinc-700 transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Get a Conversation Starter
              </button>

              <AnimatePresence>
                {icebreaker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm text-amber-800 font-medium italic">"{icebreaker}"</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Finish Button */}
        <div className="mt-4 pb-4">
          <button
            onClick={handleFinishRound}
            disabled={isFinishing}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl h-14 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
          >
            {isFinishing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                ✅ Finished
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
