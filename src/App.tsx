import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, 
  Trophy, 
  Play, 
  Info, 
  RefreshCw, 
  ChevronRight,
  BarChart3,
  Brain,
  Activity,
  LogOut,
  AlertTriangle,
  Hash,
  Type as TypeIcon,
  Zap,
  User as UserIcon,
  Lock,
  Mail,
  UserPlus,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { TestStatus, Question, RoundResult, QuestionType, User } from './types.ts';
import { ROUND_TIME, PREPARATION_TIME, TOTAL_ROUNDS, CHARACTER_POOLS, OPTIONS_MAPPING, MAX_QUESTIONS_PER_ROUND } from './constants.ts';

// Admin Dashboard Component
function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', isActive: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Gagal mengambil data user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${id}/activate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      setError('Gagal mengubah status');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error('Gagal menambah user');
      setNewUser({ name: '', email: '', password: '', role: 'user', isActive: false });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    try {
      await fetch('/api/users/' + id, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      setError('Gagal menghapus user');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-4xl space-y-8"
    >
      <div className="flex justify-between items-center border-b border-[#141414] pb-4">
        <div>
          <h2 className="text-3xl font-serif italic font-black">ADMIN DASHBOARD.</h2>
          <p className="opacity-60 text-sm uppercase tracking-widest font-bold">Kelola Akses Pengguna</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-[#141414] text-[#E4E3E0] px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-transform"
        >
          KEMBALI KE BERANDA
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Add User Form */}
      <div className="bg-white border border-[#141414] p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Play className="w-4 h-4 fill-current" /> TAMBAH USER BARU
        </h3>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input 
            type="text" 
            placeholder="Nama Lengkap" 
            value={newUser.name}
            onChange={e => setNewUser({...newUser, name: e.target.value})}
            className="border border-[#141414] p-2 rounded-lg text-sm"
            required
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={newUser.email}
            onChange={e => setNewUser({...newUser, email: e.target.value})}
            className="border border-[#141414] p-2 rounded-lg text-sm"
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={newUser.password}
            onChange={e => setNewUser({...newUser, password: e.target.value})}
            className="border border-[#141414] p-2 rounded-lg text-sm"
            required
          />
          <select 
            value={newUser.role}
            onChange={e => setNewUser({...newUser, role: e.target.value as any})}
            className="border border-[#141414] p-2 rounded-lg text-sm"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select 
            value={newUser.isActive ? 'true' : 'false'}
            onChange={e => setNewUser({...newUser, isActive: e.target.value === 'true'})}
            className="border border-[#141414] p-2 rounded-lg text-sm"
          >
            <option value="false">Non-Aktif</option>
            <option value="true">Aktif</option>
          </select>
          <button type="submit" className="bg-[#141414] text-[#E4E3E0] font-bold rounded-lg hover:bg-black transition-colors">
            SIMPAN
          </button>
        </form>
      </div>

      {/* User List */}
      <div className="bg-white border border-[#141414] rounded-2xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#141414] text-[#E4E3E0] text-xs uppercase tracking-widest">
            <tr>
              <th className="p-4">Nama</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Dibuat Pada</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center opacity-50">Memuat data...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center opacity-50">Belum ada user.</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="border-b border-[#141414]/10 hover:bg-[#E4E3E0]/30 transition-colors">
                <td className="p-4 font-bold">{user.name}</td>
                <td className="p-4 opacity-70">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${user.role === 'admin' ? 'bg-yellow-400 text-black' : 'bg-blue-100 text-blue-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                    className={`px-2 py-1 rounded text-[10px] font-black uppercase transition-colors ${user.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                  >
                    {user.isActive ? 'AKTIF' : 'NON-AKTIF'}
                  </button>
                </td>
                <td className="p-4 text-xs opacity-50">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-800 font-bold text-xs"
                  >
                    HAPUS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// Login Component
function Login({ onLogin, onSwitchToRegister }: { onLogin: (user: User) => void, onSwitchToRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login gagal');
      onLogin(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white border-2 border-[#141414] p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif italic font-black">MASUK.</h2>
        <p className="text-sm opacity-60">Selamat datang kembali di Casis Gacor</p>
      </div>

      {error && <div className="bg-red-100 text-red-600 p-3 rounded-xl text-xs font-bold">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#141414] rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="nama@email.com"
              required
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#141414] rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#141414] text-[#E4E3E0] py-4 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
        >
          {loading ? 'MEMPROSES...' : 'MASUK SEKARANG'}
        </button>
      </form>

      <div className="text-center">
        <button onClick={onSwitchToRegister} className="text-xs font-bold hover:underline">
          Belum punya akun? Daftar di sini
        </button>
      </div>
    </motion.div>
  );
}

// Register Component
function Register({ onRegister, onSwitchToLogin }: { onRegister: (user: User) => void, onSwitchToLogin: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registrasi gagal');
      onRegister(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white border-2 border-[#141414] p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif italic font-black">DAFTAR.</h2>
        <p className="text-sm opacity-60">Mulai perjalanan seleksi Anda hari ini</p>
      </div>

      {error && <div className="bg-red-100 text-red-600 p-3 rounded-xl text-xs font-bold">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 ml-1">Nama Lengkap</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#141414] rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="Budi Santoso"
              required
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#141414] rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="nama@email.com"
              required
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#141414] rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#141414] text-[#E4E3E0] py-4 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
        >
          {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
        </button>
      </form>

      <div className="text-center">
        <button onClick={onSwitchToLogin} className="text-xs font-bold hover:underline">
          Sudah punya akun? Masuk di sini
        </button>
      </div>
    </motion.div>
  );
}

// Pricing Component
function Pricing({ user }: { user: User }) {
  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent(`Halo saya mau daftar Casis Gacor\n\nDetail Akun:\nNama: ${user.name}\nEmail: ${user.email}`);
    window.open(`https://wa.me/6285158380411?text=${message}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-serif italic font-black leading-tight">AKSES <br /> PREMIUM.</h2>
          <p className="text-lg opacity-60">Buka seluruh fitur Casis Gacor dan mulai latihan intensif Anda sekarang.</p>
        </div>
        
        <div className="space-y-4">
          {[
            'Akses Tak Terbatas ke Semua Jenis Soal',
            'Simulasi Standar CAT POLRI Terbaru',
            'Statistik Performa Mendalam',
            'Update Soal Secara Berkala',
            'Bebas Iklan & Gangguan'
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="font-bold text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded-r-xl">
          <p className="text-xs font-bold text-yellow-800">
            *Setelah melakukan pembayaran, Admin akan mengaktifkan akun Anda secara manual. Silakan hubungi kami melalui WhatsApp.
          </p>
        </div>
      </div>

      <div className="bg-white border-4 border-[#141414] p-8 rounded-[40px] shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-yellow-400 px-6 py-2 font-black text-xs uppercase tracking-widest border-b-4 border-l-4 border-[#141414]">
          Best Value
        </div>
        
        <div className="space-y-1">
          <span className="text-xs font-black opacity-40 uppercase tracking-widest">Sekali Bayar</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">Rp</span>
            <span className="text-6xl font-black font-serif italic">49</span>
            <span className="text-2xl font-bold">.000</span>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleWhatsAppRedirect}
            className="w-full bg-[#141414] text-[#E4E3E0] py-5 rounded-2xl font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3"
          >
            <CreditCard className="w-6 h-6" />
            HUBUNGI ADMIN (WA)
          </button>
          <p className="text-[10px] text-center opacity-40 font-bold uppercase tracking-widest">
            Konfirmasi Pembayaran via WhatsApp
          </p>
        </div>

        <div className="pt-6 border-t-2 border-[#141414]/10">
          <div className="flex items-center gap-4 opacity-60">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img src={`https://picsum.photos/seed/${i+10}/32/32`} alt="user" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight">Bergabung dengan 1,200+ Casis lainnya</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [view, setView] = useState<'TEST' | 'ADMIN' | 'LOGIN' | 'REGISTER' | 'PRICING'>('LOGIN');
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<TestStatus>(TestStatus.IDLE);
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.NUMBERS);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [prepTimeLeft, setPrepTimeLeft] = useState(PREPARATION_TIME);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentMasterSet, setCurrentMasterSet] = useState<string[] | null>(null);
  const [questionsAnsweredInRound, setQuestionsAnsweredInRound] = useState(0);
  const [isConfirmingQuit, setIsConfirmingQuit] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef({ correct: 0, incorrect: 0 });

  // Sync scoreRef with score state
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const generateQuestion = useCallback((masterSetOverride?: string[]) => {
    const masterSet = masterSetOverride || currentMasterSet;
    if (!masterSet) return;

    const missingIndex = Math.floor(Math.random() * masterSet.length);
    const correctAnswer = masterSet[missingIndex];
    const questionSet = masterSet.filter((_, i) => i !== missingIndex);
    
    // Shuffle question set
    for (let i = questionSet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionSet[i], questionSet[j]] = [questionSet[j], questionSet[i]];
    }

    setCurrentQuestion({
      masterSet,
      questionSet,
      correctAnswer
    });
  }, [currentMasterSet]);

  const startTest = () => {
    setScore({ correct: 0, incorrect: 0 });
    setRoundResults([]);
    setCurrentRound(0);
    setQuestionsAnsweredInRound(0);
    setStatus(TestStatus.INSTRUCTIONS);
  };

  const startPreparation = useCallback((roundIdx: number) => {
    setCurrentRound(roundIdx);
    setPrepTimeLeft(PREPARATION_TIME);
    setQuestionsAnsweredInRound(0);

    // Generate fixed master set for this round
    const pool = CHARACTER_POOLS[questionType];
    const newMasterSet: string[] = [];
    const available = [...pool];
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * available.length);
      newMasterSet.push(available.splice(idx, 1)[0]);
    }
    setCurrentMasterSet(newMasterSet);
    
    setStatus(TestStatus.PREPARATION);
  }, [questionType]);

  const startRound = useCallback(() => {
    setTimeLeft(ROUND_TIME);
    setStatus(TestStatus.RUNNING);
    if (currentMasterSet) {
      generateQuestion(currentMasterSet);
    }
  }, [generateQuestion, currentMasterSet]);

  const finishRound = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const prevCorrect = roundResults.reduce((acc, r) => acc + r.correct, 0);
    const prevIncorrect = roundResults.reduce((acc, r) => acc + r.incorrect, 0);
    const prevTotal = roundResults.reduce((acc, r) => acc + r.total, 0);

    const newResult: RoundResult = {
      roundNumber: currentRound + 1,
      correct: scoreRef.current.correct - prevCorrect,
      incorrect: scoreRef.current.incorrect - prevIncorrect,
      total: (scoreRef.current.correct + scoreRef.current.incorrect) - prevTotal
    };

    setRoundResults(prev => {
      const updated = [...prev, newResult];
      
      if (currentRound + 1 < TOTAL_ROUNDS) {
        startPreparation(currentRound + 1);
      } else {
        setStatus(TestStatus.FINISHED);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      return updated;
    });
  }, [currentRound, roundResults, startPreparation]);

  // Main Test Timer
  useEffect(() => {
    if (status === TestStatus.RUNNING) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, finishRound]);

  // Preparation Timer
  useEffect(() => {
    if (status === TestStatus.PREPARATION) {
      prepTimerRef.current = setInterval(() => {
        setPrepTimeLeft(prev => {
          if (prev <= 1) {
            startRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, [status, startRound]);

  const handleAnswer = (answer: string) => {
    if (status !== TestStatus.RUNNING || !currentQuestion) return;

    const isCorrect = answer === currentQuestion.correctAnswer;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));
    
    const nextCount = questionsAnsweredInRound + 1;
    setQuestionsAnsweredInRound(nextCount);

    if (nextCount >= MAX_QUESTIONS_PER_ROUND) {
      finishRound();
    } else {
      generateQuestion();
    }
  };

  const quitTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);

    // If quitting during a running round, save the partial results for that round
    if (status === TestStatus.RUNNING) {
      const prevCorrect = roundResults.reduce((acc, r) => acc + r.correct, 0);
      const prevIncorrect = roundResults.reduce((acc, r) => acc + r.incorrect, 0);
      const prevTotal = roundResults.reduce((acc, r) => acc + r.total, 0);

      const currentRoundResult: RoundResult = {
        roundNumber: currentRound + 1,
        correct: scoreRef.current.correct - prevCorrect,
        incorrect: scoreRef.current.incorrect - prevIncorrect,
        total: (scoreRef.current.correct + scoreRef.current.incorrect) - prevTotal
      };
      setRoundResults(prev => [...prev, currentRoundResult]);
    }

    setStatus(TestStatus.FINISHED);
    setIsConfirmingQuit(false);
    
    // Trigger confetti for completion (even if early)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== TestStatus.RUNNING || isConfirmingQuit) return;
      
      const key = e.key.toUpperCase();
      const index = OPTIONS_MAPPING.indexOf(key);
      
      if (index !== -1 && currentQuestion) {
        handleAnswer(currentQuestion.masterSet[index]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, currentQuestion, isConfirmingQuit]);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          <h1 className="font-serif italic text-xl font-bold tracking-tight">Casis Gacor</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user && status === TestStatus.IDLE && (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Halo,</span>
                <span className="text-xs font-bold">{user.name}</span>
              </div>
              {user.role === 'admin' && (
                <button 
                  onClick={() => setView(view === 'TEST' ? 'ADMIN' : 'TEST')}
                  className="flex items-center gap-2 border border-[#141414] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
                >
                  <Activity className="w-3 h-3" />
                  {view === 'TEST' ? 'ADMIN PANEL' : 'TEST PANEL'}
                </button>
              )}
              <button 
                onClick={() => setIsConfirmingLogout(true)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {status === TestStatus.RUNNING && (
            <div className="flex items-center gap-6">
              <div className={`flex flex-col items-end ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : ''}`}>
                <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Time Left</span>
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span className="font-mono font-bold text-xl">{timeLeft}s</span>
                </div>
              </div>
              <button 
                onClick={() => setIsConfirmingQuit(true)}
                className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                AKHIRI TES
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {view === 'LOGIN' ? (
            <Login onLogin={(u) => { 
              setUser(u); 
              if (u.role === 'admin' || u.isActive) {
                setView('TEST');
              } else {
                setView('PRICING');
              }
            }} onSwitchToRegister={() => setView('REGISTER')} />
          ) : view === 'REGISTER' ? (
            <Register onRegister={(u) => { setUser(u); setView('PRICING'); }} onSwitchToLogin={() => setView('LOGIN')} />
          ) : view === 'PRICING' ? (
            user && <Pricing user={user} />
          ) : view === 'ADMIN' ? (
            <AdminDashboard onBack={() => setView('TEST')} />
          ) : (
            <>
              {/* IDLE STATE */}
              {status === TestStatus.IDLE && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-12 w-full max-w-2xl"
            >
              <div className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-serif italic font-black leading-none">
                  SIAP <br /> SELEKSI.
                </h2>
                <p className="text-lg opacity-70 max-w-md mx-auto">
                  Pilih jenis soal dan latih ketajaman mata Anda dengan simulasi standar POLRI.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: QuestionType.NUMBERS, label: 'Angka', icon: Hash, desc: '0 - 9' },
                  { id: QuestionType.LETTERS, label: 'Huruf', icon: TypeIcon, desc: 'A - Z' },
                  { id: QuestionType.SYMBOLS, label: 'Simbol', icon: Zap, desc: '! @ # $' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setQuestionType(type.id)}
                    className={`p-6 rounded-2xl border-2 transition-all text-left space-y-3 ${
                      questionType === type.id 
                        ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] shadow-xl scale-105' 
                        : 'bg-white border-[#141414]/10 hover:border-[#141414] text-[#141414]'
                    }`}
                  >
                    <type.icon className={`w-8 h-8 ${questionType === type.id ? 'text-yellow-400' : 'opacity-40'}`} />
                    <div>
                      <h3 className="font-bold text-lg">{type.label}</h3>
                      <p className="text-xs opacity-50">{type.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={startTest}
                className="group relative inline-flex items-center gap-3 bg-[#141414] text-[#E4E3E0] px-12 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform active:scale-95 shadow-2xl"
              >
                MULAI SIMULASI
                <Play className="w-5 h-5 fill-current" />
              </button>
            </motion.div>
          )}

          {/* INSTRUCTIONS STATE */}
          {status === TestStatus.INSTRUCTIONS && (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="bg-white border border-[#141414] p-8 rounded-2xl shadow-2xl max-w-2xl w-full space-y-6"
            >
              <div className="flex items-center gap-3 border-b border-[#141414] pb-4">
                <Info className="w-6 h-6" />
                <h3 className="text-2xl font-serif italic font-bold">Instruksi Tes</h3>
              </div>
              
              <div className="space-y-4 text-sm leading-relaxed">
                <p>
                  1. Anda akan diberikan <strong>Master Key</strong> yang berisi 5 karakter dengan label A sampai E.
                </p>
                <p>
                  2. Di bawahnya, akan muncul <strong>4 karakter</strong>. Tentukan karakter mana yang <strong>TIDAK ADA</strong> di antara 4 karakter tersebut namun ada di Master Key.
                </p>
                <p>
                  3. Gunakan keyboard <strong>(A, B, C, D, E)</strong> atau klik tombol yang tersedia.
                </p>
                <p>
                  4. Tes terdiri dari <strong>10 Kolom</strong>, masing-masing berdurasi <strong>60 detik</strong>.
                </p>
                <p className="font-bold text-red-600">
                  5. Akan ada jeda persiapan 5 detik antar kolom. Kolom berganti otomatis.
                </p>
              </div>

              <button 
                onClick={() => startPreparation(0)}
                className="w-full bg-[#141414] text-[#E4E3E0] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
              >
                SAYA MENGERTI, MULAI SEKARANG
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* PREPARATION STATE */}
          {status === TestStatus.PREPARATION && (
            <motion.div 
              key="preparation"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-center space-y-6"
            >
              <h3 className="text-3xl font-serif italic font-bold uppercase tracking-widest opacity-50">Persiapan</h3>
              <div className="text-9xl font-mono font-black">{prepTimeLeft}</div>
              <p className="text-lg font-bold">Kolom {currentRound + 1} akan segera dimulai...</p>
            </motion.div>
          )}

          {/* RUNNING STATE */}
          {status === TestStatus.RUNNING && currentQuestion && (
            <motion.div 
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md space-y-12"
            >
              {/* Master Key */}
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-50 text-center">Master Key</p>
                <div className="grid grid-cols-5 gap-2">
                  {currentQuestion.masterSet.map((char, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-full aspect-square border-2 border-[#141414] flex items-center justify-center text-2xl font-mono font-black bg-white shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                        {char}
                      </div>
                      <span className="text-sm font-black opacity-40">{OPTIONS_MAPPING[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Area */}
              <div className="relative py-12 bg-white border-2 border-[#141414] rounded-2xl shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentQuestion.questionSet.join('')}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="flex justify-center gap-6 text-4xl md:text-5xl font-mono font-black tracking-tighter"
                  >
                    {currentQuestion.questionSet.map((char, i) => (
                      <span key={i}>{char}</span>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Options */}
              <div className="grid grid-cols-5 gap-3">
                {currentQuestion.masterSet.map((char, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(char)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-full aspect-square bg-[#141414] text-[#E4E3E0] flex items-center justify-center text-xl font-black rounded-xl group-hover:scale-105 group-active:scale-95 transition-all shadow-lg">
                      {OPTIONS_MAPPING[i]}
                    </div>
                    <span className="text-[10px] font-bold opacity-30 group-hover:opacity-100 transition-opacity uppercase">Key {OPTIONS_MAPPING[i]}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-center items-center gap-2 pt-4 opacity-30">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Tes Sedang Berlangsung</span>
              </div>
            </motion.div>
          )}

          {/* FINISHED STATE */}
          {status === TestStatus.FINISHED && (
            <motion.div 
              key="finished"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-4xl space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-yellow-400 rounded-full mb-4">
                  <Trophy className="w-12 h-12 text-[#141414]" />
                </div>
                <h2 className="text-5xl font-serif italic font-black">HASIL AKHIR.</h2>
                <p className="opacity-60">Analisis performa Anda di seluruh 10 kolom tes.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-[#141414] p-6 rounded-2xl text-center shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                  <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Total Benar</span>
                  <span className="block text-4xl font-mono font-bold text-green-600">{score.correct}</span>
                </div>
                <div className="bg-white border border-[#141414] p-6 rounded-2xl text-center shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                  <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Total Salah</span>
                  <span className="block text-4xl font-mono font-bold text-red-600">{score.incorrect}</span>
                </div>
                <div className="bg-white border border-[#141414] p-6 rounded-2xl text-center shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                  <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Akurasi</span>
                  <span className="block text-4xl font-mono font-bold">
                    {Math.round((score.correct / (score.correct + score.incorrect || 1)) * 100)}%
                  </span>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-white border border-[#141414] p-6 rounded-2xl shadow-lg h-[400px]">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5" />
                  <h3 className="font-serif italic font-bold text-lg">Grafik Performa Per Kolom</h3>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={roundResults}>
                    <defs>
                      <linearGradient id="colorCorrect" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                    <XAxis 
                      dataKey="roundNumber" 
                      label={{ value: 'Kolom', position: 'insideBottom', offset: -5 }} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#141414', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#E4E3E0'
                      }}
                      itemStyle={{ color: '#E4E3E0' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="correct" 
                      name="Benar" 
                      stroke="#16a34a" 
                      fillOpacity={1} 
                      fill="url(#colorCorrect)" 
                      strokeWidth={3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="incorrect" 
                      name="Salah" 
                      stroke="#dc2626" 
                      fillOpacity={0.1} 
                      fill="#dc2626" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStatus(TestStatus.IDLE)}
                  className="flex-1 bg-[#141414] text-[#E4E3E0] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  KEMBALI KE MENU
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-8 border border-[#141414] py-4 rounded-xl font-bold hover:bg-white transition-colors"
                >
                  CETAK HASIL
                </button>
              </div>
            </motion.div>
          )}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Quit Confirmation Modal */}
      <AnimatePresence>
        {isConfirmingQuit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-2 border-[#141414] p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic font-bold">Akhiri Tes?</h3>
                <p className="text-sm opacity-60">Seluruh progres Anda pada sesi ini akan hilang.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={quitTest}
                  className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  YA, AKHIRI SEKARANG
                </button>
                <button 
                  onClick={() => setIsConfirmingQuit(false)}
                  className="w-full bg-[#E4E3E0] py-3 rounded-xl font-bold hover:bg-white transition-colors"
                >
                  BATAL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isConfirmingLogout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-2 border-[#141414] p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <LogOut className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic font-bold">Keluar Akun?</h3>
                <p className="text-sm opacity-60">Anda harus login kembali untuk mengakses fitur Casis Gacor.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setUser(null);
                    setView('LOGIN');
                    setIsConfirmingLogout(false);
                  }}
                  className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  YA, KELUAR
                </button>
                <button 
                  onClick={() => setIsConfirmingLogout(false)}
                  className="w-full bg-[#E4E3E0] py-3 rounded-xl font-bold hover:bg-white transition-colors"
                >
                  BATAL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="p-8 text-center opacity-30 text-[10px] uppercase tracking-[0.2em] font-bold">
        Casis Gacor &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
