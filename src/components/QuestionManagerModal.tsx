import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, Check, X, MessageSquare, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartRound: (questions: string[]) => void;
  initialQuestions: string[];
  roundIndex: number;
}

export default function QuestionManagerModal({ isOpen, onClose, onStartRound, initialQuestions, roundIndex }: Props) {
  const [questions, setQuestions] = useState<string[]>(initialQuestions);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // Sync state when opened
  useEffect(() => {
    if (isOpen) setQuestions(initialQuestions);
  }, [isOpen, initialQuestions]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newQuestion.trim()) return;
    setQuestions([...questions, newQuestion.trim()]);
    setNewQuestion('');
  };

  const handleDelete = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleStartEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditValue(questions[idx]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editValue.trim()) return;
    const updated = [...questions];
    updated[editingIndex] = editValue.trim();
    setQuestions(updated);
    setEditingIndex(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              Round {roundIndex + 1} Questions
            </h2>
            <p className="text-sm text-zinc-500 mt-1">Review or edit the discussion prompts before starting the round.</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-zinc-50/50">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Add a new question..."
              className="flex-1 bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <button
              onClick={handleAdd}
              disabled={!newQuestion.trim()}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={idx} className="flex items-start justify-between gap-4 p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
                {editingIndex === idx ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      className="flex-1 bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <button onClick={handleSaveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingIndex(null)} className="p-1.5 text-zinc-400 hover:bg-zinc-100 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-zinc-700 leading-relaxed flex-1 pt-0.5">{q}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleStartEdit(idx)} className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(idx)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {questions.length === 0 && (
              <p className="text-center text-sm text-zinc-500 py-8">No questions for this round.</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-200 flex justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all">
            Cancel
          </button>
          <button 
            onClick={() => onStartRound(questions)}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Zap className="w-4 h-4" /> Start Round {roundIndex + 1}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
