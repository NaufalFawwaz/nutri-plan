// src/pages/register/index.jsx
import { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile  // PERBAIKAN: Tambahkan import updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiMail, FiLock, FiArrowRight, FiHeart, FiUser, FiArrowLeft } from 'react-icons/fi';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password harus minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      // PERBAIKAN: Simpan displayName saat registrasi
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // PERBAIKAN: Update profile dengan nama
      await updateProfile(user, {
        displayName: name
      });

      await signOut(auth);

      router.push('/login?message=registrasi-berhasil');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Link
        href="/"
        className="absolute top-6 left-6 w-12 h-12 bg-white border border-[#f0f0f0] rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:border-[#a8e6cf] hover:bg-[#f8f6f2] transition-all duration-300 group z-10"
      >
        <FiArrowLeft className="w-5 h-5 text-[#8d6e63] group-hover:text-[#a8e6cf] transition-colors duration-300" />
      </Link>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#f8f6f2] to-[#f0ede5] items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center max-w-md">
          <Link
            href="/"
            className="flex flex-col items-center space-y-4 mb-12 group"
          >
            <div className="w-20 h-20 bg-[#a8e6cf] rounded-2xl rotate-45 flex items-center justify-center group-hover:rotate-90 group-hover:scale-110 transition-all duration-500 ease-out">
              <FiHeart className="w-10 h-10 text-white -rotate-45 group-hover:-rotate-90 transition-transform duration-500" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-[#5d4037] leading-12">
                Nutri<span className="text-[#a8e6cf]">Plan</span>
              </span>
              <span className="text-lg text-[#8d6e63] mt-2">Healthy Living</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link
              href="/"
              className="flex flex-col items-center space-y-3 group"
            >
              <div className="w-16 h-16 bg-[#a8e6cf] rounded-2xl rotate-45 flex items-center justify-center group-hover:rotate-90 group-hover:scale-110 transition-all duration-500 ease-out">
                <FiHeart className="w-8 h-8 text-white -rotate-45 group-hover:-rotate-90 transition-transform duration-500" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[#5d4037] leading-8">
                  Nutri<span className="text-[#a8e6cf]">Plan</span>
                </span>
                <span className="text-sm text-[#8d6e63]">Healthy Living</span>
              </div>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#5d4037] mb-2">Buat Akun Baru</h2>
            <p className="text-[#8d6e63]">Daftar untuk mulai perjalanan sehat Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${isFocused.name || name ? 'top-3 translate-y-0 text-[#a8e6cf]' : 'text-[#b0bec5]'
                }`}>
                <FiUser className="w-5 h-5" />
              </div>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setIsFocused(prev => ({ ...prev, name: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, name: false }))}
                className="w-full pl-12 pr-4 py-4 bg-[#fafafa] border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#a8e6cf] focus:bg-white text-[#5d4037] placeholder-transparent transition-all duration-300"
                placeholder="Nama Lengkap"
              />
              <label
                htmlFor="name"
                className={`absolute left-12 transition-all duration-300 cursor-text ${isFocused.name || name
                    ? 'top-2 text-xs text-[#a8e6cf]'
                    : 'top-1/2 transform -translate-y-1/2 text-[#8d6e63]'
                  }`}
              >
                Nama Lengkap
              </label>
            </div>

            <div className="relative">
              <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${isFocused.email || email ? 'top-3 translate-y-0 text-[#a8e6cf]' : 'text-[#b0bec5]'
                }`}>
                <FiMail className="w-5 h-5" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                className="w-full pl-12 pr-4 py-4 bg-[#fafafa] border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#a8e6cf] focus:bg-white text-[#5d4037] placeholder-transparent transition-all duration-300"
                placeholder="Email"
              />
              <label
                htmlFor="email"
                className={`absolute left-12 transition-all duration-300 cursor-text ${isFocused.email || email
                    ? 'top-2 text-xs text-[#a8e6cf]'
                    : 'top-1/2 transform -translate-y-1/2 text-[#8d6e63]'
                  }`}
              >
                Alamat Email
              </label>
            </div>

            <div className="relative">
              <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${isFocused.password || password ? 'top-3 translate-y-0 text-[#a8e6cf]' : 'text-[#b0bec5]'
                }`}>
                <FiLock className="w-5 h-5" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                className="w-full pl-12 pr-12 py-4 bg-[#fafafa] border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#a8e6cf] focus:bg-white text-[#5d4037] placeholder-transparent transition-all duration-300"
                placeholder="Password"
              />
              <label
                htmlFor="password"
                className={`absolute left-12 transition-all duration-300 cursor-text ${isFocused.password || password
                    ? 'top-2 text-xs text-[#a8e6cf]'
                    : 'top-1/2 transform -translate-y-1/2 text-[#8d6e63]'
                  }`}
              >
                Password (minimal 6 karakter)
              </label>
            </div>

            <div className="relative">
              <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${isFocused.confirmPassword || confirmPassword ? 'top-3 translate-y-0 text-[#a8e6cf]' : 'text-[#b0bec5]'
                }`}>
                <FiLock className="w-5 h-5" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setIsFocused(prev => ({ ...prev, confirmPassword: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, confirmPassword: false }))}
                className="w-full pl-12 pr-12 py-4 bg-[#fafafa] border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#a8e6cf] focus:bg-white text-[#5d4037] placeholder-transparent transition-all duration-300"
                placeholder="Konfirmasi Password"
              />
              <label
                htmlFor="confirmPassword"
                className={`absolute left-12 transition-all duration-300 cursor-text ${isFocused.confirmPassword || confirmPassword
                    ? 'top-2 text-xs text-[#a8e6cf]'
                    : 'top-1/2 transform -translate-y-1/2 text-[#8d6e63]'
                  }`}
              >
                Konfirmasi Password
              </label>
            </div>

            {error && (
              <div className="p-4 bg-[#ffebee] border-l-4 border-[#ff5252] rounded-lg animate-shake">
                <p className="text-[#d32f2f] text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full cursor-pointer inline-block px-6 py-4 bg-[#a8e6cf] text-white font-semibold text-base rounded-lg shadow-[4px_4px_0px_0px_rgba(93,64,55,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200 ease-in-out transform hover:bg-[#88d4b2] focus:outline-none focus:ring-2 focus:ring-[#a8e6cf] ${loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <span>{loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}</span>
                <FiArrowRight className={`w-5 h-5 transition-transform duration-300 ${loading ? '' : 'group-hover:translate-x-1'
                  }`} />
              </div>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#8d6e63]">
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className="text-[#a8e6cf] font-semibold hover:text-[#88d4b2] transition-colors duration-200 inline-flex items-center space-x-1 group"
              >
                <span>Masuk di sini</span>
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}