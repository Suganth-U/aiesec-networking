'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, collection, getDoc, deleteDoc } from 'firebase/firestore';
import { Session, User } from '@/types';
import { Play, Pause, Plus, Minus, ArrowRight, ArrowLeft, Users, Clock, Zap, MessageSquare, Trash2, Lock, Eye, EyeOff, KeyRound, Shield, LogOut, Pencil, Check, X, AlertTriangle } from 'lucide-react';
import { GROUPS } from '@/lib/matrix';
import { getGroupColor } from '@/lib/colors';

const DEFAULT_PASSWORD = 'admin123';

export default function AdminPage() {
  // ── Auth State ──
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [storedPassword, setStoredPassword] = useState<string | null>(null);

  // ── Change Password State ──
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPwInput, setCurrentPwInput] = useState('');
  const [newPwInput, setNewPwInput] = useState('');
  const [confirmPwInput, setConfirmPwInput] = useState('');
  const [changePwError, setChangePwError] = useState('');
  const [changePwSuccess, setChangePwSuccess] = useState('');

  // ── App State ──
  const [session, setSession] = useState<Session | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // ── Confirm Modal State ──
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    isDangerous: false,
    onConfirm: () => {}
  });

  // ── Load/Initialize admin password from Firestore ──
  useEffect(() => {
    const initPassword = async () => {
      const configRef = doc(db, 'config', 'admin');
      const snap = await getDoc(configRef);
      if (snap.exists()) {
        setStoredPassword(snap.data().password);
      } else {
        // First time — set default password
        await setDoc(configRef, { password: DEFAULT_PASSWORD });
        setStoredPassword(DEFAULT_PASSWORD);
      }
    };
    initPassword();
  }, []);

  // ── Check if already logged in this browser session ──
  useEffect(() => {
    const saved = sessionStorage.getItem('admin-auth');
    if (saved === 'true') setIsAuthenticated(true);
  }, []);

  // ── Login Handler ──
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (passwordInput === storedPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin-auth', 'true');
    } else {
      setLoginError('Incorrect password. Try again.');
    }
    setPasswordInput('');
  };

  // ── Logout ──
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin-auth');
  };

  // ── Change Password Handler ──
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwError('');
    setChangePwSuccess('');

    if (currentPwInput !== storedPassword) {
      setChangePwError('Current password is incorrect.');
      return;
    }
    if (newPwInput.length < 4) {
      setChangePwError('New password must be at least 4 characters.');
      return;
    }
    if (newPwInput !== confirmPwInput) {
      setChangePwError('New passwords do not match.');
      return;
    }
    if (newPwInput === currentPwInput) {
      setChangePwError('New password must be different from current.');
      return;
    }

    try {
      await updateDoc(doc(db, 'config', 'admin'), { password: newPwInput });
      setStoredPassword(newPwInput);
      setChangePwSuccess('Password changed successfully!');
      setCurrentPwInput('');
      setNewPwInput('');
      setConfirmPwInput('');
      setTimeout(() => {
        setShowChangePassword(false);
        setChangePwSuccess('');
      }, 2000);
    } catch {
      setChangePwError('Failed to update password. Try again.');
    }
  };

  // ── Firestore Listeners (only when authenticated) ──
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubSession = onSnapshot(doc(db, 'sessions', 'main-event'), (snap) => {
      if (snap.exists()) {
        setSession(snap.data() as Session);
      } else {
        setDoc(doc(db, 'sessions', 'main-event'), {
          status: 'waiting',
          currentRound: 0,
          timeRemaining: 300,
          isPaused: false,
          questions: [
            'Why did you join AIESEC?',
            "What's something people don't know about you?",
            "What's your biggest goal this year?"
          ]
        });
      }
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(d => d.data() as User));
    });

    return () => { unsubSession(); unsubUsers(); };
  }, [isAuthenticated]);

  // Timer Tick
  useEffect(() => {
    if (!session || session.status !== 'active' || session.timeRemaining <= 0 || session.isPaused) return;
    const timer = setInterval(() => {
      updateDoc(doc(db, 'sessions', 'main-event'), {
        timeRemaining: session.timeRemaining - 1
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [session]);

  const updateSession = async (updates: Partial<Session>) => {
    await updateDoc(doc(db, 'sessions', 'main-event'), updates);
  };

  const nextRound = async () => {
    if (!session) return;
    const nextRnd = Math.min(session.currentRound + 1, 3);
    await updateSession({ currentRound: nextRnd, timeRemaining: 300, status: 'active' });
    users.forEach((u) => {
      updateDoc(doc(db, 'users', u.id), { status: 'waiting' });
    });
  };

  const prevRound = async () => {
    if (!session) return;
    const prevRnd = Math.max(session.currentRound - 1, 0);
    await updateSession({ currentRound: prevRnd, timeRemaining: 300, status: 'active' });
    users.forEach((u) => {
      updateDoc(doc(db, 'users', u.id), { status: 'waiting' });
    });
  };

  const resetSession = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Reset Session',
      message: 'Are you sure you want to reset the entire session? This will restart the event to Round 1.',
      isDangerous: true,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        await updateSession({ currentRound: 0, timeRemaining: 300, status: 'waiting', isPaused: false });
        users.forEach((u) => {
          updateDoc(doc(db, 'users', u.id), { status: 'waiting', metUsers: [] });
        });
      }
    });
  };

  const clearAllParticipants = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Clear All Participants',
      message: '🚨 WARNING: This will permanently delete ALL registered participants. Use this ONLY when starting a brand new game/event. Are you sure?',
      isDangerous: true,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        // Delete all user documents
        for (const u of users) {
          await deleteDoc(doc(db, 'users', u.id));
        }
        
        // Reset session back to waiting
        await updateSession({ currentRound: 0, timeRemaining: 300, status: 'waiting', isPaused: false });
      }
    });
  };

  const startSession = async () => {
    await updateSession({ status: 'active', currentRound: 0, timeRemaining: 300, isPaused: false });
  };

  const addQuestion = async () => {
    if (!session || !newQuestion.trim()) return;
    await updateSession({ questions: [...session.questions, newQuestion.trim()] });
    setNewQuestion('');
  };

  const removeQuestion = (index: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Question',
      message: 'Are you sure you want to delete this discussion prompt?',
      isDangerous: true,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        if (!session) return;
        await updateSession({ questions: session.questions.filter((_, i) => i !== index) });
      }
    });
  };

  const saveEditQuestion = (index: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Save Changes',
      message: 'Are you sure you want to save the edits to this discussion prompt?',
      isDangerous: false,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        if (!session || !editValue.trim()) return;
        const newQuestions = [...session.questions];
        newQuestions[index] = editValue.trim();
        await updateSession({ questions: newQuestions });
        setEditingIndex(null);
      }
    });
  };

  // ══════════════════════════════════════
  // LOGIN SCREEN
  // ══════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-white text-zinc-900">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-900 flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900">Admin Access</h1>
            <p className="text-sm text-zinc-500 mt-1">Enter password to continue</p>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Enter admin password"
                    className="w-full bg-white border border-zinc-200 rounded-xl h-11 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    value={passwordInput}
                    onChange={(e) => { setPasswordInput(e.target.value); setLoginError(''); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-red-500 font-medium">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={!passwordInput}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl h-11 transition-all disabled:opacity-40 active:scale-[0.98]"
              >
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════
  // CHANGE PASSWORD MODAL
  // ══════════════════════════════════════
  const changePasswordModal = showChangePassword && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200 shadow-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Change Password</h2>
            <p className="text-xs text-zinc-500">Enter current password to verify</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Current Password</label>
            <input
              type="password"
              required
              placeholder="Enter current password"
              className="w-full bg-white border border-zinc-200 rounded-xl h-10 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              value={currentPwInput}
              onChange={(e) => { setCurrentPwInput(e.target.value); setChangePwError(''); }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">New Password</label>
            <input
              type="password"
              required
              placeholder="Enter new password"
              className="w-full bg-white border border-zinc-200 rounded-xl h-10 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              value={newPwInput}
              onChange={(e) => { setNewPwInput(e.target.value); setChangePwError(''); }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="Re-enter new password"
              className="w-full bg-white border border-zinc-200 rounded-xl h-10 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              value={confirmPwInput}
              onChange={(e) => { setConfirmPwInput(e.target.value); setChangePwError(''); }}
            />
          </div>

          {changePwError && <p className="text-xs text-red-500 font-medium">{changePwError}</p>}
          {changePwSuccess && <p className="text-xs text-emerald-600 font-medium">{changePwSuccess}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setShowChangePassword(false); setChangePwError(''); setCurrentPwInput(''); setNewPwInput(''); setConfirmPwInput(''); }}
              className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-xl h-10 text-sm transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl h-10 text-sm transition-all active:scale-[0.98]"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ══════════════════════════════════════
  // CONFIRM MODAL
  // ══════════════════════════════════════
  const confirmModal = confirmConfig.isOpen && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Top colored accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${confirmConfig.isDangerous ? 'bg-red-500' : 'bg-emerald-500'}`} />
        
        <div className="flex gap-4 mb-6 mt-1">
          <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${confirmConfig.isDangerous ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="pt-1">
            <h3 className="text-lg font-bold text-zinc-900">{confirmConfig.title}</h3>
            <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
              {confirmConfig.message}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmConfig.onConfirm}
            className={`px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-sm active:scale-95 ${
              confirmConfig.isDangerous 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' 
                : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  // Loading
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-zinc-900">
        <div className="w-6 h-6 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin" />
      </div>
    );
  }

  const usersByGroup = GROUPS.map(g => ({
    ...g,
    count: users.filter(u => u.frontOffice === g.name.split(' - ')[0] && u.role === g.name.split(' - ')[1]).length
  }));

  const finishedCount = users.filter(u => u.status === 'finished_round').length;
  const progressPercent = users.length ? (finishedCount / users.length) * 100 : 0;

  const minutes = Math.floor(session.timeRemaining / 60);
  const seconds = session.timeRemaining % 60;

  // ══════════════════════════════════════
  // ADMIN DASHBOARD
  // ══════════════════════════════════════
  return (
    <div className="flex-1 bg-white text-zinc-900 p-4 sm:p-8">
      {changePasswordModal}
      {confirmModal}

      <div className="max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Event Control</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Manage rounds, timers, and participants</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${session.status === 'active' ? 'bg-emerald-500 animate-pulse' : session.status === 'waiting' ? 'bg-amber-400' : 'bg-zinc-300'}`} />
              <span className="text-sm font-medium text-zinc-600 capitalize">{session.status}</span>
            </div>
            <div className="h-5 w-px bg-zinc-200" />
            <button
              onClick={() => setShowChangePassword(true)}
              className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:bg-white/5 backdrop-blur-md transition-all"
              title="Change Password"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column: Controls ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Status & Timer Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-6">
                {/* Status Buttons */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Session Status</span>
                  <div className="flex gap-1.5">
                    {(['waiting', 'active', 'finished'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateSession({ status: s })}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize
                          ${session.status === s
                            ? s === 'active' ? 'bg-emerald-500 text-white' : s === 'waiting' ? 'bg-amber-400 text-amber-900' : 'bg-zinc-900 text-white'
                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timer Display */}
                <div className="flex items-center gap-6 p-5 bg-white/5 backdrop-blur-md rounded-xl border border-zinc-100 mb-6">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Time Remaining</p>
                    <span className="text-5xl font-bold font-mono text-zinc-900 tracking-tight">
                      {minutes}:{seconds.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => updateSession({ timeRemaining: session.timeRemaining + 30 })}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-white/5 backdrop-blur-md transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> 30s
                    </button>
                    <button
                      onClick={() => updateSession({ timeRemaining: Math.max(0, session.timeRemaining - 30) })}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-white/5 backdrop-blur-md transition-all active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" /> 30s
                    </button>
                    <button
                      onClick={() => updateSession({ isPaused: !session.isPaused })}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${session.isPaused ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-white/5 backdrop-blur-md'}`}
                    >
                      {session.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      {session.isPaused ? 'Play' : 'Pause'}
                    </button>
                  </div>
                </div>

                {/* Round & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Current Round</p>
                    <p className="text-3xl font-bold text-zinc-900">{session.currentRound + 1} <span className="text-lg text-zinc-300">/ 4</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={resetSession} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition-all active:scale-[0.98]">
                      Reset
                    </button>
                    {session.status === 'waiting' && (
                      <button onClick={startSession} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all active:scale-[0.98] shadow-sm">
                        <Zap className="w-4 h-4" /> Start
                      </button>
                    )}
                    <button onClick={prevRound} disabled={session.currentRound === 0} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50">
                      <ArrowLeft className="w-4 h-4" /> Prev
                    </button>
                    <button onClick={nextRound} disabled={session.currentRound >= 3} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold transition-all active:scale-[0.98] shadow-sm disabled:opacity-50">
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Icebreaker Questions Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-900">Discussion Questions</h2>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                  placeholder="Type a new discussion question..."
                  className="flex-1 bg-white border border-zinc-200 rounded-xl h-10 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
                <button
                  onClick={addQuestion}
                  disabled={!newQuestion.trim()}
                  className="px-4 h-10 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-all disabled:opacity-30 active:scale-95"
                >
                  Add
                </button>
              </div>

              <ul className="space-y-2">
                {session.questions.map((q, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 p-3 bg-white/5 backdrop-blur-md rounded-xl border border-zinc-100 group min-h-[52px]">
                    {editingIndex === i ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditQuestion(i);
                            if (e.key === 'Escape') setEditingIndex(null);
                          }}
                          autoFocus
                          className="flex-1 bg-white border border-zinc-200 rounded-lg h-8 px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                        />
                        <button
                          onClick={() => saveEditQuestion(i)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm text-zinc-700 leading-relaxed">{q}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          <button
                            onClick={() => {
                              setEditingIndex(i);
                              setEditValue(q);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Edit question"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeQuestion(i)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Delete question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Right Column: Stats ── */}
          <div className="space-y-6">

            {/* Attendance Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-sm font-semibold text-zinc-900">Attendance</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={clearAllParticipants}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all active:scale-95"
                    title="Delete all users and start a fresh game"
                  >
                    Clear All
                  </button>
                  <span className="text-2xl font-bold text-zinc-900">{users.length}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {usersByGroup.map((g) => {
                  const colors = getGroupColor(g.color);
                  return (
                    <div key={g.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-zinc-100">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                        <span className="text-xs font-semibold text-zinc-700">{g.name}</span>
                      </div>
                      <span className="text-sm font-bold text-zinc-900 font-mono">{g.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Round Progress Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-900">Round Progress</h2>
              </div>

              <div className="flex items-end justify-between mb-2">
                <span className="text-xs text-zinc-500">Finished networking</span>
                <span className="text-sm font-bold text-zinc-900">{finishedCount}/{users.length}</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                {progressPercent === 100 ? 'All participants done!' : `${Math.round(progressPercent)}% complete`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
