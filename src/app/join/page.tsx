'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, User as UserIcon, Briefcase, Sparkles, PartyPopper, Mail } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FrontOffice, Role } from '@/types';
import { GROUPS } from '@/lib/matrix';
import { getGroupColor, GROUP_COLORS } from '@/lib/colors';

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

const FRONT_OFFICES: { value: FrontOffice; label: string; desc: string }[] = [
  { value: 'iGT', label: 'iGT', desc: 'Incoming Global Talent' },
  { value: 'iGV', label: 'iGV', desc: 'Incoming Global Volunteer' },
  { value: 'oGT', label: 'oGT', desc: 'Outgoing Global Talent' },
  { value: 'oGV', label: 'oGV', desc: 'Outgoing Global Volunteer' },
];

const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: 'LB', label: 'Leadership Body', desc: 'VP, Director, Manager' },
  { value: 'Member', label: 'Member', desc: 'Team Member' },
];

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0=name, 1=function, 2=role, 3=reveal, 4=loading
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [frontOffice, setFrontOffice] = useState<FrontOffice | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');

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

  const handleJoin = async () => {
    if (!frontOffice || !role) return;
    setLoading(true);
    goNext(); // Go to step 4 (loading)

    try {
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;
      const color = getColor();
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

      await setDoc(doc(db, 'users', uid), {
        id: uid,
        name: fullName,
        frontOffice,
        role,
        color,
        status: 'waiting',
        email,
        metUsers: [],
      });

      localStorage.setItem('aiesec-uid', uid);
      localStorage.setItem('aiesec-group', getGroupId().toString());

      // Small delay for the animation to feel intentional
      setTimeout(() => router.push('/network'), 1500);
    } catch (error) {
      console.error('Error joining:', error);
      alert('Failed to join. Please try again.');
      setLoading(false);
      setDirection(-1);
      setStep(3);
    }
  };

  const color = getColor();
  const colors = getGroupColor(color);

  // Progress bar width
  const progressWidth = `${((step + 1) / 4) * 100}%`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-transparent overflow-hidden">
      {/* Progress Bar */}
      {step < 4 && (
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Step {Math.min(step + 1, 4)} of 4
            </span>
            <span className="text-xs text-zinc-400">
              {step === 0 && 'Your Name'}
              {step === 1 && 'Your Function'}
              {step === 2 && 'Your Role'}
              {step === 3 && 'Your Color'}
            </span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="bg-zinc-900 h-1.5 rounded-full"
              animate={{ width: progressWidth }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>
      )}

      {/* Step Container */}
      <div className="w-full max-w-md relative" style={{ minHeight: '380px' }}>
        <AnimatePresence mode="wait" custom={direction}>

          {/* ══════════ STEP 0: Name ══════════ */}
          {step === 0 && (
            <motion.div
              key="step-name"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900 flex items-center justify-center mb-4"
                >
                  <UserIcon className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-zinc-900">What's your name?</h1>
                <p className="text-sm text-zinc-500 mt-1">Let's start with introductions</p>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">First Name *</label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Enter your first name"
                      className="w-full bg-white border border-zinc-200 rounded-xl h-11 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">Last Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your last name"
                      className="w-full bg-white border border-zinc-200 rounded-xl h-11 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">
                    Middle Name <span className="text-zinc-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your middle name"
                    className="w-full bg-white border border-zinc-200 rounded-xl h-11 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">
                    Email <span className="text-zinc-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full bg-white border border-zinc-200 rounded-xl h-11 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={goNext}
                  disabled={!firstName.trim() || !lastName.trim()}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl h-12 flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] mt-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════ STEP 1: Front Office ══════════ */}
          {step === 1 && (
            <motion.div
              key="step-fo"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900 flex items-center justify-center mb-4"
                >
                  <Briefcase className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-zinc-900">Choose your function</h1>
                <p className="text-sm text-zinc-500 mt-1">Hi {firstName}! Which front office are you in?</p>
              </div>

              <div className="space-y-3 mb-6">
                {FRONT_OFFICES.map((fo, i) => (
                  <motion.button
                    key={fo.value}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setFrontOffice(fo.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98]
                      ${frontOffice === fo.value
                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
                        : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black
                      ${frontOffice === fo.value ? 'bg-white text-zinc-900' : 'bg-zinc-100 text-zinc-600'}`}>
                      {fo.label}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{fo.label}</p>
                      <p className={`text-xs ${frontOffice === fo.value ? 'text-white/70' : 'text-zinc-400'}`}>{fo.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-xl h-12 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={goNext}
                  disabled={!frontOffice}
                  className="flex-[2] bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl h-12 flex items-center justify-center gap-2 transition-all disabled:opacity-30 active:scale-[0.98]"
                >
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
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900 flex items-center justify-center mb-4"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-zinc-900">What's your role?</h1>
                <p className="text-sm text-zinc-500 mt-1">Almost there! Select your position in {frontOffice}</p>
              </div>

              <div className="space-y-3 mb-6">
                {ROLES.map((r, i) => (
                  <motion.button
                    key={r.value}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setRole(r.value)}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all active:scale-[0.98]
                      ${role === r.value
                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
                        : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300'
                      }`}
                  >
                    <div>
                      <p className="font-bold">{r.label}</p>
                      <p className={`text-sm ${role === r.value ? 'text-white/70' : 'text-zinc-400'}`}>{r.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-xl h-12 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={goNext}
                  disabled={!role}
                  className="flex-[2] bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl h-12 flex items-center justify-center gap-2 transition-all disabled:opacity-30 active:scale-[0.98]"
                >
                  See My Color <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════ STEP 3: Color Reveal ══════════ */}
          {step === 3 && (
            <motion.div
              key="step-reveal"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5 ${colors.bg} shadow-xl`}
                >
                  <PartyPopper className={`w-10 h-10 ${color === 'Black' || color === 'Blue' || color === 'Red' || color === 'Purple' || color === 'Green' || color === 'Orange' ? 'text-white' : 'text-zinc-900'}`} />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-zinc-900"
                >
                  You're {color}!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-zinc-500 mt-1"
                >
                  Your group is {getGroupName()}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 mb-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center shadow-md`}>
                    <span className={`text-lg font-black ${color === 'Yellow' || color === 'White' ? 'text-zinc-900' : 'text-white'}`}>
                      {frontOffice}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">{firstName} {lastName}</p>
                    <p className="text-sm text-zinc-500">{getGroupName()}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${colors.badge}`}>
                  <p className="text-sm font-medium">
                    Remember your color — <span className="font-bold">{color}</span>. Other groups will be looking for you during the networking rounds!
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex gap-3"
              >
                <button
                  onClick={goBack}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-xl h-12 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="flex-[2] bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl h-12 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98] shadow-sm"
                >
                  Join Session <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ══════════ STEP 4: Joining Animation ══════════ */}
          {step === 4 && (
            <motion.div
              key="step-loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center justify-center text-center py-16"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`w-20 h-20 rounded-full ${colors.bg} flex items-center justify-center mb-6 shadow-xl`}
              >
                <span className={`text-2xl font-black ${color === 'Yellow' || color === 'White' ? 'text-zinc-900' : 'text-white'}`}>
                  {frontOffice}
                </span>
              </motion.div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">Joining the session...</h2>
              <p className="text-sm text-zinc-500">Hang on, {firstName}!</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer */}
      {step < 4 && (
        <p className="text-center text-xs text-zinc-400 mt-6">
          No account needed · Instant anonymous access
        </p>
      )}
    </div>
  );
}
