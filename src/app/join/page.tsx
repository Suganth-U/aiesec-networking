'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, User as UserIcon, PartyPopper, AlertTriangle } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FrontOffice, Role } from '@/types';
import { GROUPS } from '@/lib/matrix';
import { getGroupColor } from '@/lib/colors';
import { WaterSymbol, EarthSymbol, FireSymbol, AirSymbol, AvatarCharacter, ElementParticles } from '@/components/NationSymbols';

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

const NATIONS: { value: FrontOffice; nation: string; element: 'water' | 'earth' | 'fire' | 'air'; desc: string; gradient: string; border: string; text: string }[] = [
  { value: 'iGT', nation: 'Water Tribe', element: 'water', desc: 'Incoming Global Talent', gradient: 'from-blue-600/20 to-blue-800/20', border: 'border-blue-500/40', text: 'text-blue-400' },
  { value: 'iGV', nation: 'Earth Kingdom', element: 'earth', desc: 'Incoming Global Volunteer', gradient: 'from-emerald-600/20 to-emerald-800/20', border: 'border-emerald-500/40', text: 'text-emerald-400' },
  { value: 'oGT', nation: 'Fire Nation', element: 'fire', desc: 'Outgoing Global Talent', gradient: 'from-red-600/20 to-red-800/20', border: 'border-red-500/40', text: 'text-red-400' },
  { value: 'oGV', nation: 'Air Nomads', element: 'air', desc: 'Outgoing Global Volunteer', gradient: 'from-orange-600/20 to-orange-800/20', border: 'border-orange-500/40', text: 'text-orange-400' },
];

