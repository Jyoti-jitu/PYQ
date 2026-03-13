import React, { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft, BookOpen, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
                email: email
            });
            setIsError(false);
            setMessage(response.data.message || 'If an account with that email exists, a reset link has been generated.');
        } catch (err) {
            setIsError(true);
            setMessage(err.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-portalBgLight bg-gradient-to-br from-white to-gray-200 flex flex-col pt-8 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md mx-auto w-full mb-8 px-4 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-portalBlue rounded-full flex items-center justify-center text-white shadow-md">
                        <BookOpen size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-portalBlue tracking-tight uppercase">GITA College</h2>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-portalBlue mb-2">Password Reset</h1>
                <p className="text-portalTextGray text-base sm:text-lg">Retrieve access to your account</p>

                {message && (
                    <div className={`mt-6 p-4 rounded-md flex items-center shadow-sm w-full mx-auto ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {isError && <AlertCircle size={20} className="mr-2" />}
                        <span className="font-medium text-left">{message}</span>
                    </div>
                )}
            </div>

            <div className="max-w-md mx-auto w-full px-4">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-8 flex-grow">
                        <h3 className="text-xl font-bold text-portalBlue border-b-2 border-gray-100 pb-4 mb-6 text-center">
                            Forgot your password?
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 text-center">
                            Enter your email address and we will send you a link to reset your password.
                        </p>

                        <form onSubmit={handleForgotPassword} className="space-y-5">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-portalBlue focus:border-portalBlue sm:text-sm transition-colors"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-portalBlue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-portalBlue transition-colors disabled:opacity-70"
                            >
                                {loading ? 'Sending request...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-50 p-6 border-t border-gray-100 flex items-center justify-center">
                        <Link to="/login" className="flex items-center text-sm font-medium text-portalBlue hover:text-blue-800 transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
            <div className="mt-auto pt-8 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} GITA College. All rights reserved.
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
