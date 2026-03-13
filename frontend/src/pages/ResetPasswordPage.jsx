import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Eye, EyeOff, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (!token) {
            setIsError(true);
            setMessage('Invalid or missing reset token.');
            return;
        }

        if (password !== confirmPassword) {
            setIsError(true);
            setMessage('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setIsError(true);
            setMessage('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
                token,
                newPassword: password
            });
            setIsError(false);
            setIsSuccess(true);
            setMessage(response.data.message || 'Password successfully reset.');

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setIsError(true);
            setMessage(err.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!token && !isError) {
        return (
            <div className="min-h-screen bg-portalBgLight flex flex-col justify-center items-center px-4 font-sans">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center max-w-md w-full">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
                    <p className="text-gray-600 mb-6">The password reset link is invalid or missing the required token.</p>
                    <Link to="/forgot-password" className="inline-block bg-portalBlue text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors">
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-portalBgLight bg-gradient-to-br from-white to-gray-200 flex flex-col pt-8 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md mx-auto w-full mb-8 px-4 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-portalBlue rounded-full flex items-center justify-center text-white shadow-md">
                        <BookOpen size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-portalBlue tracking-tight uppercase">GITA College</h2>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-portalBlue mb-2">Set New Password</h1>
                <p className="text-portalTextGray text-base sm:text-lg">Please enter your new password below</p>

                {message && (
                    <div className={`mt-6 p-4 rounded-md flex items-center shadow-sm w-full mx-auto ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {isError && <AlertCircle size={20} className="mr-2 flex-shrink-0" />}
                        <span className="font-medium text-left">{message}</span>
                    </div>
                )}
            </div>

            <div className="max-w-md mx-auto w-full px-4">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-8 flex-grow">
                        {isSuccess ? (
                            <div className="text-center py-6">
                                <h3 className="text-xl font-bold text-green-600 mb-4">Success!</h3>
                                <p className="text-gray-600 mb-6">Your password has been reset. You will be redirected to the login page shortly.</p>
                                <Link to="/login" className="inline-block bg-portalBlue text-white w-full py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors">
                                    Go to Login Now
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-portalBlue focus:border-portalBlue sm:text-sm transition-colors"
                                        placeholder="New Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-portalBlue focus:border-portalBlue sm:text-sm transition-colors"
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !password || !confirmPassword}
                                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-portalBlue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-portalBlue transition-colors disabled:opacity-70 mt-4"
                                >
                                    {loading ? 'Resetting...' : 'Set New Password'}
                                </button>
                            </form>
                        )}
                    </div>

                    {!isSuccess && (
                        <div className="bg-gray-50 p-6 border-t border-gray-100 flex items-center justify-center">
                            <Link to="/login" className="flex items-center text-sm font-medium text-portalBlue hover:text-blue-800 transition-colors">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-auto pt-8 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} GITA College. All rights reserved.
            </div>
        </div>
    );
};

export default ResetPasswordPage;