const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: 'LB', label: 'Leadership Body', desc: 'Specialist, Manager, Team leader' },
  { value: 'Member', label: 'Member', desc: 'Team Member' },
];

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [frontOffice, setFrontOffice] = useState<FrontOffice | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  const getGroupName = () => frontOffice && role ? `${frontOffice} - ${role}` : '';
  const getColor = () => {
    const name = getGroupName();
    return GROUPS.find(g => g.name === name)?.color || 'Black';
  };
  const getGroupId = () => {
    const name = getGroupName();
    return GROUPS.find(g => g.name === name)?.id || 1;
  };
  const getNation = () => NATIONS.find(n => n.value === frontOffice);

  const handleJoin = async () => {
    if (!frontOffice || !role) return;
    setLoading(true);
    goNext();

    try {
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;
      const color = getColor();

      await setDoc(doc(db, 'users', uid), {
        id: uid,
        name: fullName,
        frontOffice,
        role,
        color,
        status: 'waiting',
        metUsers: [],
      });

      localStorage.setItem('aiesec-uid', uid);
      localStorage.setItem('aiesec-group', getGroupId().toString());
      setTimeout(() => router.push('/network'), 1500);
    } catch (error) {
      console.error('Error joining:', error);
      setErrorMsg('Failed to join. Please try again.');
      setLoading(false);
      setDirection(-1);
      setStep(3);
    }
  };

  const nation = getNation();
  const color = getColor();
  const colors = getGroupColor(color);
  const progressWidth = `${((step + 1) / 4) * 100}%`;

  const backgrounds = {
    water: 'https://images.unsplash.com/photo-1518182170546-076616fdcd81?q=80&w=1080',
    earth: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1080',
    fire: 'https://images.unsplash.com/photo-1497910091122-9f8a7746eb33?q=80&w=1080',
    air: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=1080'
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden relative">
      {/* Dynamic Realistic Background */}
      <AnimatePresence>
        {nation && (
          <motion.div
            key={nation.element}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none mix-blend-screen"
            style={{ backgroundImage: `url(${backgrounds[nation.element]})` }}
          />
        )}
      </AnimatePresence>

      <div className="z-10 w-full max-w-md mb-8">
      {/* Progress Bar */}
      {step < 4 && (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider font-avatar">
              Step {Math.min(step + 1, 4)} of 4
            </span>
            <span className="text-xs text-white/30 font-avatar">
              {step === 0 && 'Your Name'}
              {step === 1 && 'Your Nation'}
              {step === 2 && 'Your Role'}
              {step === 3 && 'Your Element'}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full"
              animate={{ width: progressWidth }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </>
      )}
      </div>

      <div className="z-10 w-full max-w-md relative" style={{ minHeight: '420px' }}>
        <AnimatePresence mode="wait" custom={direction}>

          {/* ══════════ STEP 0: Name ══════════ */}
          {step === 0 && (
            <motion.div
              key="step-name"
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20"
                >
                  <UserIcon className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-avatar tracking-wider text-white">What&apos;s your name?</h1>
                <p className="text-sm text-white/50 mt-1">Every bender needs a name</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-white/90 font-avatar">Name *</label>
                  <input
                    type="text" autoFocus required
                    placeholder="Enter your name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-lg font-avatar text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all [text-shadow:0_2px_4px_rgba(0,0,0,0.8)] drop-shadow-md"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <button
                  onClick={goNext}
                  disabled={!fullName.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-avatar text-lg tracking-widest rounded-xl h-12 flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-cyan-500/10"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════ STEP 1: Nation (Front Office) ══════════ */}
          {step === 1 && (
            <motion.div
              key="step-nation"
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full"
            >
              <div className="text-center mb-6">
                <h1 className="text-3xl font-avatar tracking-wider text-white">Choose your nation</h1>
                <p className="text-sm text-white/50 mt-1">Hi {fullName.split(' ')[0]}! Which element calls to you?</p>
              </div>

              <div className="space-y-3 mb-6">
                {NATIONS.map((n, i) => {
                  const SymbolComponent = { water: WaterSymbol, earth: EarthSymbol, fire: FireSymbol, air: AirSymbol }[n.element];
                  return (
                    <motion.button
                      key={n.value}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => setFrontOffice(n.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98] backdrop-blur-sm
                        ${frontOffice === n.value
                          ? `bg-gradient-to-r ${n.gradient} ${n.border} shadow-lg`
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                    >
                      <SymbolComponent size={40} />
                      <div className="flex-1">
                        <p className={`font-avatar text-lg ${frontOffice === n.value ? n.text : 'text-white'}`}>
                          {n.nation} <span className="text-white/40 text-sm font-sans">({n.value})</span>
                        </p>
                        <p className="text-xs text-white/40">{n.desc}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={goBack} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl h-12 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={goNext} disabled={!frontOffice} className="flex-[2] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-avatar tracking-widest rounded-xl h-12 flex items-center justify-center gap-2 transition-all disabled:opacity-30 active:scale-[0.98] shadow-lg shadow-cyan-500/10">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════ STEP 2: Role ══════════ */}
          {step === 2 && (
            <motion.div
              key="step-role"
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full"
            >
              <div className="text-center mb-6">
                <h1 className="text-3xl font-avatar tracking-wider text-white">What&apos;s your role?</h1>
                <p className="text-sm text-white/50 mt-1">Master or apprentice of {nation?.nation}?</p>
              </div>

              <div className="space-y-3 mb-6">
                {ROLES.map((r, i) => (
                  <motion.button
                    key={r.value}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setRole(r.value)}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all active:scale-[0.98] backdrop-blur-sm
                      ${role === r.value
                        ? `bg-gradient-to-r ${nation?.gradient} ${nation?.border} shadow-lg`
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                  >
                    <div>
                      <p className={`font-avatar text-lg ${role === r.value ? nation?.text : 'text-white'}`}>{r.label}</p>
                      <p className="text-sm text-white/40">{r.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={goBack} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl h-12 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={goNext} disabled={!role} className="flex-[2] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-avatar tracking-widest rounded-xl h-12 flex items-center justify-center gap-2 transition-all disabled:opacity-30 active:scale-[0.98] shadow-lg shadow-cyan-500/10">
                  Reveal My Element <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════ STEP 3: Element Reveal ══════════ */}
          {step === 3 && nation && (
            <motion.div
              key="step-reveal"
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full relative"
            >
              <ElementParticles element={nation.element} count={8} />

              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="inline-block mb-4"
                >
                  <AvatarCharacter element={nation.element} className="scale-100 mx-auto" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`text-4xl font-avatar tracking-widest ${nation.text}`}
                >
                  {nation.nation}!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-white/50 mt-1"
                >
                  {getGroupName()} · {color} bender
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`bg-gradient-to-r ${nation.gradient} backdrop-blur-md rounded-2xl border ${nation.border} p-6 mb-6`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center shadow-md`}>
                    <span className="text-lg font-black text-white">{frontOffice}</span>
                  </div>
                  <div>
                    <p className="font-bold font-avatar tracking-wider text-white">{fullName}</p>
                    <p className="text-sm text-white/50">{getGroupName()}</p>
                  </div>
                </div>
                <p className="text-sm text-white/60">
                  Remember your element — <span className={`font-bold ${nation.text}`}>{nation.nation}</span>. Other nations will seek you during the rounds!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex gap-3"
              >
                <button onClick={goBack} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl h-12 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleJoin} disabled={loading} className="flex-[2] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-avatar tracking-widest rounded-xl h-12 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-cyan-500/20">
                  <PartyPopper className="w-5 h-5" /> Enter the Arena
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ══════════ STEP 4: Joining ══════════ */}
          {step === 4 && nation && (
            <motion.div
              key="step-loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center justify-center text-center py-16"
            >
              <ElementParticles element={nation.element} count={12} />
              <AvatarCharacter element={nation.element} className="scale-100 mb-4" />
              <h2 className={`text-2xl font-avatar tracking-widest ${nation.text} mb-2`}>Entering the Arena...</h2>
              <p className="text-sm text-white/50">The elements are aligning, {fullName.split(' ')[0]}!</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {step < 4 && (
        <p className="z-10 text-center text-xs text-white/20 mt-6 font-avatar">No account needed · Anonymous & instant</p>
      )}

      {/* Error Modal Overlay */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/50 shadow-lg shadow-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-xl font-avatar font-bold text-white mb-2 tracking-wider">Join Error</h2>
              <p className="text-sm text-white/70 mb-6">{errorMsg}</p>
              <button
                onClick={() => setErrorMsg('')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-avatar tracking-widest rounded-xl h-11 flex items-center justify-center transition-all active:scale-[0.98]"
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
