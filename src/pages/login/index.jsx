import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiMail, FiLock, FiArrowRight, FiHeart, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { message } = router.query;
    if (message === 'registrasi-berhasil') {
      setSuccessMessage('Registrasi berhasil! Silakan login dengan akun Anda.');

      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      router.push('/');
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
            <h2 className="text-3xl font-bold text-[#5d4037] mb-2">Selamat Datang</h2>
            <p className="text-[#8d6e63]">Silakan masuk ke akun Anda</p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-[#e8f5e8] border-l-4 border-[#4caf50] rounded-lg animate-fadeIn">
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="w-5 h-5 text-[#2e7d32] flex-shrink-0" />
                <p className="text-[#2e7d32] text-sm">{successMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                isFocused.email || email ? 'top-3 translate-y-0 text-[#a8e6cf]' : 'text-[#b0bec5]'
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
                className={`absolute left-12 transition-all duration-300 cursor-text ${
                  isFocused.email || email 
                    ? 'top-2 text-xs text-[#a8e6cf]' 
                    : 'top-1/2 transform -translate-y-1/2 text-[#8d6e63]'
                }`}
              >
                Alamat Email
              </label>
            </div>

            <div className="relative">
              <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                isFocused.password || password ? 'top-3 translate-y-0 text-[#a8e6cf]' : 'text-[#b0bec5]'
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
                className={`absolute left-12 transition-all duration-300 cursor-text ${
                  isFocused.password || password 
                    ? 'top-2 text-xs text-[#a8e6cf]' 
                    : 'top-1/2 transform -translate-y-1/2 text-[#8d6e63]'
                }`}
              >
                Password
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
              className={`w-full py-4 px-6 font-semibold rounded-lg transition-all duration-200 ease-in-out transform flex items-center justify-center space-x-3 group ${
                loading
                  ? 'bg-[#cfd8dc] text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-[#a8e6cf] text-white shadow-[4px_4px_0px_0px_rgba(93,64,55,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-[#88d4b2]'
              }`}
            >
              <span>{loading ? 'Memproses...' : 'Masuk ke Akun'}</span>
              <FiArrowRight className={`w-5 h-5 transition-transform duration-300 ${
                loading ? '' : 'group-hover:translate-x-1'
              }`} />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#f0f0f0]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#8d6e63]">Atau lanjutkan dengan</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-lg transition-all duration-200 ease-in-out transform ${
                loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border-gray-300'
                  : 'bg-white text-[#5d4037] border-2 border-[#f0f0f0] shadow-[4px_4px_0px_0px_rgba(93,64,55,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:border-[#a8e6cf] hover:bg-[#f8f6f2]'
              }`}
            >
              <FcGoogle className="w-5 h-5" />
              <span className="font-medium">Lanjutkan dengan Google</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[#8d6e63]">
              Belum punya akun?{' '}
              <Link 
                href="/register" 
                className="text-[#a8e6cf] font-semibold hover:text-[#88d4b2] transition-colors duration-200 inline-flex items-center space-x-1 group"
              >
                <span>Daftar sekarang</span>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}