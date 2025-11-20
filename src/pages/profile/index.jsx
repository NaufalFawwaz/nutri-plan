import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiSave, FiArrowLeft, FiEdit, FiTrash2, FiHeart } from 'react-icons/fi';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                displayName: user.displayName || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await updateProfile(user, {
                displayName: formData.displayName
            });

            await auth.currentUser.reload();

            window.dispatchEvent(new CustomEvent('userProfileUpdated'));

            setSuccess('Profile berhasil diperbarui!');
            setIsEditing(false);
        } catch (error) {
            setError('Gagal memperbarui profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Password baru tidak cocok');
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Password baru harus minimal 6 karakter');
            setLoading(false);
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(
                user.email,
                formData.currentPassword
            );

            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, formData.newPassword);

            setSuccess('Password berhasil diubah!');
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error) {
            setError('Gagal mengubah password: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await deleteUser(user);
            router.push('/');
        } catch (error) {
            setError('Gagal menghapus akun: ' + error.message);
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8e6cf]"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-br from-[#f8f6f2] to-[#f0ede5] py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-[#8d6e63] hover:text-[#5d4037] transition-colors duration-200 mb-6"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#a8e6cf] to-[#88d4b2] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#5d4037]">
                                {user.displayName || user.email?.split('@')[0] || 'Pengguna'}
                            </h1>
                            <p className="text-[#8d6e63]">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="border-b border-[#f0f0f0] mb-8">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                ? 'border-[#a8e6cf] text-[#5d4037]'
                                : 'border-transparent text-[#8d6e63] hover:text-[#5d4037] hover:border-[#a8e6cf]'
                                }`}
                        >
                            <FiUser className="w-4 h-4 inline mr-2" />
                            Informasi Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'password'
                                ? 'border-[#a8e6cf] text-[#5d4037]'
                                : 'border-transparent text-[#8d6e63] hover:text-[#5d4037] hover:border-[#a8e6cf]'
                                }`}
                        >
                            <FiLock className="w-4 h-4 inline mr-2" />
                            Ubah Password
                        </button>
                    </nav>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-[#ffebee] border-l-4 border-[#ff5252] rounded-lg">
                        <p className="text-[#d32f2f] text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-[#e8f5e8] border-l-4 border-[#4caf50] rounded-lg">
                        <p className="text-[#2e7d32] text-sm">{success}</p>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#5d4037]">Informasi Profile</h2>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center space-x-2 px-4 py-2 text-[#a8e6cf] hover:text-[#88d4b2] transition-colors duration-200"
                                >
                                    <FiEdit className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleUpdateProfile}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#5d4037] mb-2">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing || loading}
                                        className="w-full px-4 py-3 bg-[#fafafa] border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#a8e6cf] text-[#5d4037] transition-all duration-300 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#5d4037] mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-transparent rounded-2xl text-[#8d6e63] opacity-70"
                                    />
                                    <p className="text-xs text-[#8d6e63] mt-1">
                                        Email tidak dapat diubah
                                    </p>
                                </div>

                                {isEditing && (
                                    <div className="flex space-x-4 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-3 bg-[#a8e6cf] text-white font-semibold rounded-lg shadow-[4px_4px_0px_0px_rgba(93,64,55,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200 ease-in-out transform hover:bg-[#88d4b2] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            <FiSave className="w-4 h-4" />
                                            <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    displayName: user.displayName || ''
                                                }));
                                            }}
                                            className="px-6 py-3 border border-[#f0f0f0] text-[#8d6e63] font-medium rounded-lg hover:bg-[#f8f6f2] transition-colors duration-200"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'password' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] p-6">
                        <h2 className="text-xl font-bold text-[#5d4037] mb-6">Ubah Password</h2>

                        <form onSubmit={handleChangePassword}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#5d4037] mb-2">
                                        Password Saat Ini
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        required
                                        className="w-full px-4 py-3 bg-[#fafafa] border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#a8e6cf] text-[#5d4037] transition-all duration-300 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#5d4037] mb-2">
                                        Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-3 bg-[#fafafa] border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#a8e6cf] text-[#5d4037] transition-all duration-300 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#5d4037] mb-2">
                                        Konfirmasi Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-3 bg-[#fafafa] border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#a8e6cf] text-[#5d4037] transition-all duration-300 disabled:opacity-50"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-[#a8e6cf] text-white font-semibold rounded-lg shadow-[4px_4px_0px_0px_rgba(93,64,55,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200 ease-in-out transform hover:bg-[#88d4b2] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <FiSave className="w-4 h-4" />
                                    <span>{loading ? 'Mengubah...' : 'Ubah Password'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="mt-8 bg-white rounded-2xl shadow-sm border border-[#ffebee] p-6">
                    <h2 className="text-xl font-bold text-[#d32f2f] mb-4">Red Zone</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="font-medium text-[#5d4037]">Hapus Akun</h3>
                            <p className="text-sm text-[#8d6e63] mt-1">
                                Tindakan ini akan menghapus akun Anda secara permanen dan tidak dapat dibatalkan.
                            </p>
                        </div>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={loading}
                            className="px-6 py-3 bg-[#ffebee] text-[#d32f2f] font-medium rounded-lg hover:bg-[#ffcdd2] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full sm:w-auto"
                        >
                            <FiTrash2 className="w-4 h-4" />
                            <span>Hapus Akun</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}